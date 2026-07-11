#!/bin/bash
#
# macOS 双击启动脚本
# 自动检测 Python、创建虚拟环境、安装依赖并运行程序
#

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 日志文件（调试用）
LOG_FILE="$SCRIPT_DIR/run.log"
echo "=== 启动时间: $(date) ===" > "$LOG_FILE"

# 出错时不退出，显示错误信息
trap 'echo ""; echo "运行出错，详见 $LOG_FILE"; echo "按回车键退出..."; read -r' ERR

# 检测 Python3
echo "[1/4] 检测 Python..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到 Python 3"
    echo "请先安装 Python 3.6+，推荐：brew install python3"
    echo ""
    echo "按回车键退出..."
    read -r
    exit 1
fi

# 检测 Python 版本
PYTHON_OK=$(python3 -c 'import sys; print("ok" if sys.version_info >= (3,6) else "no")' 2>> "$LOG_FILE")
if [ "$PYTHON_OK" != "ok" ]; then
    echo "[错误] Python 版本过低，需要 3.6 或更高"
    python3 --version
    echo ""
    echo "按回车键退出..."
    read -r
    exit 1
fi

echo "检测到: $(python3 --version 2>&1)"
echo ""

# 虚拟环境路径
VENV_DIR="$SCRIPT_DIR/.venv"

# 如果没有虚拟环境，创建并安装依赖
if [ ! -d "$VENV_DIR" ]; then
    echo "[2/4] 创建虚拟环境..."
    python3 -m venv "$VENV_DIR" 2>> "$LOG_FILE"
    if [ $? -ne 0 ]; then
        echo "[错误] 创建虚拟环境失败"
        echo "按回车键退出..."
        read -r
        exit 1
    fi

    echo "[3/4] 安装依赖（首次需要1-2分钟）..."
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip 2>> "$LOG_FILE"
    pip install -r "$SCRIPT_DIR/requirements.txt" 2>> "$LOG_FILE"
    if [ $? -ne 0 ]; then
        echo "[错误] 安装依赖失败"
        echo "按回车键退出..."
        read -r
        exit 1
    fi
    echo ""
    echo "环境初始化完成！"
    echo ""
else
    source "$VENV_DIR/bin/activate"
fi

# 运行程序
echo "[4/4] 启动程序..."
echo ""
python3 "$SCRIPT_DIR/main.py"
EXIT_CODE=$?

# 保持窗口打开
echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "按回车键退出..."
else
    echo "程序异常退出（代码 $EXIT_CODE），日志：$LOG_FILE"
    echo "按回车键退出..."
fi
read -r
