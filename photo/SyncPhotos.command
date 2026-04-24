#!/bin/bash
# SyncPhotos.command - 双击即用（macOS 安全警告点"取消"→右键→"打开"）

set -e

REPO_DIR="/Users/sunminwen/Documents/GitHub/smwswk.github.io"
LOG="$REPO_DIR/.sync_log"

echo "🔄 同步照片并构建网站..."
date >> "$LOG"

# 进入仓库目录
cd "$REPO_DIR"

# 同步脚本
bash "$REPO_DIR/scripts/sync_photos.sh" 2>&1 | tee -a "$LOG"

# Hugo 构建
echo "⚙️  运行 Hugo 构建..."
hugo 2>&1 | tee -a "$LOG"

echo ""
echo "✅ 完成！请在 GitHub Desktop 提交推送。"
echo "📂 推送后访问: https://smwswk.github.io/photo"
echo ""
read -p "按 Enter 键关闭..." _
