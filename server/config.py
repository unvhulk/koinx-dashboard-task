from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    youtube_api_key: str
    groq_api_key: str
    mongodb_uri: str
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "koinx-content-dashboard/1.0"

    class Config:
        env_file = ".env"


settings = Settings()
