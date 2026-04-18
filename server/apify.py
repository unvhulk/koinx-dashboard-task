import httpx
from datetime import date
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
        text = (item.get("full_text") or item.get("text") or "").strip()
        if text and text not in seen:
            seen.add(text)
            tweets.append(text)
        if len(tweets) >= max_tweets:
            break
    return tweets
