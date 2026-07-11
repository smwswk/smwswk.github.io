# Display Switch Win7 Kit

Open-source scripts for switching one shared monitor between a Windows PC on VGA and a Mac on HDMI.

The verified setup was a TF2416 monitor controlled from Windows 7 with NirSoft ControlMyMonitor. The scripts use VCP code `60` for input source selection:

- VGA / Windows: `1`
- HDMI / Mac: `3`
- Monitor ID: `TFC0238`

Adjust these values in `config.bat` if your display reports different values.

## Dependencies

The source package does not bundle third-party binaries.

Download these separately and place them beside the scripts:

- ControlMyMonitor from NirSoft: `ControlMyMonitor.exe`
- AutoHotkey v1.1 portable: `AutoHotkey_1.1.37.02\AutoHotkeyU32.exe`

## Quick Start

1. Put `ControlMyMonitor.exe` in this folder.
2. Put AutoHotkey v1.1 portable at `AutoHotkey_1.1.37.02\AutoHotkeyU32.exe`, or update `AUTOHOTKEY_EXE` in `config.bat`.
3. Run `diagnose_monitor.bat` and confirm the monitor ID and VCP input values.
4. Run `start_win_c_hotkey.bat`.

Hotkeys:

- `Win+C`: cycle between VGA and HDMI.
- `Win+Shift+C`: switch to HDMI / Mac.
- `Win+Ctrl+C`: switch to VGA / Windows.

For startup install, run `install_win_c_hotkey_on_startup.bat`.

## Files

- `config.bat`: monitor ID, input values, and dependency paths.
- `cycle_vga_hdmi.bat`: toggle between VGA and HDMI.
- `switch_to_mac_hdmi.bat`: force HDMI.
- `switch_to_win7_vga.bat`: force VGA.
- `display_switch_hotkey.ahk`: AutoHotkey bindings.
- `watch_display_switch.bat`: optional flag-file watcher.
- `diagnose_monitor.bat`: write monitor and VCP diagnostics.

## License

The scripts in this folder are MIT licensed. Third-party tools keep their own licenses.
