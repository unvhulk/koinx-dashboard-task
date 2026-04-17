import pytest
from llm import _is_quality_comment, _filter_comments, _word_overlap, _merge_topics, _parse_response


# --- Comment quality filter ---

def test_rejects_emoji_only():
    assert _is_quality_comment("🔥🔥🔥") is False


def test_rejects_single_word():
    assert _is_quality_comment("nice") is False


def test_rejects_short_comment():
    assert _is_quality_comment("great video") is False


def test_accepts_quality_comment():
    assert _is_quality_comment("I have no idea how to file my crypto taxes this year") is True


def test_filter_removes_junk():
    comments = [
        "🔥",
        "nice!",
        "I don't understand how crypto tax works in India for FY 2024",
        "same",
        "Can someone explain how to calculate capital gains on Bitcoin sales?",
    ]
    result = _filter_comments(comments)
    assert len(result) == 2
    assert all(len(c) >= 30 for c in result)


# --- Word overlap / topic merge ---

def test_word_overlap_identical():
    assert _word_overlap("crypto tax filing", "crypto tax filing") == 1.0


def test_word_overlap_partial():
    score = _word_overlap("crypto tax confusion", "tax confusion india")
    assert 0.4 < score < 1.0


def test_word_overlap_no_match():
    assert _word_overlap("bitcoin price", "income tax deadline") == 0.0


def test_merge_deduplicates_similar_topics():
    topics = [
        {"topic": "crypto tax filing india", "frequency": 10, "content_type": "blog",
         "sentiment": "confused", "suggested_title": "Title A", "example_quotes": ["q1"]},
        {"topic": "india crypto tax filing", "frequency": 8, "content_type": "blog",
         "sentiment": "confused", "suggested_title": "Title B", "example_quotes": ["q2"]},
        {"topic": "bitcoin price prediction", "frequency": 5, "content_type": "video",
         "sentiment": "curious", "suggested_title": "Title C", "example_quotes": ["q3"]},
    ]
    merged = _merge_topics(topics)
    assert len(merged) == 2
    crypto_topic = next(t for t in merged if "crypto" in t["topic"] or "india" in t["topic"])
    assert crypto_topic["frequency"] == 18


def test_merge_caps_quotes_at_three():
    topics = [
        {"topic": "crypto tax", "frequency": 5, "content_type": "blog",
         "sentiment": "confused", "suggested_title": "T", "example_quotes": ["a", "b", "c", "d", "e"]},
    ]
    merged = _merge_topics(topics)
    assert len(merged[0]["example_quotes"]) <= 3


def test_merge_deduplicates_quotes():
    topics = [
        {"topic": "crypto tax", "frequency": 3, "content_type": "blog",
         "sentiment": "confused", "suggested_title": "T", "example_quotes": ["same quote", "same quote"]},
    ]
    merged = _merge_topics(topics)
    assert merged[0]["example_quotes"].count("same quote") == 1


# --- LLM response parser ---

def test_parse_clean_json():
    raw = '{"topics": [{"topic": "tax filing", "frequency": 5}]}'
    result = _parse_response(raw)
    assert result[0]["topic"] == "tax filing"


def test_parse_strips_markdown_fences():
    raw = '```json\n{"topics": [{"topic": "capital gains", "frequency": 3}]}\n```'
    result = _parse_response(raw)
    assert result[0]["topic"] == "capital gains"


def test_parse_empty_topics():
    raw = '{"topics": []}'
    assert _parse_response(raw) == []
