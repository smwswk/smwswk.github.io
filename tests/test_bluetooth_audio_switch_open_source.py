from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "bluetooth-audio-switch"
PAGE = PROJECT / "index.html"
SOURCE = PROJECT / "source"
README = SOURCE / "README.md"
LICENSE = SOURCE / "LICENSE"
APPLESCRIPT = SOURCE / "bluetooth_audio_switch.applescript"
SWITCH_INPUT = SOURCE / "switch_input.swift"
RUN_SCRIPT = SOURCE / "run.sh"
INSTALL_SCRIPT = SOURCE / "install.sh"
MAC_ZIP = PROJECT / "downloads" / "bluetooth-audio-switch-macos.zip"
SRC_ZIP = PROJECT / "downloads" / "bluetooth-audio-switch-source.zip"


class BluetoothAudioSwitchOpenSourceTest(unittest.TestCase):
    def test_bluetooth_audio_switch_is_no_longer_forced_onto_homepage(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("/bluetooth-audio-switch/", html)

        self.assertTrue(PAGE.is_file())

    def test_project_page_describes_audio_mode_fix_and_downloads(self):
        html = PAGE.read_text(encoding="utf-8")
        self.assertIn("蓝牙音质切换", html)
        self.assertIn("HFP", html)
        self.assertIn("A2DP", html)
        self.assertIn("AAC", html)
        self.assertIn("开源", html)
        self.assertIn("bluetooth-audio-switch-macos.zip", html)
        self.assertIn("bluetooth-audio-switch-source.zip", html)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/bluetooth-audio-switch/source", html)

    def test_public_source_is_portable_and_sanitized(self):
        for path in [README, LICENSE, APPLESCRIPT, SWITCH_INPUT, RUN_SCRIPT, INSTALL_SCRIPT]:
            self.assertTrue(path.is_file(), f"missing {path}")

        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in [README, LICENSE, APPLESCRIPT, SWITCH_INPUT, RUN_SCRIPT, INSTALL_SCRIPT]
        )
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn(".claude/tools", combined)
        self.assertNotIn("_CodeSignature", combined)
        self.assertNotIn("Contents/MacOS/applet", combined)
        self.assertIn("BLUETOOTH_OUTPUT_NAME", combined)
        self.assertIn("SwitchAudioSource", combined)
        self.assertIn("AudioObjectSetPropertyData", SWITCH_INPUT.read_text(encoding="utf-8"))
        self.assertIn("kAudioHardwarePropertyDefaultInputDevice", SWITCH_INPUT.read_text(encoding="utf-8"))

    def test_download_archives_exist_without_personal_binary_bundle(self):
        for archive in [MAC_ZIP, SRC_ZIP]:
            self.assertTrue(archive.is_file(), f"missing {archive}")
            with zipfile.ZipFile(archive) as zf:
                names = zf.namelist()
            self.assertTrue(names)
            joined = "\n".join(names)
            self.assertNotIn(".DS_Store", joined)
            self.assertNotIn("蓝牙音质切换.app", joined)
            self.assertNotIn("Contents/MacOS/applet", joined)
            self.assertNotIn("_CodeSignature", joined)
            self.assertIn("README.md", joined)


if __name__ == "__main__":
    unittest.main()
