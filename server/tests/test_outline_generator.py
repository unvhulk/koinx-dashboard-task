import pytest
from outline_generator import _parse_outline


class TestOutlineParser:
    """_parse_outline deserialises raw LLM output into the structured dict used by OutlineResponse."""

    def test_parse_outline_valid(self):
        raw = '''{
            "title": "How to File Crypto Tax in India",
            "intro": "If you traded crypto in India, here is exactly what you owe.",
            "sections": [
                {"heading": "What counts as taxable", "points": ["All trades", "Mining income"]},
                {"heading": "How to calculate gains", "points": ["FIFO method", "Subtract fees"]}
            ],
            "conclusion": "Use KoinX to calculate and file in minutes.",
            "estimated_words": 900
        }'''
        result = _parse_outline(raw)
        assert result["title"] == "How to File Crypto Tax in India"
        assert len(result["sections"]) == 2
        assert result["estimated_words"] == 900

    def test_parse_outline_strips_markdown(self):
        raw = '```json\n{"title": "T", "intro": "I", "sections": [], "conclusion": "C", "estimated_words": 500}\n```'
        result = _parse_outline(raw)
        assert result["title"] == "T"
        assert result["estimated_words"] == 500

    def test_parse_outline_sections_have_points(self):
        raw = '''{
            "title": "T", "intro": "I", "conclusion": "C", "estimated_words": 800,
            "sections": [{"heading": "Section 1", "points": ["point a", "point b"]}]
        }'''
        result = _parse_outline(raw)
        assert result["sections"][0]["points"] == ["point a", "point b"]

    def test_parse_outline_raises_on_invalid_json(self):
        with pytest.raises(Exception):
            _parse_outline("this is not json")

    def test_parse_outline_missing_estimated_words_defaults(self):
        """LLM sometimes omits estimated_words — should default to 800 rather than raise KeyError."""
        raw = '{"title": "T", "intro": "I", "sections": [], "conclusion": "C"}'
        result = _parse_outline(raw)
        assert result["estimated_words"] == 800

    def test_parse_outline_missing_optional_fields_defaults(self):
        raw = '{"title": "T", "sections": []}'
        result = _parse_outline(raw)
        assert result["intro"] == ""
        assert result["conclusion"] == ""
        assert result["estimated_words"] == 800
