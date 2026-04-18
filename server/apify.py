import httpx
from datetime import date
from config import settings

BASE = "https://api.apify.com/v2"
HEADERS = {"Authorization": f"Bearer {settings.apify_api_key}"}

TIKTOK_ACTOR = "clockworks/free-tiktok-scraper"
TWITTER_ACTOR = "quacker/twitter-scraper"


async def _run_actor(actor: str, payload: dict) -> list[dict]:
    url = f"{BASE}/acts/{actor}/run-sync-get-dataset-items"
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(url, json=payload, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()


async def fetch_tiktok_comments(
    tag: str,
    start: date,
    end: date,
    max_comments: int = 200,
) -> list[str]:
    payload = {
        "searchQueries": [tag],
        "maxVideos": 20,
        "maxComments": max_comments,
        "dateFrom": start.isoformat(),
        "dateTo": end.isoformat(),
    }
    try:
        items = await _run_actor(TIKTOK_ACTOR, payload)
    except Exception:
        return []

    comments: list[str] = []
    seen: set[str] = set()
    for item in items:
        for c in item.get("comments", []):
            text = (c.get("text") or "").strip()
            if text and text not in seen:
                seen.add(text)
                comments.append(text)
            if len(comments) >= max_comments:
                return comments
    return comments


async def fetch_twitter_comments(
    tag: str,
    start: date,
    end: date,
    max_tweets: int = 200,
) -> list[str]:
    payload = {
        "searchTerms": [tag],
        "maxItems": max_tweets,
        "since": start.isoformat(),
        "until": end.isoformat(),
        "lang": "en",
    }
    try:
        items = await _run_actor(TWITTER_ACTOR, payload)
    except Exception:
        return []

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
