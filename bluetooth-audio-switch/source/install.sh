#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v swiftc >/dev/null 2>&1; then
  echo "swiftc not found. Install Xcode Command Line Tools first: xcode-select --install" >&2
  exit 1
fi

if ! command -v SwitchAudioSource >/dev/null 2>&1 && [[ ! -x /opt/homebrew/bin/SwitchAudioSource ]] && [[ ! -x /usr/local/bin/SwitchAudioSource ]]; then
  echo "SwitchAudioSource not found. Install it with: brew install switchaudio-osx" >&2
  exit 1
fi

swiftc "$SCRIPT_DIR/switch_input.swift" \
  -framework CoreAudio \
  -framework CoreFoundation \
  -o "$SCRIPT_DIR/switch_input"

chmod +x "$SCRIPT_DIR/run.sh" "$SCRIPT_DIR/switch_input" "$SCRIPT_DIR/double-click-switch.command"
echo "Installed. Run: BLUETOOTH_OUTPUT_NAME=\"Your Headset\" ./run.sh"
