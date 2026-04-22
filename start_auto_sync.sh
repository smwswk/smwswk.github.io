#!/usr/bin/env bash
# ============================================================
# start_auto_sync.sh — 启动照片自动同步
# ============================================================
# 双击运行此脚本，或在终端运行：bash start_auto_sync.sh

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

# 检查 fswatch 是否安装
if ! command -v fswatch &>/dev/null; then
  echo "正在安装 fswatch..."
  brew install fswatch
fi

# 启动监控
echo "启动照片自动同步..."
bash watch_photos.sh

# 如果想后台运行，取消下面这行的注释：
# nohup bash watch_photos.sh > /dev/null 2>&1 &
# echo "已在后台启动，可以关闭此窗口"
