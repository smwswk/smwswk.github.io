#!/usr/bin/env bash
# ============================================================
# watch_photos.sh — 自动监控 photo/ 文件夹并同步
# ============================================================
# 当 photo/ 文件夹有新文件时，自动运行 sync_photos.sh
#
# 用法：
#   bash watch_photos.sh        前台运行（可以看到日志）
#   bash watch_photos.sh &      后台运行
#   bash watch_photos.sh stop   停止监控

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PHOTO_DIR="${REPO_DIR}/photo"
SYNC_SCRIPT="${REPO_DIR}/sync_photos.sh"
PID_FILE="${REPO_DIR}/.watch_photos.pid"
LOG_FILE="${REPO_DIR}/.watch_photos.log"

# 颜色
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RESET='\033[0m'
log()  { echo -e "${GREEN}✓${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOG_FILE"; }
info() { echo -e "${CYAN}→${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOG_FILE"; }

# 停止监控
stop_watch() {
  if [[ -f "$PID_FILE" ]]; then
    local pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      rm -f "$PID_FILE"
      log "已停止监控（PID: $pid）"
    else
      rm -f "$PID_FILE"
      echo "监控进程不存在"
    fi
  else
    echo "没有运行中的监控"
  fi
  exit 0
}

# 检查依赖
if ! command -v fswatch &>/dev/null; then
  echo "错误：需要安装 fswatch"
  echo "运行：brew install fswatch"
  exit 1
fi

# 处理参数
[[ "$1" == "stop" ]] && stop_watch

# 检查是否已经在运行
if [[ -f "$PID_FILE" ]]; then
  old_pid=$(cat "$PID_FILE")
  if kill -0 "$old_pid" 2>/dev/null; then
    echo "监控已在运行（PID: $old_pid）"
    echo "如需停止：bash watch_photos.sh stop"
    exit 1
  else
    rm -f "$PID_FILE"
  fi
fi

# 创建 photo 目录
mkdir -p "$PHOTO_DIR"

# 保存 PID
echo $$ > "$PID_FILE"

log "开始监控：$PHOTO_DIR"
info "只需把图片拖到 photo/ 文件夹，会自动处理并上传"
info "停止监控：bash watch_photos.sh stop"
echo ""

# 防抖：记录上次同步时间
LAST_SYNC=0
DEBOUNCE_SECONDS=5

# 监控文件变化
fswatch -0 -e ".*" -i "\\.jpg$" -i "\\.jpeg$" -i "\\.png$" -i "\\.webp$" -i "\\.tiff$" "$PHOTO_DIR" | while read -d "" event; do
  # 防抖：如果距离上次同步不到 5 秒，跳过
  NOW=$(date +%s)
  if (( NOW - LAST_SYNC < DEBOUNCE_SECONDS )); then
    continue
  fi

  # 等待文件复制完成（避免处理到一半的文件）
  sleep 2

  info "检测到新图片，开始同步..."

  # 运行同步脚本
  if bash "$SYNC_SCRIPT" >> "$LOG_FILE" 2>&1; then
    log "同步完成"
    LAST_SYNC=$(date +%s)
  else
    echo "同步失败，查看日志：$LOG_FILE"
  fi

  echo ""
done

# 清理
rm -f "$PID_FILE"
