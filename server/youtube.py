import httpx
from datetime import date
from config import settings

BASE = "https://www.googleapis.com/youtube/v3"


async def search_videos(
    tag: str,
    start: date,
    end: date,
    max_results: int = 20,
    min_views: int = 0,
    min_subscribers: int = 0,
    min_comments: int = 0,
    video_duration: str = "any",
    sort_order: str = "relevance",
    india_focus: bool = False,
) -> list[dict]:
    """Return list of {video_id, title} matching all filters."""
    params = {
        "part": "snippet",
        "q": tag,
        "type": "video",
        "order": sort_order,
        "publishedAfter": f"{start.isoformat()}T00:00:00Z",
        "publishedBefore": f"{end.isoformat()}T23:59:59Z",
        "maxResults": min(max_results, 50),
        "key": settings.youtube_api_key,
    }
    if video_duration != "any":
        params["videoDuration"] = video_duration
    if india_focus:
        params["regionCode"] = "IN"
        params["relevanceLanguage"] = "en"

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE}/search", params=params, timeout=15)
        resp.raise_for_status()
        items = resp.json().get("items", [])

        candidates = [
            {
                "video_id": i["id"]["videoId"],
                "title": i["snippet"]["title"],
                "channel_id": i["snippet"]["channelId"],
            }
            for i in items
            if i.get("id", {}).get("videoId")
        ]

        if not candidates:
            return []

        needs_video_stats = min_views > 0 or min_comments > 0
        needs_channel_stats = min_subscribers > 0

        if not needs_video_stats and not needs_channel_stats:
            return [{"video_id": v["video_id"], "title": v["title"]} for v in candidates]

        video_ids = [v["video_id"] for v in candidates]
        channel_ids = list({v["channel_id"] for v in candidates})

        video_stats = await _fetch_video_stats(video_ids, client) if needs_video_stats else {}
        sub_counts = await _fetch_channel_stats(channel_ids, client) if needs_channel_stats else {}

    filtered = []
    for v in candidates:
        stats = video_stats.get(v["video_id"], {})
        if stats.get("views", 0) < min_views:
            continue
        if stats.get("comments", 0) < min_comments:
            continue
        if sub_counts.get(v["channel_id"], 0) < min_subscribers:
            continue
        filtered.append({"video_id": v["video_id"], "title": v["title"]})
    return filtered


async def _fetch_video_stats(video_ids: list[str], client: httpx.AsyncClient) -> dict[str, dict]:
    """Returns {video_id: {views, comments}}. Batches up to 50 IDs."""
    if not video_ids:
        return {}
    resp = await client.get(
        f"{BASE}/videos",
        params={
            "part": "statistics",
            "id": ",".join(video_ids[:50]),
            "key": settings.youtube_api_key,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return {
        item["id"]: {
            "views": int(item.get("statistics", {}).get("viewCount", 0)),
            "comments": int(item.get("statistics", {}).get("commentCount", 0)),
        }
        for item in resp.json().get("items", [])
    }


async def _fetch_channel_stats(channel_ids: list[str], client: httpx.AsyncClient) -> dict[str, int]:
    """Returns {channel_id: subscriber_count}. Batches up to 50 IDs."""
    if not channel_ids:
        return {}
    resp = await client.get(
        f"{BASE}/channels",
        params={
            "part": "statistics",
            "id": ",".join(channel_ids[:50]),
            "key": settings.youtube_api_key,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return {
        item["id"]: int(item.get("statistics", {}).get("subscriberCount", 0))
        for item in resp.json().get("items", [])
    }


async def fetch_comments(video_id: str, max_comments: int = 100) -> list[str]:
    """Return top comment texts for a video."""
    comments = []
    page_token = None
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": 100,
        "order": "relevance",
        "textFormat": "plainText",
        "key": settings.youtube_api_key,
    }
    async with httpx.AsyncClient() as client:
        while len(comments) < max_comments:
            if page_token:
                params["pageToken"] = page_token
            try:
                resp = await client.get(f"{BASE}/commentThreads", params=params, timeout=15)
                resp.raise_for_status()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 403:
                    break
                if e.response.status_code == 429 or "quotaExceeded" in e.response.text:
                    raise RuntimeError("YouTube API quota exceeded. Try again tomorrow.") from e
                raise
            data = resp.json()
            seen: set[str] = set()
            for item in data.get("items", []):
                text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"].strip()
                if text and text not in seen:
                    seen.add(text)
                    comments.append(text)
            page_token = data.get("nextPageToken")
            if not page_token or len(comments) >= max_comments:
                break
    return comments[:max_comments]
