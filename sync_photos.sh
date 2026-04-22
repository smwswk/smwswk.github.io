#!/usr/bin/env bash
# ============================================================
# sync_photos.sh — SMWSWK Photography Site Sync Script
# ============================================================
# 1. 扫描 photo/ 源文件夹
# 2. 生成缩略图 → static/photo/thumbs/
# 3. 复制原图   → static/photo/
# 4. 生成 data/photos.json（Hugo 图库数据）
# 5. 构建 Hugo  → public/
# 6. git add + commit + push（仅当有变更时）
#
# 用法：
#   bash sync_photos.sh          完整同步+构建+推送
#   bash sync_photos.sh --build  仅构建（跳过同步）
#   bash sync_photos.sh --status 检查变更状态

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PHOTO_SRC="${REPO_DIR}/photo"
STATIC_PHOTO="${REPO_DIR}/static/photo"
THUMBS_DIR="${REPO_DIR}/static/photo/thumbs"
DATA_FILE="${REPO_DIR}/data/photos.json"
HUGO_MARKER="${REPO_DIR}/.hugo_synced"

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
  for cmd in convert jq hugo git; do
    if ! command -v $cmd &>/dev/null; then
      err "缺少依赖：$cmd"
      [[ "$cmd" == "hugo"   ]] && err "  安装：brew install hugo"
      [[ "$cmd" == "convert" ]] && err "  安装：brew install imagemagick"
      [[ "$cmd" == "jq"      ]] && err "  安装：brew install jq"
      exit 1
    fi
  done
}

# ── 创建目录 ──
setup() {
  mkdir -p "$STATIC_PHOTO" "$THUMBS_DIR" "${STATIC_PHOTO}/web"
}

# ── 同步照片 ──
sync_photos() {
  if [[ ! -d "$PHOTO_SRC" ]]; then
    warn "photo/ 目录不存在，跳过图片同步"
    echo '{"list":[]}' > "$DATA_FILE"
    return 0
  fi

  # 用 find + while 读图片（兼容 macOS 旧 bash）
  src_files=()
  while IFS= read -r f; do
    src_files+=("$f")
  done < <(find "$PHOTO_SRC" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.tiff" \) -type f | sort)

  if [[ ${#src_files[@]} -eq 0 ]]; then
    warn "photo/ 中没有找到图片"
    echo '{"list":[]}' > "$DATA_FILE"
    return 0
  fi

  log "发现 ${#src_files[@]} 张照片，开始处理..."
  local count=0

  for src in "${src_files[@]}"; do
    local basename=$(basename "$src")
    local stem="${basename%.*}"
    local dst="${STATIC_PHOTO}/${basename}"
    local thumb="${THUMBS_DIR}/${stem}.jpg"

    # 复制原图
    if [[ ! -f "$dst" ]] || [[ "$(stat -c%s "$src" 2>/dev/null)" != "$(stat -c%s "$dst" 2>/dev/null)" ]]; then
      cp "$src" "$dst"
      info "复制：$basename"
    fi

    # 生成/更新缩略图（600px宽，JPEG 80%）
    if [[ ! -f "$thumb" ]] || [[ "$src" -nt "$thumb" ]]; then
      convert "$src" -resize 600x600\> -quality 80 -sampling-factor 2x2 "$thumb" 2>/dev/null || \
      convert "$src" -resize 600x600\> -quality 80 "$thumb" 2>/dev/null || {
        warn "缩图失败，复制原图代替：$basename"
        cp "$src" "$thumb"
      }
      info "缩图：${stem}.jpg"
    fi

    # 生成/更新 web 版大图（1920px宽，JPEG 85%）
    local webimg="${STATIC_PHOTO}/web/${stem}.jpg"
    if [[ ! -f "$webimg" ]] || [[ "$src" -nt "$webimg" ]]; then
      convert "$src" -resize 1920x1920\> -quality 85 "$webimg" 2>/dev/null || {
        warn "web 图生成失败，复制原图代替：$basename"
        cp "$src" "$webimg"
      }
      info "web图：${stem}.jpg"
    fi

    ((count++))
  done

  log "图片同步完成：$count 张"
  touch "$HUGO_MARKER"
}

# ── 生成 Hugo data/photos.json ──
generate_data() {
  # 用 find + while 读文件（兼容 macOS）
  dst_files=()
  while IFS= read -r f; do
    dst_files+=("$f")
  done < <(find "$STATIC_PHOTO" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.tiff" \) -type f | sort)

  local json='{"list":['
  local first=true

  for f in "${dst_files[@]:-}"; do
    [[ -z "$f" ]] && continue
    local basename=$(basename "$f")
    local date

    # 尝试从 EXIF 读拍摄日期
    date=$(identify -format "%[EXIF:DateTimeOriginal]" "$f" 2>/dev/null || echo "")
    [[ -z "$date" ]] && date=$(date -r "$(stat -c%Y "$f" 2>/dev/null)" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "unknown")

    [[ "$first" == true ]] && first=false || json+=','
    json+=$(printf '\n    {"name":"%s","date":"%s"}' "$basename" "$date")
  done

  json+=']}'
  echo "$json" > "$DATA_FILE"
  info "生成图库数据：${#dst_files[@]} 张"
}

# ── Hugo 构建 ──
hugo_build() {
  if [[ ! -f "$HUGO_MARKER" ]]; then
    warn "没有变更，跳过 Hugo 构建（运行 bash sync_photos.sh --force 强制构建）"
    return 0
  fi

  info "构建 Hugo 站点..."
  hugo --destination public 2>&1 | grep -E "(built|files|pages)" || true
  log "Hugo 构建完成"
  rm -f "$HUGO_MARKER"
}

# ── Git 提交并推送 ──
git_commit_push() {
  if ! git rev-parse --git-dir &>/dev/null; then
    warn "不是 Git 仓库，跳过提交"
    return 0
  fi

  git add photo/ static/photo/ data/photos.json public/ 2>/dev/null || true

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
    --build)   sync_photos; generate_data; hugo_build; echo "✓ 构建完成（未推送）" ;;
    --status)  git status --short photo/ static/photo/ data/photos.json 2>/dev/null || echo "无变更" ;;
    --force)   touch "$HUGO_MARKER"; hugo_build; git_commit_push ;;
    --*)       echo "用法：$0 [--build|--status|--force]"; exit 1 ;;
    *)         sync_photos; generate_data; hugo_build; git_commit_push ;;
  esac

  echo -e "\n${BOLD}✓ 完成${RESET}\n"
}

main "$@"
