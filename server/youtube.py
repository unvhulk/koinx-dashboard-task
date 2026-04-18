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
) -> list[dict]:
    """Return list of {video_id, title, view_count, subscriber_count} matching filters."""
    params = {
        "part": "snippet",
        "q": tag,
        "type": "video",
        "order": "relevance",
        "publishedAfter": f"{start.isoformat()}T00:00:00Z",
        "publishedBefore": f"{end.isoformat()}T23:59:59Z",
        "maxResults": min(max_results, 50),
        "key": settings.youtube_api_key,
    }
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

        # Skip stats API calls when no filters set — saves quota
        if min_views == 0 and min_subscribers == 0:
            return [{"video_id": v["video_id"], "title": v["title"]} for v in candidates]

        video_ids = [v["video_id"] for v in candidates]
        channel_ids = list({v["channel_id"] for v in candidates})

        view_counts = await _fetch_video_stats(video_ids, client)
        sub_counts = await _fetch_channel_stats(channel_ids, client)

    filtered = []
    for v in candidates:
        views = view_counts.get(v["video_id"], 0)
        subs = sub_counts.get(v["channel_id"], 0)
        if views >= min_views and subs >= min_subscribers:
            filtered.append({"video_id": v["video_id"], "title": v["title"]})
    return filtered


async def _fetch_video_stats(video_ids: list[str], client: httpx.AsyncClient) -> dict[str, int]:
    """Returns {video_id: view_count}. Batches up to 50 IDs."""
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
        item["id"]: int(item.get("statistics", {}).get("viewCount", 0))
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
