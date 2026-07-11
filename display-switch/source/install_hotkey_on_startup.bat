@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set TARGET=%STARTUP%\display_switch_hotkey.cmd

echo @echo off>"%TARGET%"
echo cd /d "%~dp0">>"%TARGET%"
echo start "display_switch_hotkey.ahk" /min "%AUTOHOTKEY_EXE%" "%~dp0display_switch_hotkey.ahk">>"%TARGET%"

echo Installed Startup entry:
echo   %TARGET%
echo.
echo Run start_hotkey_now.bat once to enable it immediately.
pause
