@echo off
:: 环境诊断脚本 - 用于排查 Win7 启动问题
cd /d "%~dp0"

echo =========================================
echo   电影推荐系统 - 环境诊断工具
echo =========================================
echo.
echo 系统信息:
echo   当前目录: %CD%
echo   脚本路径: %~dp0
echo   时间: %date% %time%
echo.

echo --- Python 检测 ---
where python 2>nul
if errorlevel 1 (
    echo [X] python 命令未找到
    echo     解决方法：安装 Python 3.6+ 并勾选 "Add Python to PATH"
) else (
    echo [OK] python 命令路径:
    where python
    echo.
    echo [OK] Python 版本:
    python --version
)
echo.

echo --- Python 版本检查 ---
if exist "%~dp0check_python.py" (
    python "%~dp0check_python.py"
    echo 返回码: %errorlevel%
) else (
    echo [X] check_python.py 文件丢失
)
echo.

echo --- 虚拟环境检查 ---
if exist "%~dp0.venv\Scripts\python.exe" (
    echo [OK] 虚拟环境已存在
    "%~dp0.venv\Scripts\python.exe" --version
) else (
    echo [ ] 虚拟环境未创建（首次运行会自动创建）
)
echo.

echo --- 文件完整性检查 ---
for %%f in (main.py survey.py recommender.py movie_db.py douban_scraper.py check_python.py requirements.txt data\movies.json) do (
    if exist "%~dp0%%f" (
        echo [OK] %%f
    ) else (
        echo [X] %%f 缺失
    )
)
echo.

echo --- 尝试启动程序 ---
echo.
if exist "%~dp0.venv\Scripts\python.exe" (
    call "%~dp0.venv\Scripts\activate.bat"
    python "%~dp0main.py"
) else (
    echo 虚拟环境不存在，跳过程序启动
)
echo.

echo =========================================
echo   诊断完成
echo =========================================
pause
