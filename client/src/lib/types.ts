export type Platform = "youtube" | "reddit";
export type RunStatus = "pending" | "processing" | "complete" | "failed";
export type ContentType = "blog" | "video" | "social";
export type Sentiment = "confused" | "concerned" | "curious" | "positive";

export interface AnalyzeRequest {
  search_tag: string;
  start_date: string;
  end_date: string;
  platforms: Platform[];
  max_videos: number;
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
  status: RunStatus;
  video_count: number;
  comment_count: number;
  insight_count?: number;
  created_at: string;
  insights?: Insight[];
}
