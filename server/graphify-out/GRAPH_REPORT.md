# Graph Report - .  (2026-04-18)

## Corpus Check
- Corpus is ~1,885 words - fits in a single context window. You may not need a graph.

## Summary
- 80 nodes · 146 edges · 10 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Config & Reddit Fetching|Config & Reddit Fetching]]
- [[_COMMUNITY_Analysis Pipeline Core|Analysis Pipeline Core]]
- [[_COMMUNITY_Database & API Layer|Database & API Layer]]
- [[_COMMUNITY_Comment Quality Tests|Comment Quality Tests]]
- [[_COMMUNITY_Comment Filtering|Comment Filtering]]
- [[_COMMUNITY_Topic Merging & Dedup|Topic Merging & Dedup]]
- [[_COMMUNITY_LLM Client & Prompts|LLM Client & Prompts]]
- [[_COMMUNITY_Response Parsing|Response Parsing]]
- [[_COMMUNITY_Word Overlap Utility|Word Overlap Utility]]
- [[_COMMUNITY_Test Init|Test Init]]

## God Nodes (most connected - your core abstractions)
1. `_run_pipeline()` - 12 edges
2. `extract_insights()` - 11 edges
3. `Settings` - 9 edges
4. `_merge_topics()` - 9 edges
5. `_is_quality_comment()` - 8 edges
6. `fetch_comments()` - 8 edges
7. `get_db()` - 8 edges
8. `_word_overlap()` - 7 edges
9. `_parse_response()` - 6 edges
10. `_call_llm()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `search_videos()` --references--> `httpx 0.27.2 (async HTTP client)`  [EXTRACTED]
  youtube.py → requirements.txt
- `fetch_comments()` --semantically_similar_to--> `fetch_comments()`  [INFERRED] [semantically similar]
  reddit.py → youtube.py
- `Settings` --references--> `pydantic 2.9.2 + pydantic-settings`  [EXTRACTED]
  config.py → requirements.txt
- `Python 3.11.9 runtime` --conceptually_related_to--> `FastAPI app (KoinX Content Ideas API)`  [INFERRED]
  runtime.txt → main.py
- `test_llm.py (pytest unit tests for LLM helpers)` --references--> `pytest 8.3.3 + pytest-asyncio (dev deps)`  [EXTRACTED]
  tests/test_llm.py → requirements-dev.txt

## Hyperedges (group relationships)
- **Multi-Platform Comment Ingestion Pipeline** — youtube_fetch_comments, reddit_fetch_comments, main_run_pipeline [EXTRACTED 0.95]
- **LLM Topic Extraction and Deduplication Flow** — llm_filter_comments, llm_call_llm, llm_merge_topics [EXTRACTED 1.00]
- **Analysis Run Lifecycle (Create → Process → Store)** — main_analyze_endpoint, main_run_pipeline, database_get_db [EXTRACTED 0.95]

## Communities

### Community 0 - "Config & Reddit Fetching"
Cohesion: 0.15
Nodes (14): BaseSettings, Config, Settings, _client(), CRYPTO_SUBREDDITS constant (5 target subreddits), fetch_comments(), Search Reddit for posts matching tag, return comment texts within date range., httpx 0.27.2 (async HTTP client) (+6 more)

### Community 1 - "Analysis Pipeline Core"
Cohesion: 0.29
Nodes (16): BaseModel, Enum, BATCH_SIZE=50 comment batching constant, extract_insights(), POST /api/analyze endpoint, _run_pipeline(), AnalysisRun, AnalyzeRequest (+8 more)

### Community 2 - "Database & API Layer"
Cohesion: 0.16
Nodes (13): connect(), disconnect(), get_db(), analyze(), FastAPI app (KoinX Content Ideas API), get_history(), GET /api/history endpoint, get_results() (+5 more)

### Community 3 - "Comment Quality Tests"
Cohesion: 0.53
Nodes (5): _is_quality_comment(), test_accepts_quality_comment(), test_rejects_emoji_only(), test_rejects_short_comment(), test_rejects_single_word()

### Community 4 - "Comment Filtering"
Cohesion: 0.4
Nodes (4): _filter_comments(), pytest 8.3.3 + pytest-asyncio (dev deps), test_filter_removes_junk(), test_llm.py (pytest unit tests for LLM helpers)

### Community 5 - "Topic Merging & Dedup"
Cohesion: 0.4
Nodes (5): MERGE_SIMILARITY_THRESHOLD=0.45 fuzzy merge constant, _merge_topics(), test_merge_caps_quotes_at_three(), test_merge_deduplicates_quotes(), test_merge_deduplicates_similar_topics()

### Community 6 - "LLM Client & Prompts"
Cohesion: 0.5
Nodes (5): _call_llm(), AsyncGroq client (module-level singleton), SYSTEM_PROMPT (KoinX content strategist persona), USER_PROMPT_TEMPLATE (comment analysis template), groq 0.11.0 SDK dependency

### Community 7 - "Response Parsing"
Cohesion: 0.5
Nodes (4): _parse_response(), test_parse_clean_json(), test_parse_empty_topics(), test_parse_strips_markdown_fences()

### Community 8 - "Word Overlap Utility"
Cohesion: 0.5
Nodes (4): _word_overlap(), test_word_overlap_identical(), test_word_overlap_no_match(), test_word_overlap_partial()

### Community 9 - "Test Init"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **16 isolated node(s):** `Return list of {video_id, title} matching the tag within date range.`, `Return top comment texts for a video.`, `Config`, `Search Reddit for posts matching tag, return comment texts within date range.`, `GET /api/results/{run_id} endpoint` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Test Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `extract_insights()` connect `Analysis Pipeline Core` to `Comment Filtering`, `Topic Merging & Dedup`, `LLM Client & Prompts`?**
  _High betweenness centrality (0.404) - this node is a cross-community bridge._
- **Why does `_run_pipeline()` connect `Analysis Pipeline Core` to `Config & Reddit Fetching`, `Database & API Layer`?**
  _High betweenness centrality (0.403) - this node is a cross-community bridge._
- **Why does `Settings` connect `Config & Reddit Fetching` to `Database & API Layer`, `LLM Client & Prompts`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `_run_pipeline()` (e.g. with `fetch_comments()` and `str`) actually correct?**
  _`_run_pipeline()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `_merge_topics()` (e.g. with `test_merge_deduplicates_similar_topics()` and `test_merge_caps_quotes_at_three()`) actually correct?**
  _`_merge_topics()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `str` (e.g. with `fetch_comments()` and `_run_pipeline()`) actually correct?**
  _`str` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Return list of {video_id, title} matching the tag within date range.`, `Return top comment texts for a video.`, `Config` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._