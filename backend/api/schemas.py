from pydantic import BaseModel
from typing import Literal

class AnalyzeRequest(BaseModel):
    fileName: str
    fileType: str
    fileBase64: str

class Entities(BaseModel):
    names: list[str]
    dates: list[str]
    organizations: list[str]
    amounts: list[str]

class AnalyzeResponse(BaseModel):
    status: Literal["success", "error"]
    fileName: str
    summary: str
    details: str
    entities: Entities
    sentiment: Literal["Positive", "Neutral", "Negative"]
