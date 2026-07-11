#!/bin/bash
# SyncPhotos - 双击运行，同步照片到图库
# 路径：~/Documents/GitHub/smwswk.github.io/scripts/SyncPhotos.command

DIR="$(cd "$(dirname "$0")/.." && pwd)"
"$DIR/sync_photos.sh"

echo ""
echo "✅ 同步完成，按 Enter 退出..."
read
