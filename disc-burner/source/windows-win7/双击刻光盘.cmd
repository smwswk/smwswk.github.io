@echo off
chcp 936 >nul
cd /d "%~dp0"
cscript //nologo "%~dp0burn_disc_win7.vbs"
echo.
pause
