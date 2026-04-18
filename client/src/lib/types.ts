export type Platform = "youtube" | "reddit" | "tiktok" | "twitter";
export type RunStatus = "pending" | "processing" | "complete" | "failed";
export type ContentType = "blog" | "video" | "social";
export type Sentiment = "confused" | "concerned" | "curious" | "positive";

export type VideoDuration = "any" | "short" | "medium" | "long";
export type SortOrder = "relevance" | "viewCount" | "date" | "rating";

export interface AnalyzeRequest {
  search_tag: string;
  start_date: string;
  end_date: string;
  platforms: Platform[];
  max_videos: number;
  enhanced_search: boolean;
  min_views: number;
  min_subscribers: number;
  min_comments: number;
  video_duration: VideoDuration;
  sort_order: SortOrder;
  india_focus: boolean;
}

export interface Source {
  url: string;
  title: string;
}

export interface Insight {
  topic: string;
  content_type: ContentType;
  frequency: number;
  sentiment: Sentiment;
  suggested_title: string;
  example_quotes: string[];
  platform: Platform;
  sources: Source[];
}

export interface AnalysisRun {
  id: string;
  search_tag: string;
  start_date: string;
  end_date: string;
  platforms?: Platform[];
  status: RunStatus;
  video_count: number;
  comment_count: number;
  insight_count?: number;
  created_at: string;
  insights?: Insight[];
}

export interface OutlineSection {
  heading: string;
  points: string[];
}

export interface BlogOutline {
  title: string;
  intro: string;
  sections: OutlineSection[];
  conclusion: string;
  estimated_words: number;
}

export interface PipelineLog {
  run_id: string;
  ts: string;
  stage: string;
  level: "info" | "warn" | "error";
  message: string;
  [key: string]: unknown;
}

export interface SavedOutline {
  id: string;
  run_id: string;
  topic: string;
  topic_slug: string;
  outline: BlogOutline;
  modification?: string;
  generated_at: string;
  saved: boolean;
}
