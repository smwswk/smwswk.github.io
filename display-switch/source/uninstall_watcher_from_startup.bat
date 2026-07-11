@echo off
setlocal EnableExtensions

set TARGET=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\display_switch_watcher.cmd

if exist "%TARGET%" del /q "%TARGET%"
echo Removed Startup entry if it existed:
echo   %TARGET%
pause
