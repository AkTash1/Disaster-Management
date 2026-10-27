from pathlib import Path
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Application settings for Disaster Intelligence Multimodal Platform."""
    PROJECT_NAME: str = "Disaster Intelligence Multimodal Platform"
    PROJECT_DESCRIPTION: str = (
        "AI-driven multimodal disaster intelligence platform for Uttarakhand testbed "
        "providing real-time event aggregation, cascading hazard graphs, and evidence-grounded Q&A."
    )
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])

    # Path configurations - resolved relative to app directory for zero-failure on Vercel
    APP_DIR: Path = Path(__file__).resolve().parent.parent
    BASE_DIR: Path = APP_DIR.parent
    DATA_DIR: Path = BASE_DIR / "data" / "extracted_readable"
    SCHEMA_DBML_PATH: Path = BASE_DIR / "schemas" / "dbdiagram_schema.dbml"
    PARSED_SCHEMA_PATH: Path = APP_DIR / "core" / "parsed_schema.json"
    MOCK_DATA_DIR: Path = APP_DIR / "mock_data"
    SEED_DATA_PATH: Path = APP_DIR / "mock_data" / "seed_data.json"
    STATIC_DIR: Path = APP_DIR / "static"


settings = Settings()
