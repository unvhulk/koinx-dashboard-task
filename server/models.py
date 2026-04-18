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


class Source(BaseModel):
    url: str
    title: str


class Insight(BaseModel):
    topic: str
    content_type: ContentType
    frequency: int
    sentiment: Sentiment
    suggested_title: str
    example_quotes: list[str]
    platform: Platform
    sources: list[Source] = []


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


class VideoDuration(str, Enum):
    any = "any"
    short = "short"      # < 4 min (Shorts / quick takes)
    medium = "medium"    # 4–20 min
    long = "long"        # > 20 min (deep dives)


class SortOrder(str, Enum):
    relevance = "relevance"
    viewCount = "viewCount"
    date = "date"
    rating = "rating"


class AnalyzeRequest(BaseModel):
    search_tag: str
    start_date: date
    end_date: date
    platforms: list[Platform] = [Platform.youtube]
    max_videos: int = Field(default=20, ge=1, le=50)
    enhanced_search: bool = False
    # Stats-based filters (require extra API calls)
    min_views: int = Field(default=0, ge=0)
    min_subscribers: int = Field(default=0, ge=0)
    min_comments: int = Field(default=0, ge=0)
    # Native search.list filters (no extra API cost)
    video_duration: VideoDuration = VideoDuration.any
    sort_order: SortOrder = SortOrder.relevance
    india_focus: bool = False  # adds regionCode=IN + relevanceLanguage=en


class AnalyzeResponse(BaseModel):
    run_id: str
    status: RunStatus


class OutlineRequest(BaseModel):
    topic: str
    suggested_title: str
    content_type: ContentType


class OutlineSection(BaseModel):
    heading: str
    points: list[str]


class OutlineResponse(BaseModel):
    title: str
    intro: str
    sections: list[OutlineSection]
    conclusion: str
    estimated_words: int


class SaveOutlineRequest(BaseModel):
    run_id: str
    topic: str
    topic_slug: str
    outline: OutlineResponse
    modification: Optional[str] = None


class SavedOutline(BaseModel):
    id: Optional[str] = None
    run_id: str
    topic: str
    topic_slug: str
    outline: OutlineResponse
    modification: Optional[str] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    saved: bool = False


class RefineOutlineRequest(BaseModel):
    topic: str
    suggested_title: str
    content_type: ContentType
    current_outline: OutlineResponse
    instruction: str
