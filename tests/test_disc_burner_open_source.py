from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "disc-burner" / "index.html"
README = ROOT / "disc-burner" / "source" / "README.md"
MAC_SCRIPT = ROOT / "disc-burner" / "source" / "mac" / "burn_disc.py"
MAC_ENTRY = ROOT / "disc-burner" / "source" / "mac" / "双击刻光盘.command"
WIN_SCRIPT = ROOT / "disc-burner" / "source" / "windows-win7" / "burn_disc_win7.vbs"
WIN_ENTRY = ROOT / "disc-burner" / "source" / "windows-win7" / "双击刻光盘.cmd"
LICENSE = ROOT / "disc-burner" / "source" / "LICENSE"
MAC_ZIP = ROOT / "disc-burner" / "downloads" / "disc-burner-mac.zip"
WIN_ZIP = ROOT / "disc-burner" / "downloads" / "disc-burner-win7.zip"
SRC_ZIP = ROOT / "disc-burner" / "downloads" / "disc-burner-source.zip"


class DiscBurnerOpenSourceTest(unittest.TestCase):
    def test_disc_burner_is_no_longer_forced_onto_homepage(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("/disc-burner/", html)

        self.assertTrue(PAGE.is_file())

    def test_project_page_has_mac_win_and_open_source_links(self):
        html = PAGE.read_text(encoding="utf-8")
        self.assertIn("Mac 版", html)
        self.assertIn("Windows 7 版", html)
        self.assertIn("开源", html)
        self.assertIn("disc-burner-mac.zip", html)
        self.assertIn("disc-burner-win7.zip", html)
        self.assertIn("disc-burner-source.zip", html)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/disc-burner/source", html)

    def test_public_source_is_portable_and_sanitized(self):
        for path in [README, MAC_SCRIPT, MAC_ENTRY, WIN_SCRIPT, WIN_ENTRY, LICENSE]:
            self.assertTrue(path.is_file(), f"missing {path}")

        combined = "\n".join(
            path.read_text(encoding="utf-8-sig")
            for path in [README, MAC_SCRIPT, MAC_ENTRY, WIN_SCRIPT, WIN_ENTRY, LICENSE]
        )
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn("Scanned Documents", combined)
        self.assertNotIn("20250504", combined)
        self.assertNotIn("宝岩", combined)
        self.assertNotIn("范家山", combined)
        self.assertIn("DATA_DISC", combined)
        self.assertIn("需要刻录的文件", combined)

        self.assertIn("hdiutil", MAC_SCRIPT.read_text(encoding="utf-8"))
        self.assertIn("drutil", MAC_SCRIPT.read_text(encoding="utf-8"))
        self.assertIn("IMAPI2.MsftDiscMaster2", WIN_SCRIPT.read_text(encoding="utf-8-sig"))
        self.assertIn("dataWriter.Recorder = recorder", WIN_SCRIPT.read_text(encoding="utf-8-sig"))

    def test_download_archives_exist_without_payload_media(self):
        for archive in [MAC_ZIP, WIN_ZIP, SRC_ZIP]:
            self.assertTrue(archive.is_file(), f"missing {archive}")
            with zipfile.ZipFile(archive) as zf:
                names = zf.namelist()
            self.assertTrue(names)
            joined = "\n".join(names)
            self.assertNotIn(".DS_Store", joined)
            self.assertNotIn(".mp4", joined.lower())
            self.assertNotIn(".jpg", joined.lower())
            self.assertNotIn("20250504", joined)
            self.assertNotIn("宝岩", joined)
            self.assertNotIn("σ", joined)
            self.assertNotIn("Θ", joined)

        with zipfile.ZipFile(WIN_ZIP) as zf:
            vbs_bytes = zf.read("disc-burner-win7/burn_disc_win7.vbs")
        self.assertTrue(vbs_bytes.startswith(b"\xff\xfe"))


if __name__ == "__main__":
    unittest.main()
