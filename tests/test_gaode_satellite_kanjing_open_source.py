from pathlib import Path
import subprocess
import sys
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "gaode-satellite-kanjing"
SOURCE = PROJECT / "source"
SRC_ZIP = PROJECT / "downloads" / "gaode-satellite-kanjing-source.zip"


class GaodeSatelliteKanjingOpenSourceTest(unittest.TestCase):
    def test_homepage_and_page_links(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        page = (PROJECT / "index.html").read_text(encoding="utf-8")
        self.assertIn("/gaode-satellite-kanjing/", homepage)
        self.assertIn("卫星堪景 Skill", homepage)
        self.assertIn("gaode-satellite-kanjing-source.zip", page)
        self.assertIn("--confirm-api-fetch", page)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/gaode-satellite-kanjing/source", page)

    def test_public_source_is_sanitized_and_guarded(self):
        for path in [
            SOURCE / "README.md",
            SOURCE / "LICENSE",
            SOURCE / "SKILL.md",
            SOURCE / "scripts/build_amap_import_files.py",
            SOURCE / "scripts/google_satellite_second_pass.py",
        ]:
            self.assertTrue(path.is_file(), f"missing {path}")

        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in [
                SOURCE / "README.md",
                SOURCE / "SKILL.md",
                SOURCE / "scripts/google_satellite_second_pass.py",
            ]
        )
        self.assertIn("satellite_kanjing.google_maps_api_key", combined)
        self.assertIn("--confirm-api-fetch", combined)
        self.assertIn("KML", combined)
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn("codex.google_maps_api_key", combined)
        self.assertNotIn("华东地区", combined)
        self.assertNotIn("sk-", combined)

    def test_google_script_refuses_api_fetch_without_confirmation(self):
        proc = subprocess.run(
            [sys.executable, str(SOURCE / "scripts/google_satellite_second_pass.py"), "/tmp/nope.json"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("--confirm-api-fetch", proc.stdout)

    def test_source_zip_excludes_generated_artifacts(self):
        self.assertTrue(SRC_ZIP.is_file(), f"missing {SRC_ZIP}")
        with zipfile.ZipFile(SRC_ZIP) as zf:
            names = zf.namelist()
        joined = "\n".join(names)
        self.assertIn("README.md", joined)
        self.assertIn("scripts/google_satellite_second_pass.py", joined)
        self.assertNotIn("__pycache__", joined)
        self.assertNotIn(".pyc", joined)
        self.assertNotIn(".env", joined)
        self.assertNotIn(".kml", joined)
        self.assertNotIn(".csv", joined)
        self.assertNotIn("google_tiles", joined)
        self.assertNotIn("google_mosaics", joined)


if __name__ == "__main__":
    unittest.main()
