import io
import fitz  # PyMuPDF
from docx import Document

def extract_text(file_bytes: bytes, file_type: str) -> str | bytes:
    """
    Extracts text from PDF or DOCX.
    If the file type is 'image', returns the raw bytes.
    """
    file_type = file_type.lower()

    if file_type == "pdf":
        text = ""
        # fitz allows opening from a memory stream
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
        return text.strip()
        
    elif file_type == "docx":
        # python-docx takes file-like objects
        doc_stream = io.BytesIO(file_bytes)
        doc = Document(doc_stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
        
    elif file_type == "image":
        # Return raw bytes for Gemini Vision
        return file_bytes
        
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
