from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
CSS = ROOT / "css" / "hyde.css"
SKILL_ILLUSTRATIONS = [
    ROOT / "homepage-assets" / "skill-scroll-switch.png",
    ROOT / "homepage-assets" / "skill-display-switch.png",
    ROOT / "homepage-assets" / "skill-movie-recommender.png",
    ROOT / "homepage-assets" / "skill-voice-memos.png",
    ROOT / "homepage-assets" / "skill-satellite-kanjing.png",
    ROOT / "homepage-assets" / "skill-store.png",
]


class HomepagePlainLanguageTest(unittest.TestCase):
    def test_homepage_routes_identity_and_ai_help_sections(self):
        html = HOME.read_text(encoding="utf-8")

        self.assertIn("一个人 + AI 的工作台", html)
        self.assertIn("先选入口", html)
        self.assertIn("AI 独立开发者", html)
        self.assertIn("主播独立开发者", html)
        self.assertIn("创作独立开发者", html)
        self.assertIn("器材独立开发者", html)
        self.assertIn("工具和 Skill", html)
        self.assertIn("AI 需求诊断", html)

    def test_homepage_removes_professional_section_jargon(self):
        html = HOME.read_text(encoding="utf-8")

        self.assertNotIn("AI 自动化咨询<br><em>与系统交付</em>", html)
        self.assertNotIn("按业务场景组织的交付模块", html)
        self.assertNotIn("能力边界", html)
        self.assertNotIn("AI / Podcast / Creation / Gear", html)
        self.assertNotIn("近期更新", html)

    def test_homepage_uses_plain_personal_brand(self):
        html = HOME.read_text(encoding="utf-8")

        self.assertIn("<title>独立开发者工作台</title>", html)
        self.assertIn("<h1>独立开发者工作台</h1>", html)
        self.assertIn("© 2026 独立开发者", html)
        self.assertIn("var id = 'smwswk';", html)
        self.assertIn('class="home-page workbench-home"', html)

    def test_homepage_has_unified_skill_illustrations_and_current_tool_links(self):
        html = HOME.read_text(encoding="utf-8")

        for path in [
            "/mac-scroll-switcher/",
            "/display-switch/",
            "/movie-recommender/",
            "/voice-memos-organizer/",
            "/gaode-satellite-kanjing/",
            "/skill-store/",
        ]:
            self.assertIn(path, html)

        for asset in SKILL_ILLUSTRATIONS:
            self.assertTrue(asset.is_file(), f"missing {asset}")
            self.assertIn(f"/homepage-assets/{asset.name}", html)

        self.assertEqual(html.count('class="tool-card'), 6)

    def test_mobile_hero_is_compact_after_navigation(self):
        css = CSS.read_text(encoding="utf-8")

        self.assertRegex(
            css,
            r"@media \(max-width: 768px\)[\s\S]*body\.home-page \.home-hero \{[\s\S]*min-height: auto;[\s\S]*justify-content: flex-start;",
        )

    def test_homepage_css_uses_single_workbench_visual_system(self):
        css = CSS.read_text(encoding="utf-8")

        self.assertIn("body.workbench-home", css)
        self.assertIn(".workbench-hero", css)
        self.assertIn(".tool-card", css)
        self.assertIn(".tool-illo", css)
        self.assertIn("--home-accent", css)


if __name__ == "__main__":
    unittest.main()
