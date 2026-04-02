from fastapi import Header, HTTPException
from backend.core.config import settings

async def verify_api_key(x_api_key: str | None = Header(default=None, description="API Key for the application")) -> str:
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_api_key
