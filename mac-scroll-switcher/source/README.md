# Natural Scroll Settings Launcher

A tiny macOS desktop utility that opens the relevant System Settings page for
the "Natural scrolling" switch.

It exists because automatic toggling is brittle on current macOS releases:
writing the underlying preference key can update the preference file without
changing the real scrolling behavior, while UI automation depends on
Accessibility permissions and System Settings layout. This version deliberately
does not toggle anything. It only opens the correct settings pane and leaves the
final click to the user.

## What It Does

- Detects whether an external HID mouse is connected.
- Opens the macOS Mouse settings pane when an external mouse is present.
- Opens the macOS Trackpad settings pane when no external mouse is present.
- Does not write defaults, click controls, install background agents, or require
  Accessibility permission.

## Requirements

- macOS.
- A user who wants to change the final switch manually.

## Build

```bash
./build.sh
open build/自然滚动开关.app
```

The generated app can be moved to Desktop or Applications.

## Source Layout

- `open-natural-scroll-settings`: shell entrypoint used by the app.
- `Info.plist`: app bundle metadata.
- `build.sh`: builds a Finder-openable `.app` bundle.
- `LICENSE`: MIT license for this utility.

## Notes

The external mouse detector uses `hidutil list` and looks for non-built-in HID
pointing devices (`UsagePage=1`, `Usage=2`). If detection misses a specific
device, the app still remains safe: it only opens a settings pane and never
changes system preferences.

## License

MIT.
