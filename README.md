# KoinX Content Ideas Dashboard

A dashboard that tells the KoinX content team what to write — blogs, videos, and social posts — based on real user comments scraped from YouTube (and optionally Reddit).

## How it works

```
Input: Search Tag + Date Range
       ↓
YouTube Data API v3
  → Find videos matching tag within date range
  → Fetch top comments from each video
       ↓
Optional: Reddit (PRAW)
  → Search relevant crypto subreddits
  → Fetch post comments
       ↓
Groq LLM (llama-3.1-8b-instant)
  → Batch comments (50 at a time)
  → Extract: topic clusters, content type, sentiment, suggested titles
  → Merge results across batches
       ↓
MongoDB
  → Store run + insights
       ↓
Dashboard
  → Frequency chart (what topics are most discussed)
  → Topic cards (what to write + who it's for)
  → Example quotes (what users actually said)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | MongoDB (Motor async driver) |
| LLM | Groq API — llama-3.1-8b-instant |
| YouTube | YouTube Data API v3 |
| Reddit | PRAW (Python Reddit API Wrapper) |
| Frontend | Next.js + Tailwind CSS + recharts |

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free M0 cluster)
- YouTube Data API v3 key
- Groq API key
- (Optional) Reddit app credentials

### 1. Get API Keys

**YouTube Data API v3:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key

**Groq:**
- [console.groq.com](https://console.groq.com) → API Keys → Create

**MongoDB Atlas:**
- [cloud.mongodb.com](https://cloud.mongodb.com) → Free M0 cluster → Connect → Get connection string

**Reddit (optional):**
- [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) → Create app (script type)
- Copy `client_id` (under app name) and `secret`

### 2. Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in your keys in .env

uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd client
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install recharts axios date-fns
npm run dev   # runs on http://localhost:3000
```

---

## Usage

1. Open `http://localhost:3000`
2. Enter a search tag (e.g. `crypto tax india`)
3. Select date range and platforms
4. Click **Analyze**
5. Wait ~30-60 seconds for results
6. View topic breakdown, frequency chart, and content suggestions

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Start a new analysis run |
| GET | `/api/results/{run_id}` | Get results (poll until status=complete) |
| GET | `/api/history` | List past runs |
| GET | `/health` | Health check |

---

## Architecture Notes

**Why YouTube API over Apify**: YouTube Data API v3 is free, official, and handles date filtering natively. The 10K units/day quota covers ~50 videos × 100 comments = 5000 comments per run — sufficient for content strategy use cases.

**Why Groq**: Free tier, fast inference (~200 tokens/sec), llama-3.1-8b handles JSON-mode extraction reliably at temperature=0.

**AI explains, team decides**: The LLM clusters *what users are asking about* — not what the correct answer is. The content team decides what to actually write.

**Extensible platforms**: Adding a new platform (Twitter, TikTok) requires only a new adapter module that returns `list[str]` of comment texts. The LLM pipeline and storage are platform-agnostic.
