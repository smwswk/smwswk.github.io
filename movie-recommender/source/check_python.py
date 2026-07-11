import sys
v = sys.version_info
if v >= (3, 6):
    sys.exit(0)
else:
    print(f"[错误] Python 版本过低: {v.major}.{v.minor}.{v.micro}")
    print("需要 Python 3.6 或更高版本")
    print("Win7 用户请安装 Python 3.8:")
    print("  https://www.python.org/downloads/release/python-3810/")
    sys.exit(1)
