from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "movie-recommender"
SOURCE = PROJECT / "source"
SRC_ZIP = PROJECT / "downloads" / "movie-recommender-source.zip"


class MovieRecommenderOpenSourceTest(unittest.TestCase):
    def test_homepage_and_page_links(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        page = (PROJECT / "index.html").read_text(encoding="utf-8")
        self.assertIn("/movie-recommender/", homepage)
        self.assertIn("本地电影推荐器", homepage)
        self.assertIn("movie-recommender-source.zip", page)
        self.assertIn("豆瓣 Cookie", page)
        self.assertIn("https://github.com/smwswk/smwswk.github.io/tree/master/movie-recommender/source", page)

    def test_public_source_has_privacy_notes(self):
        for name in ["README.md", "LICENSE", "main.py", "survey.py", "data/movies.json"]:
            self.assertTrue((SOURCE / name).is_file(), f"missing {name}")
        readme = (SOURCE / "README.md").read_text(encoding="utf-8")
        survey = (SOURCE / "survey.py").read_text(encoding="utf-8")
        self.assertIn("不会把 Cookie 发送给作者", readme)
        self.assertIn("data/douban_", readme)
        self.assertIn("不会上传给作者服务器", survey)

    def test_source_zip_excludes_runtime_artifacts(self):
        self.assertTrue(SRC_ZIP.is_file(), f"missing {SRC_ZIP}")
        with zipfile.ZipFile(SRC_ZIP) as zf:
            names = zf.namelist()
        joined = "\n".join(names)
        self.assertIn("data/movies.json", joined)
        self.assertIn("main.py", joined)
        self.assertNotIn(".venv", joined)
        self.assertNotIn("__pycache__", joined)
        self.assertNotIn("run.log", joined)
        self.assertNotIn("data/douban_", joined)


if __name__ == "__main__":
    unittest.main()
