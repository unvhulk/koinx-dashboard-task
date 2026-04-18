import httpx
from datetime import date, datetime
from config import settings

BASE = "https://api.apify.com/v2"

# clockworks/free-tiktok-scraper — returns video metadata (text = caption)
TIKTOK_ACTOR = "clockworks~free-tiktok-scraper"
# gentle_cloud/twitter-tweets-scraper — returns real tweets with full_text
TWITTER_ACTOR = "gentle_cloud~twitter-tweets-scraper"


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.apify_api_key}"}


async def _run_actor(actor: str, payload: dict, timeout: int = 120) -> list[dict]:
    url = f"{BASE}/acts/{actor}/run-sync-get-dataset-items"
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, json=payload, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, list):
            return []
        return [item for item in data if "noResults" not in item]


def _in_range(dt: datetime, start: date, end: date) -> bool:
    return start <= dt.date() <= end


def _parse_twitter_date(raw: str) -> datetime | None:
    try:
        return datetime.strptime(raw, "%a %b %d %H:%M:%S +0000 %Y")
    except (ValueError, TypeError):
        return None


async def fetch_tiktok_comments(
    tag: str,
    start: date,
    end: date,
    max_comments: int = 200,
) -> list[str]:
    """
    Uses video captions (text field) as the analysable content.
    free-tiktok-scraper does not return comment threads — captions
    capture the creator angle which reflects what the audience searches for.
    Results are filtered client-side by createTimeISO since the actor
    does not reliably enforce dateFrom/dateTo server-side.
    """
    payload = {
        "searchQueries": [tag],
        "resultsPerPage": min(max_comments, 50),
    }
    try:
        items = await _run_actor(TIKTOK_ACTOR, payload)
    except Exception as e:
        raise RuntimeError(f"TikTok Apify fetch failed: {e}") from e

    texts: list[str] = []
    seen: set[str] = set()
    for item in items:
        raw_ts = item.get("createTimeISO") or ""
        if raw_ts:
            try:
                item_date = datetime.fromisoformat(raw_ts.replace("Z", "+00:00")).date()
                if not (start <= item_date <= end):
                    continue
            except (ValueError, TypeError):
                pass
        text = (item.get("text") or "").strip()
        if text and text not in seen:
            seen.add(text)
            texts.append(text)
        if len(texts) >= max_comments:
            break
    return texts


async def fetch_twitter_comments(
    tag: str,
    start: date,
    end: date,
    max_tweets: int = 200,
) -> list[str]:
    """
    Results filtered client-side by created_at since the actor does not
    reliably enforce date ranges server-side.
    """
    payload = {
        "searchQueries": [tag],
        "maxTweetsPerQuery": min(max_tweets, 200),
    }
    try:
        items = await _run_actor(TWITTER_ACTOR, payload)
    except Exception as e:
        raise RuntimeError(f"Twitter Apify fetch failed: {e}") from e

    tweets: list[str] = []
    seen: set[str] = set()
    for item in items:
        raw_ts = item.get("created_at") or ""
        if raw_ts:
            dt = _parse_twitter_date(raw_ts)
            if dt and not _in_range(dt, start, end):
                continue
        text = (item.get("full_text") or item.get("text") or "").strip()
        if text and text not in seen:
            seen.add(text)
            tweets.append(text)
        if len(tweets) >= max_tweets:
            break
    return tweets
