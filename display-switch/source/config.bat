@echo off
rem Copy this file and adjust the values for your monitor if needed.
rem TF2416 verified values: VGA=1, HDMI=3, VCP code 60.

set MONITOR_ID=TFC0238
set VGA_INPUT=1
set HDMI_INPUT=3
set INPUT_VCP=60

set CONTROLMYMONITOR=%~dp0ControlMyMonitor.exe
set AUTOHOTKEY_EXE=%~dp0AutoHotkey_1.1.37.02\AutoHotkeyU32.exe
