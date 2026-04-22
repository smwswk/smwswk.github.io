#!/usr/bin/env bash
# ============================================================
# sync_photos.sh — SMWSWK Photography Site Sync Script
# ============================================================
# 核心设计：用 Python 做内容哈希去重（SHA-256），bash 做流程控制。
# 内容哈希替代文件时间戳，无论老照片新上传还是重命名，都能正确识别。
#
# 流程：
#   1. Python 读取 manifest（已同步图片的哈希清单）
#   2. 扫描 photo/，计算 SHA-256 逐张对比
#   3. 新增 → 生成缩略图+web大图；已存在 → 跳过；消失 → 从 manifest 移除
#   4. Python 生成 data/photos.json
#   5. Hugo 构建 → public/
#   6. git add + commit + push
#
# 用法：
#   bash sync_photos.sh          完整同步+构建+推送
#   bash sync_photos.sh --build  仅构建（跳过图片同步）
#   bash sync_photos.sh --status 检查变更状态
#   bash sync_photos.sh --force  强制重建所有缩略图+推送

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PHOTO_SRC="${REPO_DIR}/photo"
STATIC_PHOTO="${REPO_DIR}/static/photo"
THUMBS_DIR="${REPO_DIR}/static/photo/thumbs"
WEB_DIR="${REPO_DIR}/static/photo/web"
DATA_FILE="${REPO_DIR}/data/photos.json"
MANIFEST="${REPO_DIR}/.photo_manifest"
HUGO_MARKER="${REPO_DIR}/.hugo_synced"
PYTHON_SYNC="${REPO_DIR}/.sync_photos.py"

cd "$REPO_DIR"

