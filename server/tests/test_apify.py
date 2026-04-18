from datetime import date
from apify import _in_range, _parse_twitter_date


class TestDateFiltering:
    """Date range enforcement applied client-side after actor response."""

    def test_in_range_inclusive(self):
        assert _in_range(__import__('datetime').datetime(2024, 6, 15), date(2024, 1, 1), date(2024, 12, 31)) is True

    def test_in_range_start_boundary(self):
        assert _in_range(__import__('datetime').datetime(2024, 1, 1), date(2024, 1, 1), date(2024, 12, 31)) is True

    def test_in_range_end_boundary(self):
        assert _in_range(__import__('datetime').datetime(2024, 12, 31), date(2024, 1, 1), date(2024, 12, 31)) is True

    def test_in_range_before_start(self):
        assert _in_range(__import__('datetime').datetime(2023, 12, 31), date(2024, 1, 1), date(2024, 12, 31)) is False

    def test_in_range_after_end(self):
        assert _in_range(__import__('datetime').datetime(2025, 1, 1), date(2024, 1, 1), date(2024, 12, 31)) is False

    def test_parse_twitter_date_valid(self):
        dt = _parse_twitter_date("Sat Apr 18 17:12:30 +0000 2024")
        assert dt is not None
        assert dt.year == 2024
        assert dt.month == 4
        assert dt.day == 18

    def test_parse_twitter_date_invalid(self):
        assert _parse_twitter_date("not a date") is None
        assert _parse_twitter_date("") is None
        assert _parse_twitter_date(None) is None


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
