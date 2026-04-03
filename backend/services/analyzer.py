import json
import google.generativeai as genai
from backend.core.config import settings

# Configure the API key using our Settings loader
genai.configure(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-1.5-flash"

def analyze_document(content: str | bytes, is_image: bool = False) -> dict:
    """
    Analyzes document content strictly using Gemini and returns a parsed JSON dictionary.
    """
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=(
            "You are an expert document analyzer. Extract information strictly in the requested JSON format. "
            "For images, perform OCR first. For text, analyze context. \n"
            "Requirements:\n"
            "- Summary: Concise, professional 2-3 sentence overview.\n"
            "- Entities: Extract precise Names, Dates, Organizations, and Monetary Amounts.\n"
            "- Sentiment: Strictly return 'Positive', 'Neutral', or 'Negative'.\n"
            "- Output: Must be a valid JSON object exactly matching this structure:\n"
            "{\n"
            '  "summary": "string",\n'
            '  "entities": {\n'
            '    "names": [],\n'
            '    "dates": [],\n'
            '    "organizations": [],\n'
            '    "amounts": []\n'
            '  },\n'
            '  "sentiment": "Positive" | "Neutral" | "Negative"\n'
            "}"
        )
    )

    if is_image:
        # Use a generic image mime type, Gemini is smart enough to handle jpeg/png under this.
        prompt_content = [
            {"mime_type": "image/jpeg", "data": content},
            "Please extract the information from this image."
        ]
    else:
        prompt_content = [
            f"Here is the text:\n\n{content}\n\nPlease extract the information."
        ]

    # Enforce strict JSON output natively from the API
    generation_config = genai.types.GenerationConfig(
        response_mime_type="application/json"
    )

    try:
        response = model.generate_content(
            prompt_content,
            generation_config=generation_config
        )
        
        # We parse the text safely
        return json.loads(response.text)
    except Exception as e:
        # LLM fallback handling
        return {
            "summary": f"Error parsing or analyzing document: {str(e)}",
            "entities": {
                "names": [], "dates": [], "organizations": [], "amounts": []
            },
            "sentiment": "Neutral"
        }
