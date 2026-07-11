from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "voice-memos-organizer"
SOURCE = PROJECT / "source"
SRC_ZIP = PROJECT / "downloads" / "voice-memos-organizer-source.zip"


class VoiceMemosOrganizerOpenSourceTest(unittest.TestCase):
    def test_homepage_and_page_links(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        page = (PROJECT / "index.html").read_text(encoding="utf-8")
        self.assertIn("/voice-memos-organizer/", homepage)
        self.assertIn("Voice Memos Organizer", homepage)
        self.assertIn("voice-memos-organizer-source.zip", page)
        self.assertIn("--confirm-live-write", page)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/voice-memos-organizer/source", page)

    def test_public_source_requires_explicit_confirmation(self):
        for path in [
            SOURCE / "README.md",
            SOURCE / "LICENSE",
            SOURCE / "SKILL.md",
            SOURCE / "scripts/process_voice_memos.py",
            SOURCE / "scripts/generate_better_titles.py",
            SOURCE / "scripts/organize_recording_folder.py",
        ]:
            self.assertTrue(path.is_file(), f"missing {path}")

        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in [
                SOURCE / "README.md",
                SOURCE / "scripts/process_voice_memos.py",
                SOURCE / "scripts/generate_better_titles.py",
                SOURCE / "scripts/organize_recording_folder.py",
            ]
        )
        self.assertIn("TeleAI/TeleSpeechASR", combined)
        self.assertIn("CloudRecordings.db", combined)
        self.assertIn("--confirm-live-write", combined)
        self.assertIn("--confirm-delete", combined)
        self.assertIn("--confirm-rename", combined)
        self.assertNotRegex(combined, r"/Users/(?!example-user(?:/|$))[^/\s]+")
        self.assertNotIn("sk-", combined)

    def test_source_zip_excludes_generated_and_media_artifacts(self):
        self.assertTrue(SRC_ZIP.is_file(), f"missing {SRC_ZIP}")
        with zipfile.ZipFile(SRC_ZIP) as zf:
            names = zf.namelist()
        joined = "\n".join(names)
        self.assertIn("README.md", joined)
        self.assertIn("scripts/process_voice_memos.py", joined)
        self.assertNotIn("__pycache__", joined)
        self.assertNotIn(".pyc", joined)
        self.assertNotIn(".m4a", joined)
        self.assertNotIn(".qta", joined)
        self.assertNotIn(".wav", joined)
        self.assertNotIn(".log", joined)


if __name__ == "__main__":
    unittest.main()
