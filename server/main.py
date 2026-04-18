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
import llm
import query_expander
import outline_generator
from models import (
    AnalyzeRequest, AnalyzeResponse, AnalysisRun, RunStatus, Platform, Source,
    OutlineRequest, OutlineResponse, OutlineSection,
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
    try:
        await db.analysis_runs.update_one(
            {"_id": ObjectId(run_id)},
            {"$set": {"status": RunStatus.processing}}
        )

        all_insights = []
        total_videos = 0
        total_comments = 0

        if Platform.youtube in req.platforms:
            # Enhanced search: expand tag into multiple queries
            if req.enhanced_search:
                queries = await query_expander.expand_query(req.search_tag)
            else:
                queries = [req.search_tag]

            # Fetch videos for each query, deduplicate by video_id
            seen_video_ids: set[str] = set()
            videos: list[dict] = []
            for query in queries:
                results = await youtube.search_videos(
                    query, req.start_date, req.end_date, req.max_videos
                )
                for v in results:
                    if v["video_id"] not in seen_video_ids:
                        seen_video_ids.add(v["video_id"])
                        videos.append(v)

            total_videos += len(videos)

            comment_tasks = [youtube.fetch_comments(v["video_id"]) for v in videos]
            results = await asyncio.gather(*comment_tasks, return_exceptions=True)

            yt_comments = []
            for r in results:
                if isinstance(r, list):
                    yt_comments.extend(r)
            total_comments += len(yt_comments)

            if yt_comments:
                yt_sources = [
                    Source(url=f"https://youtube.com/watch?v={v['video_id']}", title=v["title"])
                    for v in videos
                ]
                insights = await llm.extract_insights(req.search_tag, yt_comments, Platform.youtube, yt_sources)
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

        # Serialize any datetime fields nested in insights
        for ins in all_insights:
            for k, v in ins.items():
                if hasattr(v, 'isoformat'):
                    ins[k] = v.isoformat()

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


@app.get("/health")
async def health():
    return {"status": "ok"}
