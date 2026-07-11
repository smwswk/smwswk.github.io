# Bluetooth Audio Switch

macOS Bluetooth headsets often fall back to HFP call mode when the headset is used as both input and output. That mode is reliable for calls, but music sounds thin. This toolkit switches input back to the built-in microphone, then switches output to the Bluetooth headset so macOS can use A2DP/AAC again.

## What It Does

- Enables macOS AAC/AptX preference keys for Bluetooth audio.
- Selects the built-in microphone as the default input device.
- Selects your Bluetooth headset as the default output device with `SwitchAudioSource`.
- Shows a macOS notification after success or failure.

## Requirements

- macOS with Swift toolchain installed.
- [`SwitchAudioSource`](https://github.com/deweller/switchaudio-osx), normally installed with:

```bash
brew install switchaudio-osx
```

## Install

```bash
cd bluetooth-audio-switch
./install.sh
```

`install.sh` compiles `switch_input.swift` into the local `switch_input` helper and makes the shell scripts executable.

## Run

Set your Bluetooth output device name, then run:

```bash
BLUETOOTH_OUTPUT_NAME="OPPO Enco Air5 Pro" ./run.sh
```

If your headset has a different name, list output devices first:

```bash
SwitchAudioSource -a -t output
```

Then replace `BLUETOOTH_OUTPUT_NAME` with the exact device name.

## Double Click

After running `install.sh`, the `double-click-switch.command` file can be opened from Finder. Edit `run.sh` or set `BLUETOOTH_OUTPUT_NAME` in your shell profile if your headset name is not the default example.

## Source Layout

- `run.sh`: main portable workflow.
- `install.sh`: compiles the CoreAudio helper and prepares executable files.
- `switch_input.swift`: CoreAudio source for selecting the built-in input device.
- `bluetooth_audio_switch.applescript`: optional AppleScript wrapper source.
- `double-click-switch.command`: Finder-friendly launcher.

## License

MIT.
