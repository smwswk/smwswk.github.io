@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

if not exist "%CONTROLMYMONITOR%" (
  echo Missing ControlMyMonitor executable:
  echo   %CONTROLMYMONITOR%
  exit /b 1
)

echo Cycling monitor input between VGA value %VGA_INPUT% and HDMI value %HDMI_INPUT%.
"%CONTROLMYMONITOR%" /SwitchValue %MONITOR_ID% %INPUT_VCP% %VGA_INPUT% %HDMI_INPUT%
echo Done. Exit code: %ERRORLEVEL%
