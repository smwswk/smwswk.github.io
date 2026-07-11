@echo off
setlocal EnableExtensions
cd /d "%~dp0"

taskkill /FI "WINDOWTITLE eq Display Switch Watcher*" /IM cmd.exe /F >nul 2>nul
start "Display Switch Watcher" /min cmd /c ""%~dp0watch_display_switch.bat""
echo Watcher started. You can close this window.
pause
