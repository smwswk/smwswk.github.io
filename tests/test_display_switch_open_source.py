from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "display-switch"
SOURCE = PROJECT / "source"
SRC_ZIP = PROJECT / "downloads" / "display-switch-source.zip"


class DisplaySwitchOpenSourceTest(unittest.TestCase):
    def test_homepage_and_page_links(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        page = (PROJECT / "index.html").read_text(encoding="utf-8")
        self.assertIn("/display-switch/", homepage)
        self.assertIn("双机显示器切换包", homepage)
        self.assertIn("display-switch-source.zip", page)
        self.assertIn("display-switch-win7-kit.zip", page)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/display-switch/source", page)

    def test_public_source_is_configured_and_sanitized(self):
        required = [
            "README.md",
            "LICENSE",
            "config.bat",
            "cycle_vga_hdmi.bat",
            "display_switch_hotkey.ahk",
            "watch_display_switch.bat",
        ]
        for name in required:
            self.assertTrue((SOURCE / name).is_file(), f"missing {name}")

        combined = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in SOURCE.glob("*") if path.is_file())
        self.assertIn("MONITOR_ID", combined)
        self.assertIn("TFC0238", combined)
        self.assertIn("VGA_INPUT", combined)
        self.assertIn("HDMI_INPUT", combined)
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn("Scanned Documents", combined)
        self.assertNotIn("huapen", combined.lower())
        self.assertNotIn("花盆", combined)

    def test_source_zip_excludes_third_party_binaries(self):
        self.assertTrue(SRC_ZIP.is_file(), f"missing {SRC_ZIP}")
        with zipfile.ZipFile(SRC_ZIP) as zf:
            names = zf.namelist()
        joined = "\n".join(names)
        self.assertIn("README.md", joined)
        self.assertIn("config.bat", joined)
        self.assertNotIn("ControlMyMonitor.exe", joined)
        self.assertNotIn("ControlMyMonitor.chm", joined)
        self.assertNotIn("AutoHotkeyU32.exe", joined)
        self.assertNotIn(".DS_Store", joined)


if __name__ == "__main__":
    unittest.main()
