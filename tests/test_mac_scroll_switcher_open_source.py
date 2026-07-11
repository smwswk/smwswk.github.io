from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "mac-scroll-switcher" / "index.html"
SOURCE = ROOT / "mac-scroll-switcher" / "source"
README = SOURCE / "README.md"
LICENSE = SOURCE / "LICENSE"
INFO_PLIST = SOURCE / "Info.plist"
ENTRYPOINT = SOURCE / "open-natural-scroll-settings"
BUILD_SCRIPT = SOURCE / "build.sh"
MAC_ZIP = ROOT / "mac-scroll-switcher" / "downloads" / "natural-scroll-toggle-macos.zip"
SRC_ZIP = ROOT / "mac-scroll-switcher" / "downloads" / "natural-scroll-toggle-source.zip"


class MacScrollSwitcherOpenSourceTest(unittest.TestCase):
    def test_homepage_links_to_natural_scroll_toggle(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("/mac-scroll-switcher/", html)
        self.assertIn("自然滚动开关", html)

    def test_project_page_has_downloads_and_source_link(self):
        html = PAGE.read_text(encoding="utf-8")
        self.assertIn("自然滚动设置", html)
        self.assertIn("无辅助功能权限", html)
        self.assertIn("只打开对应设置页", html)
        self.assertIn("natural-scroll-toggle-macos.zip", html)
        self.assertIn("natural-scroll-toggle-source.zip", html)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/mac-scroll-switcher/source", html)

    def test_public_source_is_portable_and_sanitized(self):
        for path in [README, LICENSE, INFO_PLIST, ENTRYPOINT, BUILD_SCRIPT]:
            self.assertTrue(path.is_file(), f"missing {path}")

        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in [README, LICENSE, INFO_PLIST, ENTRYPOINT, BUILD_SCRIPT]
        )
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn(".claude", combined)
        self.assertNotIn("_CodeSignature", combined)
        self.assertNotIn("AXPress", combined)
        self.assertNotIn("click checkbox", combined)
        self.assertNotIn("com.apple.swipescrolldirection", combined)
        self.assertIn("x-apple.systempreferences:com.apple.Mouse-Settings.extension", combined)
        self.assertIn("x-apple.systempreferences:com.apple.Trackpad-Settings.extension", combined)
        self.assertIn("hidutil list", combined)
        self.assertIn("自然滚动开关", combined)

    def test_download_archives_exist(self):
        for archive in [MAC_ZIP, SRC_ZIP]:
            self.assertTrue(archive.is_file(), f"missing {archive}")
            with zipfile.ZipFile(archive) as zf:
                names = zf.namelist()
            self.assertTrue(names)
            joined = "\n".join(names)
            self.assertNotIn(".DS_Store", joined)

        with zipfile.ZipFile(SRC_ZIP) as zf:
            joined = "\n".join(zf.namelist())
        self.assertIn("README.md", joined)
        self.assertIn("Info.plist", joined)
        self.assertIn("open-natural-scroll-settings", joined)
        self.assertNotIn("自然滚动开关.app", joined)

        with zipfile.ZipFile(MAC_ZIP) as zf:
            joined = "\n".join(zf.namelist())
        self.assertIn("自然滚动开关.app", joined)
        self.assertIn("open-natural-scroll-settings", joined)


if __name__ == "__main__":
    unittest.main()
