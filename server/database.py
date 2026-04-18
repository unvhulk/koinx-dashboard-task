from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None
db = None


async def connect():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.get_default_database()
    # Expire pipeline logs after 7 days to prevent unbounded growth
    await db.pipeline_logs.create_index("ts", expireAfterSeconds=604800)


async def disconnect():
    if client:
        client.close()


def get_db():
    return db
