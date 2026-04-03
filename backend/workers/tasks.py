import logging
from celery import Celery
from backend.services.extractor import extract_text
from backend.services.analyzer import analyze_document

# Assuming Redis runs on the local default port
celery_app = Celery(
    "document_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task(name="process_document_task")
def process_document_task(file_bytes_hex: str, file_type: str):
    """
    Execute extraction and analysis in background celery worker.
    bytes passed as hex string to avoid Celery serialization issues.
    """
    try:
        logging.info(f"Celery: Starting async processing for type: {file_type}")
        file_bytes = bytes.fromhex(file_bytes_hex)
        
        # 1. Hybrid Extraction
        extraction_result = extract_text(file_bytes, file_type)
        
        # 2. AI Intelligence
        is_image = file_type.lower() == "image"
        analysis_result = analyze_document(extraction_result, is_image=is_image)
        
        logging.info("Celery: Async processing completed successfully.")
        return analysis_result
    except Exception as e:
        logging.error(f"Celery Task Error: {str(e)}")
        # Safe Fallback schema
        return {
            "summary": f"Process failed in async task: {str(e)}",
            "entities": {"names": [], "dates": [], "organizations": [], "amounts": []},
            "sentiment": "Neutral"
        }
