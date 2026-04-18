# KoinX Content Ideas Dashboard

A dashboard that tells the KoinX content team what to write — blogs, videos, and social posts — based on real user comments scraped from YouTube, TikTok, and Twitter/X.

## Features

- **Multi-platform ingestion** — YouTube (Data API v3), TikTok and Twitter/X (via Apify); each platform isolated so one failure doesn't kill the run
- **Enhanced search** — auto-expands a single tag into multiple semantic variants via LLM, deduplicates across queries; works across all platforms
- **Quality filters** — min views, min subscribers, min comments, video duration, sort order, India region focus
- **LLM topic extraction** — Groq (llama-3.1-8b-instant) clusters comments into topics with sentiment, content type (blog / video / social), frequency, and example quotes
- **Blog outline generator** — one click per topic → structured outline with title, intro, sections, conclusion; refine with natural language instructions
- **Outline history** — every generated outline saved to MongoDB; reload and iterate
- **Pipeline observability** — CloudWatch-style log view per run showing every stage (search → filter → comments → LLM) with timings and metadata
- **Run history** — all past analyses with topic counts, date ranges, and status

## How it works

```
Search tag + platform selection + filters
        ↓
Optional: Enhanced search
  → LLM expands tag into multiple query variants (all platforms)
        ↓
YouTube Data API v3 (if selected)
  → Search videos (native filters: duration, sort, region, India focus)
  → Filter by stats: min_views, min_subscribers, min_comments
  → Fetch top comments per video
        ↓
TikTok via Apify (if selected)
  → Search videos by tag
  → Extract captions as content
        ↓
Twitter/X via Apify (if selected)
  → Search tweets by tag
  → Extract tweet text as content
        ↓
Groq LLM (llama-3.1-8b-instant)
  → Batch content (50 items at a time) per platform
  → Extract topic clusters: content type, sentiment, title suggestion, example quotes
  → Merge + deduplicate topics across batches and platforms
        ↓
MongoDB
  → Store run + insights + pipeline logs
        ↓
Dashboard
  → Frequency chart  →  Topic cards (filterable by platform)  →  Outline generator  →  Pipeline logs
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Database | MongoDB (Motor async driver) |
| LLM | Groq API — llama-3.1-8b-instant |
| YouTube | YouTube Data API v3 |
| TikTok + Twitter/X | Apify actors |
| Frontend | Next.js 14 + Tailwind CSS + Recharts |

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free M0 cluster works)
- YouTube Data API v3 key
- Groq API key
- Apify API key (free tier — for TikTok and Twitter/X)

### 1. Get API Keys

**YouTube Data API v3:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable "YouTube Data API v3"
3. Credentials → API Key

**Groq:**
- [console.groq.com](https://console.groq.com) → API Keys → Create

**MongoDB Atlas:**
- [cloud.mongodb.com](https://cloud.mongodb.com) → Free M0 cluster → Connect → copy connection string

**Apify (TikTok + Twitter/X):**
- [apify.com](https://apify.com) → Sign up → Settings → API & Integrations → copy Personal API token

### 2. Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in MONGODB_URI, YOUTUBE_API_KEY, GROQ_API_KEY, APIFY_API_KEY

uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev   # http://localhost:3000
```

---

## Running Tests

### Backend (pytest)

```bash
cd server
source .venv/bin/activate
pytest tests/ -v
```

33 tests across four files, organised by feature class:
- `TestCommentQualityFilter`, `TestTopicMerge`, `TestLLMResponseParser` — LLM extraction logic
- `TestQueryParser` — query expander
- `TestOutlineParser` — outline generator
- `TestApifyResponseParsing` — TikTok/Twitter response parsing (no API calls)

### Frontend (Vitest)

```bash
cd client
npm test
```

16 tests covering pure utility functions: date formatting, slug generation, markdown export, search parameter defaults.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Start a new analysis run |
| GET | `/api/results/{run_id}` | Poll until `status=complete` |
| GET | `/api/history` | List past runs (no insights payload) |
| GET | `/api/logs/{run_id}` | Pipeline log events for a run |
| POST | `/api/outline` | Generate blog outline for a topic |
| POST | `/api/outline/refine` | Refine existing outline with instruction |
| POST | `/api/outline/save` | Persist outline to MongoDB |
| GET | `/api/outlines/{run_id}?topic=slug` | Load outline history for a topic |
| GET | `/health` | Health check |

---

## Architecture Notes

**Why YouTube API over scraping:** YouTube Data API v3 is free, official, and handles date filtering natively. The 10K units/day quota covers ~50 videos × 100 comments = 5,000 comments per run — sufficient for content strategy use cases.

**Why Groq:** Free tier, fast inference (~200 tokens/sec), llama-3.1-8b handles JSON-mode extraction reliably at temperature=0. The pipeline batches comments in groups of 50 to stay within context limits and merges results.

**Quota optimisation:** `videos.list` and `channels.list` API calls (for view count / subscriber filters) are skipped entirely when all stat filters are set to zero. Native `search.list` params (`videoDuration`, `order`, `regionCode`) cost no extra quota.

**Pipeline observability:** Every run emits structured log events to a `pipeline_logs` MongoDB collection (TTL: 7 days). The `/logs/[run_id]` page polls these in real time so you can see exactly why a run returned 0 topics — quota hit, no matching videos, LLM parse error, etc.

**Platform isolation:** Each platform (YouTube, TikTok, Twitter/X) runs in its own try/except block. If one fails — quota exhausted, actor blocked, timeout — the others still complete and results are saved normally. Failures appear as `warn` entries in the pipeline logs.

**Apify actors used:** `clockworks/free-tiktok-scraper` for TikTok video captions, `gentle_cloud/twitter-tweets-scraper` for tweets.

---

## Troubleshooting

**YouTube quota exceeded**
> `RuntimeError: YouTube API quota exceeded. Try again tomorrow.`

The free quota resets at midnight Pacific. Narrow the date range or reduce `max_videos` to stay within 10K units/day.

**Run returns 0 topics**
Check the pipeline logs (`/logs/{run_id}`) — common causes:
- Quality filters too strict (lower `min_views` / `min_comments`)
- Date range too narrow (no videos published in that window)
- Comments disabled on matching videos (403 from YouTube → silently skipped)

**TikTok / Twitter returns 0 topics**
Check pipeline logs for `apify.tiktok.error` or `apify.twitter.error` — likely Apify credit exhaustion. YouTube results in the same run are unaffected. Top up Apify credits at [apify.com/billing](https://apify.com/billing).

**Run stuck at "processing"**
Backend crashed mid-run. Restart the server and submit a new run — the stuck run will remain in the database as `processing` and can be ignored.
