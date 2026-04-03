from fastapi import FastAPI, Depends, HTTPException
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse, Entities
from backend.core.security import verify_api_key
from backend.services.utils import decode_base64_file
from backend.services.extractor import extract_text
from backend.services.analyzer import analyze_document

app = FastAPI(
    title="Data Extraction API",
    description="AI-Powered Document Analysis & Extraction API",
    version="1.0.0"
)

@app.post("/api/document-analyze", response_model=AnalyzeResponse, dependencies=[Depends(verify_api_key)])
async def analyze_document_endpoint(request: AnalyzeRequest):
    """
    Analyze a document and extract key entities, summary, and sentiment.
    Receives PDF, DOCX, or images via Base64 string.
    """
    try:
        file_bytes = decode_base64_file(request.fileBase64)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        content = extract_text(file_bytes, request.fileType)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction Error: {str(e)}")

    is_image = request.fileType.lower() == "image"
    
    try:
        analysis_result = analyze_document(content, is_image=is_image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis Error: {str(e)}")

    # Pydantic will gracefully handle missing fields naturally, but we provide defaults for safety
    entities_data = analysis_result.get("entities", {})
    if not isinstance(entities_data, dict):
        entities_data = {}

    return AnalyzeResponse(
        status="success",
        fileName=request.fileName,
        summary=analysis_result.get("summary", "Analysis complete but no summary provided."),
        entities=Entities(
            names=entities_data.get("names", []),
            dates=entities_data.get("dates", []),
            organizations=entities_data.get("organizations", []),
            amounts=entities_data.get("amounts", [])
        ),
        sentiment=analysis_result.get("sentiment", "Neutral")
    )

@app.get("/health")
async def health_check():
    return {"status": "ok"}
