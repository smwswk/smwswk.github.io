#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
APP_NAME="自然滚动开关.app"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$APP_NAME/Contents/MacOS" "$BUILD_DIR/$APP_NAME/Contents/Resources"

cp "$SCRIPT_DIR/Info.plist" "$BUILD_DIR/$APP_NAME/Contents/Info.plist"
cp "$SCRIPT_DIR/open-natural-scroll-settings" "$BUILD_DIR/$APP_NAME/Contents/MacOS/open-natural-scroll-settings"
chmod +x "$BUILD_DIR/$APP_NAME/Contents/MacOS/open-natural-scroll-settings"

if [ -f "$SCRIPT_DIR/applet.icns" ]; then
  cp "$SCRIPT_DIR/applet.icns" "$BUILD_DIR/$APP_NAME/Contents/Resources/applet.icns"
fi

if command -v plutil >/dev/null 2>&1; then
  plutil -lint "$BUILD_DIR/$APP_NAME/Contents/Info.plist" >/dev/null
fi

echo "Built: $BUILD_DIR/$APP_NAME"
