@echo off
:: 电影推荐系统 - Windows 启动脚本（兼容 Win7/Win10/Win11）

cd /d "%~dp0"

echo ========================================
echo  电影推荐系统启动中...
echo ========================================
echo.

echo [1/4] 检测 Python...
python --version
if errorlevel 1 (
    echo.
    echo [错误] 未检测到 Python，请先安装 Python 3
    echo 下载地址：https://www.python.org/downloads/
    echo 安装时请勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

:: 检查 Python 版本是否 >= 3.6
python "%~dp0check_python.py"
if errorlevel 1 (
    echo.
    pause
    exit /b 1
)
echo.

set VENV_DIR=%~dp0.venv

if not exist "%VENV_DIR%\Scripts\python.exe" (
    echo [2/4] 创建虚拟环境...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo [错误] 创建虚拟环境失败
        pause
        exit /b 1
    )

    echo [3/4] 安装依赖（首次需要1-2分钟）...
    call "%VENV_DIR%\Scripts\activate.bat"
    python -m pip install --upgrade pip
    python -m pip install -r "%~dp0requirements.txt"
    if errorlevel 1 (
        echo [错误] 安装依赖失败
        pause
        exit /b 1
    )
    echo.
) else (
    call "%VENV_DIR%\Scripts\activate.bat"
)

echo [4/4] 启动程序...
echo.
python "%~dp0main.py"

echo.
echo 按任意键退出...
pause >nul
