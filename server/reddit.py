import praw
from datetime import date
from config import settings

CRYPTO_SUBREDDITS = ["CryptoTax", "IndiaTax", "IndiaInvestments", "Bitcoin", "CryptoCurrency"]


def _client() -> praw.Reddit:
    return praw.Reddit(
        client_id=settings.reddit_client_id,
        client_secret=settings.reddit_client_secret,
        user_agent=settings.reddit_user_agent,
    )


def fetch_comments(tag: str, start: date, end: date, max_comments: int = 200) -> list[str]:
    """Search Reddit for posts matching tag, return comment texts within date range."""
    if not settings.reddit_client_id:
        return []

    start_ts = int(date.fromisoformat(str(start)).strftime("%s") if hasattr(date, "strftime") else 0)
    end_ts = int(date.fromisoformat(str(end)).strftime("%s") if hasattr(date, "strftime") else 9999999999)

    reddit = _client()
    comments: list[str] = []

    for sub in CRYPTO_SUBREDDITS:
        if len(comments) >= max_comments:
            break
        try:
            subreddit = reddit.subreddit(sub)
            for submission in subreddit.search(tag, limit=10, sort="relevance"):
                created = int(submission.created_utc)
                if not (start_ts <= created <= end_ts):
                    continue
                submission.comments.replace_more(limit=0)
                for comment in submission.comments.list():
                    if comment.body and comment.body != "[deleted]":
                        comments.append(comment.body.strip())
                    if len(comments) >= max_comments:
                        break
        except Exception:
            continue

    return comments[:max_comments]
