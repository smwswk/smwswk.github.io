#!/bin/bash
cd "$(dirname "$0")"
python3 burn_disc.py
echo ""
echo "按回车键关闭窗口..."
read
