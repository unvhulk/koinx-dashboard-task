# Frontend Tasks — KoinX Content Ideas Dashboard

**Stack**: Next.js (App Router) + Tailwind CSS + recharts  
**Backend base URL**: `http://localhost:8000`

---

## Setup

```bash
cd client
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install recharts axios date-fns
```

---

## API Contract (what the backend returns)

### POST /api/analyze
**Request body:**
```json
{
  "search_tag": "crypto tax india",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "platforms": ["youtube"],
  "max_videos": 20
}
```
**Response:**
```json
{ "run_id": "66abc123...", "status": "pending" }
```

### GET /api/results/:run_id
**Response:**
```json
{
  "id": "66abc123",
  "search_tag": "crypto tax india",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "status": "complete",
  "video_count": 18,
  "comment_count": 640,
  "created_at": "2024-04-15T10:30:00",
  "insights": [
    {
      "topic": "India crypto tax deadline confusion",
      "content_type": "blog",
      "frequency": 87,
      "sentiment": "confused",
      "suggested_title": "When Is the Crypto Tax Deadline in India? 2024 Guide",
      "example_quotes": ["I don't understand when...", "Can someone explain..."],
      "platform": "youtube"
    }
  ]
}
```
**Status polling**: poll every 3 seconds while status is `pending` or `processing`.

### GET /api/history
**Response:** Array of runs (same shape, but `insights` field excluded for performance)

---

## Pages to Build

### 1. Home page — `/` (`app/page.tsx`)
Search form with:
- Text input: "Search Tag" (e.g. "crypto tax india")
- Date range: two date pickers (start_date, end_date)
- Platform checkboxes: YouTube (checked by default), Reddit (optional)
- Max videos slider or input (1–50, default 20)
- Submit button: "Analyze" → POST to `/api/analyze` → redirect to `/results/[run_id]`

**Validation**: start_date < end_date, search_tag not empty

---

### 2. Results page — `/results/[id]` (`app/results/[id]/page.tsx`)

**Loading state** (status = pending | processing):
- Spinner with message: "Fetching videos and comments…"
- Poll GET `/api/results/:id` every 3 seconds until status = complete | failed

**Complete state** — show:
1. **Summary bar**: `{video_count} videos · {comment_count} comments · {insights.length} topics found`

2. **Frequency bar chart** (recharts `BarChart`):
   - X-axis: topic labels
   - Y-axis: frequency (comment count)
   - Color bars by content_type: blog=blue, video=orange, social=green

3. **Topic cards** (grid, 2-3 cols):
   Each card shows:
   - Topic label (bold)
   - Badge: content_type (colored)
   - Badge: sentiment (icon + label — confused=❓, concerned=⚠️, curious=💡, positive=✅)
   - Suggested title (italic, slightly muted)
   - Frequency: "87 comments"
   - Collapsible quotes section: "View example quotes" → expand to show 2-3 quotes

4. **Filter bar** above cards:
   - Filter by content_type: All | Blog | Video | Social (tab-style buttons)
   - Filter by platform: All | YouTube | Reddit

**Failed state**: error message with retry button

---

### 3. History page — `/history` (`app/history/page.tsx`)
Table or card list of past runs:
- Columns: Search Tag | Date Range | Status | Videos | Comments | Topics | Date Run | "View" button
- Click "View" → navigate to `/results/[id]`
- Link from navbar

---

## Components to Build

| Component | File | Purpose |
|-----------|------|---------|
| SearchForm | `components/SearchForm.tsx` | Home page form with validation |
| StatusPoller | `components/StatusPoller.tsx` | Hook or component that polls GET results |
| FrequencyChart | `components/FrequencyChart.tsx` | Recharts bar chart of topic frequency |
| TopicCard | `components/TopicCard.tsx` | Single topic card with expand/collapse quotes |
| ContentTypeBadge | `components/ContentTypeBadge.tsx` | Colored badge: blog/video/social |
| SentimentBadge | `components/SentimentBadge.tsx` | Sentiment label with icon |
| FilterBar | `components/FilterBar.tsx` | content_type + platform filter tabs |
| Navbar | `components/Navbar.tsx` | Logo + "History" link |

---

## Utility / API layer

Create `lib/api.ts`:
```ts
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function startAnalysis(body: AnalyzeRequest): Promise<{ run_id: string }> { ... }
export async function getResults(runId: string): Promise<AnalysisRun> { ... }
export async function getHistory(): Promise<AnalysisRun[]> { ... }
```

---

## Color scheme suggestion
- Blog: `bg-blue-100 text-blue-700`
- Video: `bg-orange-100 text-orange-700`
- Social: `bg-green-100 text-green-700`
- Confused: `bg-red-50 text-red-600`
- Concerned: `bg-yellow-50 text-yellow-600`
- Curious: `bg-purple-50 text-purple-600`
- Positive: `bg-emerald-50 text-emerald-600`

---

## Environment variable

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running locally

```bash
cd client
npm run dev   # runs on port 3000
```

Make sure backend is running on port 8000 first.
