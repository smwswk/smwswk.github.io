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
