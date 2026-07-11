@echo off
setlocal EnableExtensions

set TARGET=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\display_switch_hotkey.cmd

if exist "%TARGET%" del /q "%TARGET%"
taskkill /FI "WINDOWTITLE eq display_switch_hotkey.ahk*" /IM AutoHotkeyU32.exe /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq display_switch_hotkey.ahk*" /IM AutoHotkey.exe /F >nul 2>nul

echo Removed hotkey startup entry and stopped running hotkey process if found.
pause
