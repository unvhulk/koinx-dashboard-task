import pytest
from llm import _is_quality_comment, _filter_comments, _word_overlap, _merge_topics, _parse_response


class TestCommentQualityFilter:
    """Comments must meet minimum word count and length to be worth sending to the LLM."""

    def test_rejects_emoji_only(self):
        assert _is_quality_comment("🔥🔥🔥") is False

    def test_rejects_single_word(self):
        assert _is_quality_comment("nice") is False

    def test_rejects_short_comment(self):
        assert _is_quality_comment("great video") is False

    def test_accepts_quality_comment(self):
        assert _is_quality_comment("I have no idea how to file my crypto taxes this year") is True

    def test_filter_removes_junk(self):
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


class TestTopicMerge:
    """Similar topics from the LLM are merged to avoid duplicate cards on the results page."""

    def test_word_overlap_identical(self):
        assert _word_overlap("crypto tax filing", "crypto tax filing") == 1.0

    def test_word_overlap_partial(self):
        score = _word_overlap("crypto tax confusion", "tax confusion india")
        assert 0.4 < score < 1.0

    def test_word_overlap_no_match(self):
        assert _word_overlap("bitcoin price", "income tax deadline") == 0.0

    def test_merge_deduplicates_similar_topics(self):
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

    def test_merge_caps_quotes_at_three(self):
        topics = [
            {"topic": "crypto tax", "frequency": 5, "content_type": "blog",
             "sentiment": "confused", "suggested_title": "T", "example_quotes": ["a", "b", "c", "d", "e"]},
        ]
        merged = _merge_topics(topics)
        assert len(merged[0]["example_quotes"]) <= 3

    def test_merge_deduplicates_quotes(self):
        topics = [
            {"topic": "crypto tax", "frequency": 3, "content_type": "blog",
             "sentiment": "confused", "suggested_title": "T", "example_quotes": ["same quote", "same quote"]},
        ]
        merged = _merge_topics(topics)
        assert merged[0]["example_quotes"].count("same quote") == 1


class TestLLMResponseParser:
    """_parse_response deserialises raw LLM output (may include markdown fences) into topic dicts."""

    def test_parse_clean_json(self):
        raw = '{"topics": [{"topic": "tax filing", "frequency": 5}]}'
        result = _parse_response(raw)
        assert result[0]["topic"] == "tax filing"

    def test_parse_strips_markdown_fences(self):
        raw = '```json\n{"topics": [{"topic": "capital gains", "frequency": 3}]}\n```'
        result = _parse_response(raw)
        assert result[0]["topic"] == "capital gains"

    def test_parse_empty_topics(self):
        raw = '{"topics": []}'
        assert _parse_response(raw) == []

    def test_parse_invalid_json_raises(self):
        with pytest.raises(Exception):
            _parse_response("not json at all")

    def test_parse_missing_topics_key_returns_empty(self):
        assert _parse_response('{"results": []}') == []
