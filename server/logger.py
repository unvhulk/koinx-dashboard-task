from datetime import datetime
import database


async def log(run_id: str, stage: str, message: str, level: str = "info", **meta):
    """Append a structured log event for a pipeline run to MongoDB."""
    db = database.get_db()
    await db.pipeline_logs.insert_one({
        "run_id": run_id,
        "ts": datetime.utcnow(),
        "stage": stage,
        "level": level,
        "message": message,
        **meta,
    })
