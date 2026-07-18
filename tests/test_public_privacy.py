from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
PODCAST = ROOT / "podcast" / "index.html"


class PublicPrivacyTest(unittest.TestCase):
    def test_public_html_has_no_direct_identity_links_outside_podcast_exception(self):
        forbidden = [
            "微信号：",
            "复制微信号",
        ]
        failures = []
        for path in ROOT.rglob("*.html"):
            if path == PODCAST or "node_modules" in path.parts:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for marker in forbidden:
                if marker in text:
                    failures.append(f"{path.relative_to(ROOT)}: {marker}")
        self.assertEqual([], failures)

    def test_identity_and_commercial_pages_are_withdrawn(self):
        for relative in [
            "creator/index.html",
            "creator/surface/index.html",
            "creator/macondo/index.html",
            "wedding-ai-studio/index.html",
            "wedding-ai-studio/commercial/index.html",
            "wedding-ai-studio/wedding/index.html",
            "gaode-satellite-kanjing/index.html",
        ]:
            text = (ROOT / relative).read_text(encoding="utf-8")
            self.assertIn('name="robots" content="noindex,nofollow"', text)

    def test_payment_qr_assets_are_removed(self):
        for relative in [
            "skill-store/assets/quantum-wechatpay.jpg",
            "lit-visual/wx-qr.jpg",
            "lit-visual/generate/wx-qr.jpg",
        ]:
            self.assertFalse((ROOT / relative).exists(), relative)

    def test_homepage_has_new_positioning_and_no_sensitive_skill_promotion(self):
        text = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("个人 AI 工作台", text)
        self.assertIn("不承接个人 AI 咨询、代部署或定制开发", text)
        self.assertNotIn("gaode-satellite-kanjing", text)
        self.assertNotIn("复制微信", text)

    def test_podcast_page_is_retained(self):
        text = PODCAST.read_text(encoding="utf-8")
        self.assertIn("独立播客", text)
        self.assertIn("主持人 C", text)
        self.assertIn("跨平台账号数据不公开", text)
        self.assertGreater(len(text), 1000)

    def test_unreviewed_skill_catalog_is_not_promoted(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        store = (ROOT / "skill-store" / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("skill-satellite-kanjing.png", homepage)
        self.assertNotIn("github.com/smwswk/independent-builderg-agent-skills", homepage)
        self.assertNotIn("github.com/smwswk/independent-builderg-agent-skills", store)
        self.assertIn("完整目录暂停推广", store)


if __name__ == "__main__":
    unittest.main()
