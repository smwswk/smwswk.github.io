#NoEnv
#SingleInstance Force
#Persistent
SetWorkingDir, %A_ScriptDir%

Log(message) {
    FormatTime, now,, yyyy-MM-dd HH:mm:ss
    FileAppend, %now% %message%`n, %A_ScriptDir%\hotkey.log
}

Log("display_switch_hotkey started. Hotkey: Win+C -> cycle VGA/HDMI")

#c::
    Log("Win+C pressed; running cycle_vga_hdmi.bat")
    Run, %ComSpec% /c ""%A_ScriptDir%\cycle_vga_hdmi.bat"", %A_ScriptDir%, Hide
return

#+c::
    Log("Win+Shift+C pressed; running switch_to_mac_hdmi.bat")
    Run, %ComSpec% /c ""%A_ScriptDir%\switch_to_mac_hdmi.bat"", %A_ScriptDir%, Hide
return

#^c::
    Log("Win+Ctrl+C pressed; running switch_to_win7_vga.bat")
    Run, %ComSpec% /c ""%A_ScriptDir%\switch_to_win7_vga.bat"", %A_ScriptDir%, Hide
return
