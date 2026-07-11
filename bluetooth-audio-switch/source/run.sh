#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLUETOOTH_OUTPUT_NAME="${BLUETOOTH_OUTPUT_NAME:-OPPO Enco Air5 Pro}"
SWITCH_AUDIO_SOURCE="${SWITCH_AUDIO_SOURCE:-}"

if [[ -z "$SWITCH_AUDIO_SOURCE" ]]; then
  if command -v SwitchAudioSource >/dev/null 2>&1; then
    SWITCH_AUDIO_SOURCE="$(command -v SwitchAudioSource)"
  elif [[ -x /opt/homebrew/bin/SwitchAudioSource ]]; then
    SWITCH_AUDIO_SOURCE="/opt/homebrew/bin/SwitchAudioSource"
  elif [[ -x /usr/local/bin/SwitchAudioSource ]]; then
    SWITCH_AUDIO_SOURCE="/usr/local/bin/SwitchAudioSource"
  else
    echo "SwitchAudioSource not found. Install with: brew install switchaudio-osx" >&2
    exit 1
  fi
fi

if [[ ! -x "$SCRIPT_DIR/switch_input" ]]; then
  echo "switch_input helper not found. Run ./install.sh first." >&2
  exit 1
fi

defaults write bluetoothaudiod "Enable AAC codec" -bool true >/dev/null 2>&1 || true
defaults write bluetoothaudiod "Enable AptX codec" -bool true >/dev/null 2>&1 || true

"$SCRIPT_DIR/switch_input"
"$SWITCH_AUDIO_SOURCE" -t output -s "$BLUETOOTH_OUTPUT_NAME"

osascript -e 'display notification "Output switched to A2DP/AAC path" with title "Bluetooth audio switch" sound name "Blow"' >/dev/null 2>&1 || true
echo "Done: input is built-in mic, output is $BLUETOOTH_OUTPUT_NAME"
