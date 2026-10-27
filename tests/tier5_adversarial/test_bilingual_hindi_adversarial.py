# tests/tier5_adversarial/test_bilingual_hindi_adversarial.py
"""
Adversarial Verification: Bilingual Hindi Translation & Devanagari Unicode Preservation.
Validates:
- Authentic Devanagari Unicode code points (U+0900–U+097F).
- Zero replacement characters (\\ufffd), question-mark mangling, or mojibake.
- Special Hindi conjuncts (virama), matras, nuktas, anusvara, and Purna Viram (।).
- Dual-language report detail synchronization (title_en/hi, content_en/hi, key_points_en/hi).
- Language filter query compliance in /api/v1/reports?language=hi and language=en.
- Multilingual safety guidance in /api/v1/preparedness/directory.
- Client translation toggle state validation ('en', 'hi', 'split').
"""

import re
from tests.test_harness import BaseHarnessTestCase


class TestBilingualHindiAdversarial(BaseHarnessTestCase):
    """Adversarial stress testing for Hindi Devanagari preservation and bilingual UI state."""

    DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")
    MOJIBAKE_REGEX = re.compile(r"[\u00C0-\u00FF]{2,}|à¤|à¥|\ufffd")

    def _assert_valid_devanagari_text(self, text: str, field_desc: str):
        """Assert text contains valid Devanagari characters and no encoding corruptions."""
        self.assertIsNotNone(text, f"Field '{field_desc}' is None")
        self.assertGreater(len(text.strip()), 0, f"Field '{field_desc}' is empty")

        # 1. Assert presence of Devanagari characters
        devanagari_chars = self.DEVANAGARI_REGEX.findall(text)
        self.assertGreater(
            len(devanagari_chars),
            0,
            f"Field '{field_desc}' does not contain any Devanagari characters: {text[:60]}",
        )

        # 2. Assert NO Unicode replacement characters or mojibake
        self.assertNotIn(
            "\ufffd",
            text,
            f"Field '{field_desc}' contains Unicode replacement character (\\ufffd): {text}",
        )
        self.assertFalse(
            bool(self.MOJIBAKE_REGEX.search(text)),
            f"Field '{field_desc}' contains suspected mojibake or UTF-8 double-encoding: {text[:60]}",
        )

        # 3. Assert NO question mark mangling (e.g. '??? ???')
        self.assertNotIn(
            "???",
            text,
            f"Field '{field_desc}' contains '???' indicating encoding loss: {text}",
        )

    def test_h1_reports_feed_hindi_language_filter(self):
        """Verify GET /api/v1/reports?language=hi filters by language tag and check Devanagari content."""
        res_hi = self.client.get_json("/api/v1/reports?language=hi")
        reports_hi = res_hi.get("reports", [])
        self.assertGreater(len(reports_hi), 0, "Expected at least one Hindi report")

        for r in reports_hi:
            with self.subTest(report_id=r.get("id")):
                self.assertEqual(r.get("language"), "hi", f"Report {r.get('id')} language must be 'hi'")

        # rep-002 is the canonical authentic Devanagari Hindi report
        rep_002 = next((r for r in reports_hi if r.get("id") == "rep-002"), None)
        self.assertIsNotNone(rep_002, "rep-002 must be returned when filtering language=hi")
        self._assert_valid_devanagari_text(rep_002.get("title", ""), "rep-002 title")
        self._assert_valid_devanagari_text(rep_002.get("summary", ""), "rep-002 summary")

    def test_h2_reports_feed_english_language_filter(self):
        """Verify GET /api/v1/reports?language=en returns only English reports."""
        res_en = self.client.get_json("/api/v1/reports?language=en")
        reports_en = res_en.get("reports", [])
        self.assertGreater(len(reports_en), 0, "Expected English reports")

        for r in reports_en:
            with self.subTest(report_id=r.get("id")):
                self.assertEqual(r.get("language"), "en")

    def test_h3_report_detail_bilingual_devanagari_completeness(self):
        """Verify GET /api/v1/reports/{id} contains complete, authentic Devanagari and English content."""
        detail = self.client.get_json("/api/v1/reports/rep-001")

        # 1. Dual titles
        self.assertIn("title_en", detail)
        self.assertIn("title_hi", detail)
        self.assertGreater(len(detail["title_en"]), 10)
        self._assert_valid_devanagari_text(detail["title_hi"], "detail.title_hi")

        # 2. Dual content bodies
        self.assertIn("content_en", detail)
        self.assertIn("content_hi", detail)
        self.assertGreater(len(detail["content_en"]), 100)
        self._assert_valid_devanagari_text(detail["content_hi"], "detail.content_hi")

        # 3. Dual key points lists
        self.assertIn("key_points_en", detail)
        self.assertIn("key_points_hi", detail)
        self.assertIsInstance(detail["key_points_en"], list)
        self.assertIsInstance(detail["key_points_hi"], list)
        self.assertGreaterEqual(len(detail["key_points_en"]), 4)
        self.assertGreaterEqual(len(detail["key_points_hi"]), 4)

        for idx, pt in enumerate(detail["key_points_hi"]):
            self._assert_valid_devanagari_text(pt, f"detail.key_points_hi[{idx}]")

    def test_h4_special_hindi_typography_and_punctuation(self):
        """Stress-test specific Hindi linguistic features: conjuncts, virama, purna viram, and mixed numbers."""
        detail = self.client.get_json("/api/v1/reports/rep-001")
        hi_text = detail["title_hi"] + " " + detail["content_hi"] + " " + " ".join(detail["key_points_hi"])

        # Purna Viram (danda । U+0964)
        self.assertIn(
            "\u0964",
            hi_text,
            "Devanagari text should use Purna Viram (।) sentence terminators",
        )

        # Virama / halant (् U+094D) for complex conjuncts (e.g. स्खलन, राष्ट्रीय, एसडीआरएफ)
        self.assertIn(
            "\u094d",
            hi_text,
            "Devanagari text must contain virama (्) representing authentic consonant conjuncts",
        )

        # Anusvara (ं U+0902) (e.g. संबंध, बंद, घन, राहत)
        self.assertIn(
            "\u0902",
            hi_text,
            "Devanagari text must contain anusvara (ं)",
        )

        # Mixed metrics and numerals preserved alongside Devanagari
        critical_metrics = ["340", "18,500", "420", "65", "107"]
        for metric in critical_metrics:
            self.assertIn(
                metric,
                hi_text,
                f"Numeric metric '{metric}' must be preserved in Hindi narrative alongside Devanagari text",
            )

    def test_h5_preparedness_multilingual_guidance_directory(self):
        """Verify GET /api/v1/preparedness/directory provides bilingual English & Hindi SOPs."""
        directory = self.client.get_json("/api/v1/preparedness/directory")
        self.assertIn("guidance", directory)
        guidance = directory["guidance"]
        self.assertGreater(len(guidance), 0, "Expected guidance entries in directory")

        bilingual_count = 0
        for g in guidance:
            languages = g.get("languages", [])
            if any("Hindi" in lang or "हिंदी" in lang for lang in languages):
                bilingual_count += 1

        self.assertGreater(
            bilingual_count,
            0,
            "Expected at least one safety protocol marked with Hindi language capability",
        )

    def test_h6_frontend_translation_toggle_simulation(self):
        """Verify the 3 translation modes ('en', 'hi', 'split') referenced in ReportsView.js work without null pointers."""
        detail = self.client.get_json("/api/v1/reports/rep-001")

        # Simulate 'en' mode
        content_en = detail.get("content_en", "")
        pts_en = detail.get("key_points_en", [])
        self.assertTrue(len(content_en) > 0 and len(pts_en) > 0)

        # Simulate 'hi' mode
        content_hi = detail.get("content_hi", "")
        pts_hi = detail.get("key_points_hi", [])
        self.assertTrue(len(content_hi) > 0 and len(pts_hi) > 0)

        # Simulate 'split' mode (both active)
        self.assertNotEqual(content_en, content_hi)
        self.assertEqual(len(pts_en), len(pts_hi))
