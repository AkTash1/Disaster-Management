# tests/tier5_adversarial/test_ask_citations_adversarial.py
"""
Adversarial Verification: Q&A Citation Parsing & Grounded Evidence Correlation.
Validates:
- Structured response architecture: facts (green), inferences (orange), predictions (purple).
- Strict correlation of bracketed citation tokens [1]–[6] to returned citation cards.
- Zero dangling citation references in text.
- Comprehensive coverage across all suggested questions and adversarial query inputs.
- Empty, whitespace, malformed, and injection query boundaries.
- Frontend citation tokenizer simulation matching AskView.js.
"""

import re
from tests.test_harness import BaseHarnessTestCase


class TestAskCitationsAdversarial(BaseHarnessTestCase):
    """Adversarial stress testing for Q&A citation grounding and parsing."""

    CITATION_REGEX = re.compile(r"\[(\d+)\]")

    def _verify_citation_correlation(self, data: dict, query_desc: str):
        """Helper to assert strict 1:1 correlation between inline citation tokens and citation cards."""
        self.assertIn("answer", data, f"Response missing 'answer' for query: {query_desc}")
        self.assertIn("citations", data, f"Response missing 'citations' for query: {query_desc}")

        ans = data["answer"]
        facts = ans.get("facts", [])
        inferences = ans.get("inferences", [])
        predictions = ans.get("predictions", [])
        citations = data.get("citations", [])

        self.assertGreater(len(facts), 0, f"Expected facts for query: {query_desc}")
        self.assertGreater(len(citations), 0, f"Expected citations for query: {query_desc}")

        # Map available citation IDs
        citation_card_map = {c["id"]: c for c in citations if "id" in c}
        self.assertEqual(
            len(citation_card_map),
            len(citations),
            f"Duplicate or missing citation IDs in citation cards for query: {query_desc}",
        )

        # Collect all tokens from facts, inferences, predictions
        all_texts = facts + inferences + predictions
        all_cited_tokens = []
        for text in all_texts:
            tokens = [int(m) for m in self.CITATION_REGEX.findall(text)]
            all_cited_tokens.extend(tokens)

        self.assertGreater(
            len(all_cited_tokens),
            0,
            f"Expected at least one bracketed citation token in answer text for query: {query_desc}",
        )

        # 1. Assert EVERY bracketed token [N] corresponds to a valid citation card
        for token_id in all_cited_tokens:
            self.assertIn(
                token_id,
                citation_card_map,
                f"Dangling citation token [{token_id}] in text has NO matching citation card! Query: {query_desc}",
            )
            self.assertGreaterEqual(token_id, 1, f"Citation token [{token_id}] must be >= 1")
            self.assertLessEqual(token_id, 6, f"Citation token [{token_id}] must be <= 6 (expected [1]–[6])")

        # 2. Assert every citation card has schema-valid fields
        valid_reliabilities = {
            "Verified", "Official", "Inferred", "Predicted", "Observed",
            "Reported", "Likely True", "Unverified", "Confirmed", "AI Inferred", "Possible"
        }
        for cid, card in citation_card_map.items():
            self.assertIn("source_title", card)
            self.assertIn("source_type", card)
            self.assertIn("reliability", card)
            self.assertIn("url", card)
            self.assertGreater(len(card["source_title"].strip()), 0)
            self.assertIn(
                card["reliability"],
                valid_reliabilities,
                f"Invalid reliability '{card['reliability']}' in citation card #{cid}",
            )

        # 3. Assert EVERY citation card is referenced in the text
        cited_set = set(all_cited_tokens)
        for cid in citation_card_map.keys():
            self.assertIn(
                cid,
                cited_set,
                f"Citation card #{cid} was returned but NEVER referenced in answer text! Query: {query_desc}",
            )

    def test_q1_suggested_questions_grounding(self):
        """Verify all 5 suggested questions return valid answers with strictly correlated citations."""
        sugg = self.client.get_json("/api/v1/ask/suggested")
        questions = sugg.get("questions", [])
        self.assertEqual(len(questions), 5, "Expected exactly 5 suggested questions")

        for q_obj in questions:
            q_text = q_obj["question"]
            with self.subTest(question=q_text):
                res = self.client.post_json("/api/v1/ask/query", json={"query": q_text})
                self._verify_citation_correlation(res, q_text)

    def test_q2_cwc_hydrology_domain_citations(self):
        """Test water level and hydrological warning queries return valid [1]–[6] citations."""
        queries = [
            "Which CWC hydrological stations are reporting water levels above danger mark?",
            "What is the discharge and water level at Basukedar gauge?",
            "Is the Mandakini river flowing above high flood danger level?",
        ]
        for q in queries:
            with self.subTest(query=q):
                res = self.client.post_json("/api/v1/ask/query", json={"query": q})
                self._verify_citation_correlation(res, q)
                # Verify CWC-specific citation content
                c_titles = [c["source_title"] for c in res["citations"]]
                self.assertTrue(
                    any("CWC" in t or "Water" in t for t in c_titles),
                    f"Expected CWC sensor citations for hydrology query: {q}",
                )

    def test_q3_shelter_and_camp_domain_citations(self):
        """Test emergency shelter and relief camp inquiries return valid [1]–[6] citations."""
        queries = [
            "Are relief camps and emergency shelters available near Basukedar?",
            "What is the available capacity in community relief shelters?",
            "Where can displaced pilgrims find emergency shelter and relief accommodation?",
        ]
        for q in queries:
            with self.subTest(query=q):
                res = self.client.post_json("/api/v1/ask/query", json={"query": q})
                self._verify_citation_correlation(res, q)
                c_titles = [c["source_title"] for c in res["citations"]]
                self.assertTrue(
                    any("Shelter" in t or "Camp" in t or "Relief" in t for t in c_titles),
                    f"Expected shelter roster citations for query: {q}",
                )

    def test_q4_landslide_and_highway_severance_citations(self):
        """Test default and landslide-focused queries return valid [1]–[6] citations."""
        queries = [
            "What caused the landslide in Rudraprayag and what is the road status?",
            "How long will it take Border Roads Organisation to clear NH-107?",
            "What is the debris volume from the Basukedar rockfall?",
        ]
        for q in queries:
            with self.subTest(query=q):
                res = self.client.post_json("/api/v1/ask/query", json={"query": q})
                self._verify_citation_correlation(res, q)
                c_titles = [c["source_title"] for c in res["citations"]]
                self.assertTrue(
                    any("SDRF" in t or "BRO" in t or "NH-107" in t or "CWC" in t for t in c_titles),
                    f"Expected SDRF/BRO incident citations for query: {q}",
                )

    def test_q5_adversarial_and_multilingual_query_handling(self):
        """Test queries with Devanagari Hindi, emojis, punctuation, and injection payloads."""
        adversarial_queries = [
            "रुद्रप्रयाग में भूस्खलन और केदारनाथ मार्ग की वर्तमान स्थिति क्या है?",
            "🚨 URGENT: Is NH-107 blocked? What is the water level? 🌊⚠️",
            "What is status of NH-107? ' OR '1'='1 -- ; DROP TABLE event;",
            "<script>alert('xss')</script> Basukedar slope failure",
            "   \n\t  Tell me about the landslide in Rudraprayag   \t\n",
            "A" * 500 + " landslide status?",
        ]
        for q in adversarial_queries:
            with self.subTest(query=q[:30]):
                res = self.client.post_json("/api/v1/ask/query", json={"query": q})
                self.assertIn("answer", res)
                self.assertIn("citations", res)
                self._verify_citation_correlation(res, q[:30])

    def test_q6_empty_and_whitespace_query_boundaries(self):
        """Assert empty and whitespace queries are rejected with HTTP 400."""
        invalid_queries = [
            "",
            "   ",
            "\t\n\r  \n",
        ]
        for bad_q in invalid_queries:
            with self.subTest(query=repr(bad_q)):
                resp = self.client.post("/api/v1/ask/query", json={"query": bad_q})
                self.assertEqual(resp.status_code, 400, f"Expected 400 for bad query {repr(bad_q)}")
                self.assertIn("detail", resp.json())

    def test_q7_missing_json_payload_boundary(self):
        """Assert malformed or missing JSON body returns HTTP 422 Unprocessable Entity."""
        # Missing query key
        resp1 = self.client.post("/api/v1/ask/query", json={"not_query": "hello"})
        self.assertEqual(resp1.status_code, 422)

        # Empty body
        resp2 = self.client.post("/api/v1/ask/query", data="", headers={"Content-Type": "application/json"})
        self.assertEqual(resp2.status_code, 422)

    def test_q8_frontend_tokenizer_simulation(self):
        """Simulate AskView.js citation splitter regex on real API responses."""
        res = self.client.post_json(
            "/api/v1/ask/query",
            json={"query": "What caused the landslide in Rudraprayag?"},
        )
        ans = res["answer"]
        all_sentences = ans["facts"] + ans["inferences"] + ans["predictions"]

        # AskView.js uses: text.split(/(\[\d+\])/g)
        js_split_regex = re.compile(r"(\[\d+\])")
        token_match_regex = re.compile(r"\[(\d+)\]")

        citation_ids_found = set()
        for sentence in all_sentences:
            parts = js_split_regex.split(sentence)
            for part in parts:
                m = token_match_regex.match(part)
                if m:
                    cid = int(m.group(1))
                    citation_ids_found.add(cid)

        # Ensure all IDs 1 through 6 were tokenized cleanly
        self.assertEqual(
            citation_ids_found,
            {1, 2, 3, 4, 5, 6},
            f"Expected citation tokens [1] through [6] to be parsed by frontend tokenizer, found: {citation_ids_found}",
        )
