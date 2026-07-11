@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

if not exist "%AUTOHOTKEY_EXE%" (
  echo Missing AutoHotkey executable:
  echo   %AUTOHOTKEY_EXE%
  pause
  exit /b 1
)

taskkill /FI "WINDOWTITLE eq display_switch_hotkey.ahk*" /IM AutoHotkeyU32.exe /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq display_switch_hotkey.ahk*" /IM AutoHotkey.exe /F >nul 2>nul

start "display_switch_hotkey.ahk" /min "%AUTOHOTKEY_EXE%" "%~dp0display_switch_hotkey.ahk"

echo Hotkey started:
echo   Win+C       toggle VGA/Win7 and HDMI/Mac
echo   Win+Shift+C switch to HDMI/Mac
echo   Win+Ctrl+C  switch to VGA/Win7
pause
