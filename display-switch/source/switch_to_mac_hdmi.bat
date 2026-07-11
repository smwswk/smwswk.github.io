@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

if not exist "%CONTROLMYMONITOR%" (
  echo Missing ControlMyMonitor executable:
  echo   %CONTROLMYMONITOR%
  exit /b 1
)

echo Switching monitor to HDMI/Mac. VCP 60 value: %HDMI_INPUT%
"%CONTROLMYMONITOR%" /SetValue %MONITOR_ID% %INPUT_VCP% %HDMI_INPUT%
echo Done. Exit code: %ERRORLEVEL%
