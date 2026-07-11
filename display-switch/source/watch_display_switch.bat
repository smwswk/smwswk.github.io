@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

echo [%DATE% %TIME%] watcher started in %CD%>>"%~dp0watcher.log"

:loop
if exist "%~dp0to_win7.flag" (
  del /q "%~dp0to_win7.flag"
  echo [%DATE% %TIME%] trigger: to_win7, VCP 60=%VGA_INPUT%>>"%~dp0watcher.log"
  "%CONTROLMYMONITOR%" /SetValue %MONITOR_ID% %INPUT_VCP% %VGA_INPUT%>>"%~dp0watcher.log" 2>&1
  echo [%DATE% %TIME%] exit code: %ERRORLEVEL%>>"%~dp0watcher.log"
)

if exist "%~dp0to_mac.flag" (
  del /q "%~dp0to_mac.flag"
  echo [%DATE% %TIME%] trigger: to_mac, VCP 60=%HDMI_INPUT%>>"%~dp0watcher.log"
  "%CONTROLMYMONITOR%" /SetValue %MONITOR_ID% %INPUT_VCP% %HDMI_INPUT%>>"%~dp0watcher.log" 2>&1
  echo [%DATE% %TIME%] exit code: %ERRORLEVEL%>>"%~dp0watcher.log"
)

ping -n 3 127.0.0.1>nul
goto loop
