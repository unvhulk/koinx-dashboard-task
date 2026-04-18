import os
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from bson import ObjectId

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

import database
import youtube
import reddit as reddit_module
import apify as apify_module
import llm
import query_expander
import outline_generator
import logger as pipeline_logger
from models import (
    AnalyzeRequest, AnalyzeResponse, RunStatus, Platform, Source, VideoDuration, SortOrder,
    OutlineRequest, OutlineResponse, OutlineSection,
    SaveOutlineRequest, SavedOutline, RefineOutlineRequest,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    database.disconnect()


app = FastAPI(title="KoinX Content Ideas API", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _run_pipeline(run_id: str, req: AnalyzeRequest):
    db = database.get_db()
    t0 = datetime.utcnow()

    async def log(stage: str, message: str, level: str = "info", **meta):
        await pipeline_logger.log(run_id, stage, message, level, **meta)

    try:
        await db.analysis_runs.update_one(
            {"_id": ObjectId(run_id)},
            {"$set": {"status": RunStatus.processing}}
        )
        await log("pipeline.start", f"Starting analysis for '{req.search_tag}'",
                  search_tag=req.search_tag, max_videos=req.max_videos,
                  enhanced_search=req.enhanced_search,
                  min_views=req.min_views, min_subscribers=req.min_subscribers,
                  min_comments=req.min_comments, video_duration=req.video_duration.value,
                  sort_order=req.sort_order.value, india_focus=req.india_focus)

        all_insights = []
        total_videos = 0
        total_comments = 0

        if Platform.youtube in req.platforms:
            if req.enhanced_search:
                queries = await query_expander.expand_query(req.search_tag)
                await log("query.expand", f"{len(queries)} search variants generated", queries=queries)
            else:
                queries = [req.search_tag]

            seen_video_ids: set[str] = set()
            videos: list[dict] = []
            for i, query in enumerate(queries, 1):
                results = await youtube.search_videos(
                    query, req.start_date, req.end_date, req.max_videos,
                    min_views=req.min_views, min_subscribers=req.min_subscribers,
                    min_comments=req.min_comments,
                    video_duration=req.video_duration.value,
                    sort_order=req.sort_order.value,
                    india_focus=req.india_focus,
                )
                added = 0
                for v in results:
                    if v["video_id"] not in seen_video_ids:
                        seen_video_ids.add(v["video_id"])
                        videos.append(v)
                        added += 1
                await log("search.video",
                          f"Query {i}/{len(queries)}: {added} videos kept after quality filter",
                          query=query, found=len(results), kept=added)

            total_videos += len(videos)
            await log("filter.quality", f"{total_videos} unique videos queued for comment fetch",
                      video_count=total_videos)

            comment_tasks = [youtube.fetch_comments(v["video_id"]) for v in videos]
            results = await asyncio.gather(*comment_tasks, return_exceptions=True)

            yt_comments = []
            for r in results:
                if isinstance(r, list):
                    yt_comments.extend(r)
            total_comments += len(yt_comments)
            await log("comments.fetch", f"{total_comments} raw comments collected across {total_videos} videos",
                      raw_comment_count=total_comments, video_count=total_videos)

            if yt_comments:
                yt_sources = [
                    Source(url=f"https://youtube.com/watch?v={v['video_id']}", title=v["title"])
                    for v in videos
                ]
                await log("llm.start", f"Sending {len(yt_comments)} comments to LLM for topic extraction",
                          comment_count=len(yt_comments))
                llm_t0 = datetime.utcnow()
                insights = await llm.extract_insights(req.search_tag, yt_comments, Platform.youtube, yt_sources)
                duration_ms = int((datetime.utcnow() - llm_t0).total_seconds() * 1000)
                await log("llm.done", f"{len(insights)} topics extracted",
                          topic_count=len(insights), duration_ms=duration_ms)
                all_insights.extend(i.model_dump() for i in insights)

        if Platform.reddit in req.platforms:
            loop = asyncio.get_event_loop()
            rd_comments = await loop.run_in_executor(
                None,
                reddit_module.fetch_comments,
                req.search_tag, req.start_date, req.end_date, 200
            )
            total_comments += len(rd_comments)

            if rd_comments:
                insights = await llm.extract_insights(req.search_tag, rd_comments, Platform.reddit)
                all_insights.extend(i.model_dump() for i in insights)

        if Platform.tiktok in req.platforms:
            try:
                tt_queries = await query_expander.expand_query(req.search_tag) if req.enhanced_search else [req.search_tag]
                await log("apify.tiktok.start", f"Fetching TikTok content for '{req.search_tag}'",
                          queries=tt_queries, enhanced=req.enhanced_search)
                tt_comments: list[str] = []
                seen_tt: set[str] = set()
                for q in tt_queries:
                    items = await apify_module.fetch_tiktok_comments(q, req.start_date, req.end_date, max_comments=100)
                    for t in items:
                        if t not in seen_tt:
                            seen_tt.add(t)
                            tt_comments.append(t)
                total_comments += len(tt_comments)
                await log("apify.tiktok.done", f"{len(tt_comments)} TikTok items collected",
                          comment_count=len(tt_comments))
                if tt_comments:
                    insights = await llm.extract_insights(req.search_tag, tt_comments, Platform.tiktok)
                    all_insights.extend(i.model_dump() for i in insights)
            except Exception as e:
                await log("apify.tiktok.error", str(e), level="warn")

        if Platform.twitter in req.platforms:
            try:
                tw_queries = await query_expander.expand_query(req.search_tag) if req.enhanced_search else [req.search_tag]
                await log("apify.twitter.start", f"Fetching Twitter/X posts for '{req.search_tag}'",
                          queries=tw_queries, enhanced=req.enhanced_search)
                tw_comments: list[str] = []
                seen_tw: set[str] = set()
                for q in tw_queries:
                    items = await apify_module.fetch_twitter_comments(q, req.start_date, req.end_date, max_tweets=100)
                    for t in items:
                        if t not in seen_tw:
                            seen_tw.add(t)
                            tw_comments.append(t)
                total_comments += len(tw_comments)
                await log("apify.twitter.done", f"{len(tw_comments)} tweets collected",
                          comment_count=len(tw_comments))
                if tw_comments:
                    insights = await llm.extract_insights(req.search_tag, tw_comments, Platform.twitter)
                    all_insights.extend(i.model_dump() for i in insights)
            except Exception as e:
                await log("apify.twitter.error", str(e), level="warn")

        for ins in all_insights:
            for k, v in ins.items():
                if hasattr(v, 'isoformat'):
                    ins[k] = v.isoformat()

        total_ms = int((datetime.utcnow() - t0).total_seconds() * 1000)
        await log("pipeline.done",
                  f"Complete — {total_videos} videos, {total_comments} comments, {len(all_insights)} topics in {total_ms / 1000:.1f}s",
                  total_duration_ms=total_ms, topic_count=len(all_insights))

        await db.analysis_runs.update_one(
            {"_id": ObjectId(run_id)},
            {"$set": {
                "status": RunStatus.complete,
                "video_count": total_videos,
                "comment_count": total_comments,
                "insight_count": len(all_insights),
                "insights": all_insights,
            }}
        )
    except Exception as e:
        total_ms = int((datetime.utcnow() - t0).total_seconds() * 1000)
        await pipeline_logger.log(run_id, "pipeline.error", str(e), level="error",
                                  total_duration_ms=total_ms)
        await db.analysis_runs.update_one(
            {"_id": ObjectId(run_id)},
            {"$set": {"status": RunStatus.failed, "error": str(e)}}
        )


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    if req.start_date > req.end_date:
        raise HTTPException(400, "start_date must be before end_date")

    db = database.get_db()
    doc = {
        "search_tag": req.search_tag,
        "start_date": datetime.combine(req.start_date, datetime.min.time()),
        "end_date": datetime.combine(req.end_date, datetime.min.time()),
        "platforms": [p.value for p in req.platforms],
        "status": RunStatus.pending,
        "created_at": datetime.utcnow(),
        "video_count": 0,
        "comment_count": 0,
        "insight_count": 0,
        "insights": [],
        "error": None,
    }
    result = await db.analysis_runs.insert_one(doc)
    run_id = str(result.inserted_id)

    background_tasks.add_task(_run_pipeline, run_id, req)
    return AnalyzeResponse(run_id=run_id, status=RunStatus.pending)


@app.post("/api/outline", response_model=OutlineResponse)
async def outline(req: OutlineRequest):
    try:
        result = await outline_generator.generate_outline(
            req.topic, req.suggested_title, req.content_type.value
        )
        return OutlineResponse(
            title=result.get("title", req.suggested_title),
            intro=result.get("intro", ""),
            sections=[
                OutlineSection(heading=s["heading"], points=s.get("points", []))
                for s in result.get("sections", [])
            ],
            conclusion=result.get("conclusion", ""),
            estimated_words=int(result.get("estimated_words", 800)),
        )
    except Exception as e:
        raise HTTPException(500, f"Outline generation failed: {str(e)}")


@app.post("/api/outline/save", response_model=SavedOutline)
async def save_outline(req: SaveOutlineRequest):
    db = database.get_db()
    doc = {
        "run_id": req.run_id,
        "topic": req.topic,
        "topic_slug": req.topic_slug,
        "outline": req.outline.model_dump(),
        "modification": req.modification,
        "generated_at": datetime.utcnow(),
        "saved": True,
    }
    result = await db.outlines.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return SavedOutline(**doc)


@app.get("/api/outlines/{run_id}")
async def get_outlines(run_id: str, topic: str):
    db = database.get_db()
    cursor = db.outlines.find(
        {"run_id": run_id, "topic_slug": topic}
    ).sort("generated_at", -1)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        if "generated_at" in doc and hasattr(doc["generated_at"], "isoformat"):
            doc["generated_at"] = doc["generated_at"].isoformat()
        items.append(doc)
    return items


@app.post("/api/outline/refine", response_model=OutlineResponse)
async def refine_outline_endpoint(req: RefineOutlineRequest):
    try:
        result = await outline_generator.refine_outline(
            req.topic,
            req.suggested_title,
            req.content_type.value,
            req.current_outline.model_dump(),
            req.instruction,
        )
        return OutlineResponse(
            title=result.get("title", req.suggested_title),
            intro=result.get("intro", ""),
            sections=[
                OutlineSection(heading=s["heading"], points=s.get("points", []))
                for s in result.get("sections", [])
            ],
            conclusion=result.get("conclusion", ""),
            estimated_words=int(result.get("estimated_words", 800)),
        )
    except Exception as e:
        raise HTTPException(500, f"Outline refinement failed: {str(e)}")


@app.get("/api/results/{run_id}")
async def get_results(run_id: str):
    db = database.get_db()
    try:
        doc = await db.analysis_runs.find_one({"_id": ObjectId(run_id)})
    except Exception:
        raise HTTPException(400, "Invalid run_id")
    if not doc:
        raise HTTPException(404, "Run not found")
    doc["id"] = str(doc.pop("_id"))
    for k in ("created_at", "start_date", "end_date"):
        if k in doc and hasattr(doc[k], "isoformat"):
            doc[k] = doc[k].isoformat()
    return doc


@app.get("/api/history")
async def get_history(limit: int = 20):
    db = database.get_db()
    cursor = db.analysis_runs.find(
        {},
        {"insights": 0}
    ).sort("created_at", -1).limit(limit)
    runs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        for k in ("created_at", "start_date", "end_date"):
            if k in doc and hasattr(doc[k], "isoformat"):
                doc[k] = doc[k].isoformat()
        runs.append(doc)
    return runs


@app.get("/api/logs/{run_id}")
async def get_logs(run_id: str):
    db = database.get_db()
    cursor = db.pipeline_logs.find({"run_id": run_id}, {"_id": 0}).sort("ts", 1)
    items = []
    async for doc in cursor:
        if "ts" in doc and hasattr(doc["ts"], "isoformat"):
            doc["ts"] = doc["ts"].isoformat()
        items.append(doc)
    return items


@app.get("/health")
async def health():
    return {"status": "ok"}