# ── 颜色 ──
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
log()  { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠${RESET} $1"; }
info() { echo -e "${CYAN}→${RESET} $1"; }
err()  { echo -e "${RED}✗${RESET} $1" >&2; }

# ── 依赖检查 ──
check_deps() {
  for cmd in python3 convert jq hugo git shasum; do
    if ! command -v $cmd &>/dev/null; then
      err "缺少依赖：$cmd"
      [[ "$cmd" == "hugo"    ]] && err "  安装：brew install hugo"
      [[ "$cmd" == "convert" ]] && err "  安装：brew install imagemagick"
      [[ "$cmd" == "jq"      ]] && err "  安装：brew install jq"
      [[ "$cmd" == "python3" ]] && err "  安装：brew install python3"
      exit 1
    fi
  done
}

# ── 创建目录 ──
setup() {
  mkdir -p "$STATIC_PHOTO" "$THUMBS_DIR" "$WEB_DIR"
}

# ── 生成 Python 同步脚本（嵌入 bash 以保证单文件） ──
cat > "$PYTHON_SYNC" << 'PYEOF'
#!/usr/bin/env python3
"""Photo sync core: manifest-based content hash deduplication."""
import os
import sys
import json
import subprocess
import hashlib
import re
from pathlib import Path

REPO_DIR = Path(os.environ.get('REPO_DIR', '.'))
PHOTO_SRC = REPO_DIR / 'photo'
STATIC_PHOTO = REPO_DIR / 'static' / 'photo'
THUMBS_DIR = REPO_DIR / 'static' / 'photo' / 'thumbs'
WEB_DIR = REPO_DIR / 'static' / 'photo' / 'web'
DATA_FILE = REPO_DIR / 'data' / 'photos.json'
MANIFEST = REPO_DIR / '.photo_manifest'
MANIFEST_TMP = REPO_DIR / '.photo_manifest.tmp'

EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.tiff')

def log(msg):
    print(f"\033[0;32m✓\033[0m {msg}")

def info(msg):
    print(f"\033[0;36m→\033[0m {msg}")

def warn(msg):
    print(f"\033[1;33m⚠\033[0m {msg}")

def file_sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def get_photo_date(path):
    # Try EXIF DateTimeOriginal first
    try:
        result = subprocess.run(
            ['identify', '-format', '%[EXIF:DateTimeOriginal]', str(path)],
            capture_output=True, text=True, timeout=10
        )
        date = result.stdout.strip()
        if date:
            # 2023:08:15 14:30:00 → 2023-08-15T14:30
            date = re.sub(r'(\d{4}):(\d{2}):(\d{2}) (.+)', r'\1-\2-\3T\4', date)
            return date
    except Exception:
        pass
    # Fallback: file mtime
    try:
        mtime = os.path.getmtime(path)
        from datetime import datetime
        return datetime.fromtimestamp(mtime).strftime('%Y-%m-%dT%H:%M')
    except Exception:
        return 'unknown'

def generate_thumb(src, dst):
    for geom in ['600x600\\>', '600x600>']:
        try:
            result = subprocess.run(
                ['convert', str(src), '-resize', geom, '-quality', '80',
                 '-sampling-factor', '2x2', str(dst)],
                capture_output=True, timeout=60
            )
            if result.returncode == 0:
                return True
        except Exception:
            pass
    # Fallback: copy original
    try:
        import shutil
        shutil.copy2(src, dst)
        return True
    except Exception:
        return False

def generate_web(src, dst):
    for geom in ['1920x1920\\>', '1920x1920>']:
        try:
            result = subprocess.run(
                ['convert', str(src), '-resize', geom, '-quality', '85', str(dst)],
                capture_output=True, timeout=120
            )
            if result.returncode == 0:
                return True
        except Exception:
            pass
    try:
        import shutil
        shutil.copy2(src, dst)
        return True
    except Exception:
        return False

def main():
    force = '--force' in sys.argv

    # Read manifest: {sha: filename}
    manifest = {}
    if MANIFEST.exists():
        with open(MANIFEST) as f:
            for line in f:
                line = line.strip()
                if '|' in line:
                    sha, fname = line.split('|', 1)
                    manifest[sha] = fname.strip()

    # Scan photo/ source
    if not PHOTO_SRC.exists():
        warn("photo/ 目录不存在")
        with open(DATA_FILE, 'w') as f:
            json.dump({'list': []}, f)
        return

    src_files = {}
    for p in PHOTO_SRC.iterdir():
        if p.is_file() and p.suffix.lower() in EXTENSIONS:
            try:
                sha = file_sha(p)
                src_files[sha] = p.name
            except Exception as e:
                warn(f"无法读取：{p.name} ({e})")

    if not src_files:
        warn("photo/ 中没有找到图片")
        with open(DATA_FILE, 'w') as f:
            json.dump({'list': []}, f)
        return

    log(f"发现 {len(src_files)} 张照片（基于 SHA-256 内容哈希去重）")

    # Process files
    new_count = skip_count = 0
    json_entries = []

    for sha, fname in src_files.items():
        src_path = PHOTO_SRC / fname
        stem = Path(fname).stem
        thumb_path = THUMBS_DIR / f"{stem}.jpg"
        web_path = WEB_DIR / f"{stem}.jpg"

        is_new = sha not in manifest
        need_thumb = is_new or not thumb_path.exists() or force
        need_web = is_new or not web_path.exists() or force

        if is_new:
            info(f"新增：{fname}")
        elif need_thumb:
            info(f"重新生成缩略图：{fname}")

        if need_thumb:
            ok = generate_thumb(src_path, thumb_path)
            if not ok:
                warn(f"缩图失败：{fname}")
            else:
                new_count += 1
        else:
            skip_count += 1

        if need_web:
            generate_web(src_path, web_path)

        # Update manifest
        manifest[sha] = fname

        # Build JSON entry
        date = get_photo_date(src_path)
        json_entries.append({'name': fname, 'date': date})

    # Write manifest
    with open(MANIFEST_TMP, 'w') as f:
        for sha, fname in manifest.items():
            f.write(f"{sha}|{fname}\n")
    MANIFEST_TMP.replace(MANIFEST)

    # Sort JSON by date descending
    json_entries.sort(key=lambda x: x.get('date', ''), reverse=True)

    with open(DATA_FILE, 'w') as f:
        json.dump({'list': json_entries}, f, indent=2)

    # Touch marker
    REPO_DIR.joinpath('.hugo_synced').touch()

    log(f"同步完成：新增/更新 {new_count} 张，跳过 {skip_count} 张，共追踪 {len(manifest)} 张")

if __name__ == '__main__':
    main()
PYEOF

chmod +x "$PYTHON_SYNC"

# ── Hugo 构建 ──
hugo_build() {
  if [[ ! -f "$HUGO_MARKER" ]]; then
    warn "没有变更，跳过 Hugo 构建（运行 bash sync_photos.sh --force 强制构建）"
    return 0
  fi

  info "构建 Hugo 站点..."
  hugo --destination public 2>&1 | grep -E "(built|files|pages)" || true
  log "Hugo 构建完成"

  # 同步 public/ 到根目录（GitHub Pages 从根目录部署）
  info "同步 public/ 到根目录..."
  cp -f "$REPO_DIR/public/index.html" "$REPO_DIR/index.html" 2>/dev/null || true
  cp -Rf "$REPO_DIR/public/photo/index.html" "$REPO_DIR/photo/index.html" 2>/dev/null || true
  cp -Rf "$REPO_DIR/public/photo/index.xml" "$REPO_DIR/photo/index.xml" 2>/dev/null || true
  cp -Rf "$REPO_DIR/public/css/" "$REPO_DIR/css/" 2>/dev/null || true

  rm -f "$HUGO_MARKER"
}

# ── Git 提交并推送 ──
git_commit_push() {
  if ! git rev-parse --git-dir &>/dev/null; then
    warn "不是 Git 仓库，跳过提交"
    return 0
  fi

  git add photo/ static/photo/ data/photos.json public/ index.html css/ ".photo_manifest" ".sync_photos.py" 2>/dev/null || true

  if git diff --cached --quiet 2>/dev/null; then
    info "没有新的 Git 变更"
    return 0
  fi

  local count=$(git diff --cached --stat | tail -1 | awk '{print $2}')
  local stamp=$(date "+%Y-%m-%d %H:%M")
  git commit -m "📷 sync: ${stamp} — ${count}"

  if git push origin "$(git branch --show-current 2>/dev/null || echo 'master')" 2>&1; then
    log "已推送到 GitHub"
  else
    warn "推送失败，请在 GitHub Desktop 手动推送"
  fi
}

# ── 主流程 ──
main() {
  echo -e "\n${BOLD}═══ SMWSWK Photo Sync ═══${RESET}\n"
  check_deps
  setup

  case "${1:-}" in
    --build)
      python3 "$PYTHON_SYNC"
      hugo_build
      echo "✓ 构建完成（未推送）"
      ;;
    --status)
      python3 "$PYTHON_SYNC" --status 2>/dev/null || true
      git status --short photo/ static/photo/ data/photos.json ".photo_manifest" 2>/dev/null || echo "无变更"
      echo "--- Manifest ---"
      cat "$MANIFEST" 2>/dev/null || echo "(空)"
      ;;
    --force)
      warn "强制模式：清空 manifest，重新处理所有图片"
      rm -f "$MANIFEST" "$HUGO_MARKER"
      python3 "$PYTHON_SYNC"
      hugo_build; git_commit_push
      ;;
    --*)
      echo "用法：$0 [--build|--status|--force]"
      exit 1
      ;;
    *)
      python3 "$PYTHON_SYNC"
      hugo_build; git_commit_push
      ;;
  esac

  echo -e "\n${BOLD}✓ 完成${RESET}\n"
}

main "$@"
