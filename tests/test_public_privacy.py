from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOMEPAGE = ROOT / "index.html"
PODCAST = ROOT / "podcast" / "index.html"


class PublicPrivacyTest(unittest.TestCase):
    """2026-10-12 起身份信息恢复公开，但以下三类边界仍然有效：
    联系方式与收款入口、客户/案件业务材料、未经审核的 skill 不推广。"""

    def test_no_contact_channels_anywhere(self):
        forbidden = ["微信号", "加我微信", "复制微信", "私信报价"]
        failures = []
        for path in ROOT.rglob("*.html"):
            if "node_modules" in path.parts:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for marker in forbidden:
                if marker in text:
                    failures.append(f"{path.relative_to(ROOT)}: {marker}")
        self.assertEqual([], failures)

    def test_payment_qr_assets_stay_removed(self):
        for relative in [
            "skill-store/assets/quantum-wechatpay.jpg",
            "lit-visual/wx-qr.jpg",
            "lit-visual/generate/wx-qr.jpg",
        ]:
            self.assertFalse((ROOT / relative).exists(), relative)

    def test_identity_is_public_again(self):
        homepage = HOMEPAGE.read_text(encoding="utf-8")
        self.assertIn("小明工作台", homepage)
        self.assertIn("搞艺术的小明", homepage)

        podcast = PODCAST.read_text(encoding="utf-8")
        self.assertIn("搞艺术的小明", podcast)
        self.assertNotIn("主持人 C", podcast)
        self.assertNotIn("跨平台账号数据不公开", podcast)

    def test_identity_and_creator_pages_are_indexable_again(self):
        for relative in [
            "creator/index.html",
            "creator/surface/index.html",
            "creator/macondo/index.html",
            "gaode-satellite-kanjing/index.html",
            "about/index.html",
        ]:
            text = (ROOT / relative).read_text(encoding="utf-8")
            self.assertNotIn("noindex", text, relative)

    def test_commercial_service_pages_stay_archived(self):
        for relative in [
            "wedding-ai-studio/index.html",
            "wedding-ai-studio/commercial/index.html",
            "wedding-ai-studio/wedding/index.html",
        ]:
            text = (ROOT / relative).read_text(encoding="utf-8")
            self.assertIn("noindex", text, relative)

    def test_unreviewed_skill_catalog_is_not_promoted(self):
        homepage = HOMEPAGE.read_text(encoding="utf-8")
        store = (ROOT / "skill-store" / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("skill-satellite-kanjing.png", homepage)
        self.assertNotIn("github.com/smwswk/xiaoming-agent-skills", homepage)
        self.assertNotIn("github.com/smwswk/xiaoming-agent-skills", store)
        self.assertIn("完整目录暂停推广", store)


if __name__ == "__main__":
    unittest.main()
