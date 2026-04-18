import pytest
from outline_generator import _parse_outline


def test_parse_outline_valid():
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


def test_parse_outline_strips_markdown():
    raw = '```json\n{"title": "T", "intro": "I", "sections": [], "conclusion": "C", "estimated_words": 500}\n```'
    result = _parse_outline(raw)
    assert result["title"] == "T"
    assert result["estimated_words"] == 500


def test_parse_outline_sections_have_points():
    raw = '''{
        "title": "T", "intro": "I", "conclusion": "C", "estimated_words": 800,
        "sections": [{"heading": "Section 1", "points": ["point a", "point b"]}]
    }'''
    result = _parse_outline(raw)
    assert result["sections"][0]["points"] == ["point a", "point b"]


def test_parse_outline_raises_on_invalid_json():
    with pytest.raises(Exception):
        _parse_outline("this is not json")
