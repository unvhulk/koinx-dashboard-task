from query_expander import _parse_queries


class TestQueryParser:
    """_parse_queries deserialises the LLM's query-expansion response into a clean list of search strings."""

    def test_parse_queries_valid_json(self):
        raw = '{"queries": ["how to file crypto taxes india", "bitcoin capital gains tax"]}'
        result = _parse_queries(raw)
        assert result == ["how to file crypto taxes india", "bitcoin capital gains tax"]

    def test_parse_queries_strips_markdown(self):
        raw = '```json\n{"queries": ["crypto tax deadline india", "crypto losses ITR"]}\n```'
        result = _parse_queries(raw)
        assert len(result) == 2
        assert "crypto tax deadline india" in result

    def test_parse_queries_empty(self):
        raw = '{"queries": []}'
        assert _parse_queries(raw) == []

    def test_parse_queries_deduplicates(self):
        raw = '{"queries": ["crypto tax india", "Crypto Tax India", "bitcoin tax india"]}'
        result = _parse_queries(raw)
        # case-insensitive dedup: "crypto tax india" and "Crypto Tax India" are same
        assert len(result) == 2

    def test_parse_queries_strips_whitespace(self):
        raw = '{"queries": ["  crypto tax  ", "bitcoin tax india  "]}'
        result = _parse_queries(raw)
        assert result[0] == "crypto tax"
        assert result[1] == "bitcoin tax india"
