import httpx
from datetime import date
from config import settings

BASE = "https://www.googleapis.com/youtube/v3"


async def search_videos(tag: str, start: date, end: date, max_results: int = 20) -> list[dict]:
    """Return list of {video_id, title} matching the tag within date range."""
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
    return [
        {"video_id": i["id"]["videoId"], "title": i["snippet"]["title"]}
        for i in items
        if i.get("id", {}).get("videoId")
    ]


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
                    # Comments disabled on this video
                    break
                raise
            data = resp.json()
            for item in data.get("items", []):
                text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                if text.strip():
                    comments.append(text.strip())
            page_token = data.get("nextPageToken")
            if not page_token or len(comments) >= max_comments:
                break
    return comments[:max_comments]
