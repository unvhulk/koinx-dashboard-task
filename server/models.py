from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


class ContentType(str, Enum):
    blog = "blog"
    video = "video"
    social = "social"


class Sentiment(str, Enum):
    confused = "confused"
    concerned = "concerned"
    curious = "curious"
    positive = "positive"


class Platform(str, Enum):
    youtube = "youtube"
    reddit = "reddit"


class RunStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    complete = "complete"
    failed = "failed"


class Insight(BaseModel):
    topic: str
    content_type: ContentType
    frequency: int
    sentiment: Sentiment
    suggested_title: str
    example_quotes: list[str]
    platform: Platform


class AnalysisRun(BaseModel):
    id: Optional[str] = None
    search_tag: str
    start_date: date
    end_date: date
    status: RunStatus = RunStatus.pending
    created_at: datetime = Field(default_factory=datetime.utcnow)
    video_count: int = 0
    comment_count: int = 0
    insights: list[Insight] = []
    error: Optional[str] = None


class AnalyzeRequest(BaseModel):
    search_tag: str
    start_date: date
    end_date: date
    platforms: list[Platform] = [Platform.youtube]
    max_videos: int = Field(default=20, ge=1, le=50)


class AnalyzeResponse(BaseModel):
    run_id: str
    status: RunStatus
