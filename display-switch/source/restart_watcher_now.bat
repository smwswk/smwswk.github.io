@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

taskkill /FI "WINDOWTITLE eq Display Switch Watcher*" /IM cmd.exe /F >nul 2>nul
start "Display Switch Watcher" /min cmd /c ""%~dp0watch_display_switch.bat""
echo Watcher restarted with values: VGA=%VGA_INPUT%, HDMI=%HDMI_INPUT%.
pause
