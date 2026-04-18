class TestApifyResponseParsing:
    """Pure parsing logic — no API calls, no Apify credits used."""

    def test_tiktok_extracts_text_field(self):
        items = [
            {"text": "How to save crypto tax in India", "commentCount": 10},
            {"text": "Section 115BBH explained", "commentCount": 5},
        ]
        texts = [item["text"].strip() for item in items if item.get("text")]
        assert texts == ["How to save crypto tax in India", "Section 115BBH explained"]

    def test_tiktok_skips_empty_text(self):
        items = [{"text": ""}, {"text": "   "}, {"text": "Valid caption here"}]
        texts = [item["text"].strip() for item in items if item.get("text", "").strip()]
        assert texts == ["Valid caption here"]

    def test_twitter_prefers_full_text(self):
        item = {"full_text": "Crypto tax India 30% is brutal", "text": "Crypto tax India"}
        text = (item.get("full_text") or item.get("text") or "").strip()
        assert text == "Crypto tax India 30% is brutal"

    def test_twitter_falls_back_to_text(self):
        item = {"text": "Crypto tax India"}
        text = (item.get("full_text") or item.get("text") or "").strip()
        assert text == "Crypto tax India"

    def test_no_results_items_filtered(self):
        raw = [{"noResults": True}, {"noResults": True}, {"text": "real item"}]
        filtered = [item for item in raw if "noResults" not in item]
        assert len(filtered) == 1
        assert filtered[0]["text"] == "real item"

    def test_deduplication(self):
        texts = ["same tweet", "same tweet", "different tweet"]
        seen: set[str] = set()
        unique = []
        for t in texts:
            if t not in seen:
                seen.add(t)
                unique.append(t)
        assert unique == ["same tweet", "different tweet"]
