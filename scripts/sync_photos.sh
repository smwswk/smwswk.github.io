#!/bin/bash
# ============================================================
# SyncPhotos - 同步照片到 Hugo 图库
# 用法：bash sync_photos.sh
# ============================================================

set -e

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$BASE_DIR/photo"
STATIC="$BASE_DIR/static/photo"
THUMBS="$STATIC/thumbs"
DATA_FILE="$BASE_DIR/data/photos.json"
SCRIPT_FILE="$BASE_DIR/scripts/SyncPhotos.command"
HUGO_BASE="$BASE_DIR"

echo "🔄 SyncPhotos 开始..."
echo "📂 源目录: $SRC"

# 检查源目录
if [ ! -d "$SRC" ]; then
    echo "⚠️  源目录 $SRC 不存在，跳过同步"
    exit 0
fi

mkdir -p "$STATIC" "$THUMBS"

# 复制原图到 static/photo/（跳过已存在的）
shopt -s nullglob
for ext in jpg JPG jpeg JPEG png PNG tif TIF tiff TIFF; do
    for f in "$SRC"/*."$ext"; do
        [ -e "$f" ] || continue
        fname=$(basename "$f")
        if [ ! -f "$STATIC/$fname" ]; then
            cp "$f" "$STATIC/$fname"
            echo "  ✅ 复制原图: $fname"
        fi
    done
done
shopt -u nullglob

# 生成缩略图（跳过已存在的）
shopt -s nullglob
for ext in jpg JPG jpeg JPEG png PNG; do
    for f in "$SRC"/*."$ext"; do
        [ -e "$f" ] || continue
        fname=$(basename "$f")
        out="$THUMBS/$fname"

        if [ ! -f "$out" ]; then
            sips -Z 800 "$f" --out "$out" 2>/dev/null \
                && echo "  🖼️  缩图: $fname → 800px"
        fi
    done
done
shopt -u nullglob

# 生成 data/photos.json
echo "📝 生成图库索引..."
photos_json='['
first=true
shopt -s nullglob
for ext in jpg JPG jpeg JPEG png PNG; do
    for f in "$SRC"/*."$ext"; do
        [ -e "$f" ] || continue
        fname=$(basename "$f")
        thumb="$THUMBS/$fname"
        full="$STATIC/$fname"

        # 尝试读 EXIF
        date_taken=$(sips -g creation "${f}" 2>/dev/null | grep creation | awk '{print $2}' || echo "")
        width=$(sips -g pixelWidth "$thumb" 2>/dev/null | grep pixelWidth | awk '{print $2}' || echo "800")
        height=$(sips -g pixelHeight "$thumb" 2>/dev/null | grep pixelHeight | awk '{print $2}' || echo "600")

        sep=""
        $first && sep="" || sep=","
        $first && first=false

        photos_json="${photos_json}${sep}
  {
    \"name\": \"${fname}\",
    \"thumb\": \"/photo/thumbs/${fname}\",
    \"full\": \"/photo/${fname}\",
    \"width\": ${width},
    \"height\": ${height},
    \"date\": \"${date_taken}\"
  }"
    done
done
shopt -u nullglob
photos_json="${photos_json}
]"
echo "$photos_json" | python3 -m json.tool > /tmp/photos_check.json 2>/dev/null || true
echo "$photos_json" > "$DATA_FILE"
photo_count=$(find "$SRC" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l | tr -d ' ')
echo "  ✅ data/photos.json 已更新 ($photo_count 张照片)"

# 更新 SyncPhotos.command 到 static/photo/（用户下载用）
cp "$SCRIPT_FILE" "$STATIC/SyncPhotos.command" 2>/dev/null || true

# Hugo 构建
echo "🏗️  Hugo 构建..."
cd "$HUGO_BASE"
hugo --quiet 2>&1 | grep -E "(ERROR|WARN|Built)" || true
echo ""
echo "✅ 同步完成！请在 GitHub Desktop 推送变更"
