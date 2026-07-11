@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0config.bat"

echo Running ControlMyMonitor diagnosis...
echo Output folder: %CD%

if not exist "%CONTROLMYMONITOR%" (
  echo Missing ControlMyMonitor executable:
  echo   %CONTROLMYMONITOR%
  pause
  exit /b 1
)

"%CONTROLMYMONITOR%" /smonitors "%~dp0monitors.txt"
"%CONTROLMYMONITOR%" /stab "%~dp0vcp_%MONITOR_ID%.tsv" %MONITOR_ID%
"%CONTROLMYMONITOR%" /GetValue %MONITOR_ID% %INPUT_VCP% >"%~dp0input_current.txt"

echo.
echo Done.
echo Wrote:
echo   monitors.txt
echo   vcp_%MONITOR_ID%.tsv
echo   input_current.txt
echo.
pause
