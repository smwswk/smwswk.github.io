@echo off
setlocal EnableExtensions

set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set TARGET=%STARTUP%\display_switch_watcher.cmd

echo @echo off>"%TARGET%"
echo taskkill /FI "WINDOWTITLE eq Display Switch Watcher*" /IM cmd.exe /F ^>nul 2^>nul>>"%TARGET%"
echo start "Display Switch Watcher" /min cmd /c ""%~dp0watch_display_switch.bat"">>"%TARGET%"

echo Installed Startup entry:
echo   %TARGET%
echo.
echo It will start after the next Win7 login. To start now, run start_watcher_now.bat.
pause
