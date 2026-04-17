import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport


@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    monkeypatch.setenv("YOUTUBE_API_KEY", "test-yt-key")
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")
    monkeypatch.setenv("MONGODB_URI", "mongodb://localhost:27017/test")
    monkeypatch.setenv("REDDIT_CLIENT_ID", "test-reddit-id")
    monkeypatch.setenv("REDDIT_CLIENT_SECRET", "test-reddit-secret")


@pytest.fixture
def mock_db():
    db = MagicMock()
    db.analysis_runs.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
    db.analysis_runs.find_one = AsyncMock(return_value=None)
    db.analysis_runs.update_one = AsyncMock()

    async def mock_async_iter(*args, **kwargs):
        return
        yield  # make it an async generator

    db.analysis_runs.find.return_value.sort.return_value.limit.return_value = mock_async_iter()
    return db


@pytest_asyncio.fixture
async def client(mock_db):
    with patch("database.connect", new_callable=AsyncMock), \
         patch("database.disconnect"), \
         patch("database.get_db", return_value=mock_db):
        from main import app
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac
