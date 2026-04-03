import json
import logging
import google.generativeai as genai
from backend.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
MODEL_NAME = "gemini-2.0-flash"

def analyze_document(extraction_result: dict, is_image: bool = False) -> dict:
    """
    Analyzes document content strictly using Gemini and returns a JSON dictionary.
    Handles the hybrid 'text' and 'image_bytes' dict properly.
    """
    model = genai.GenerativeModel(model_name=MODEL_NAME)

    instruction_text = (
        "You are an expert document analyzer. Extract information strictly in the exact JSON format requested. "
        "Requirements:\n"
        "- Summary: Concise, professional 2-3 sentence overview.\n"
        "- Entities: Extract precise Names, Dates, Organizations, and Monetary Amounts.\n"
        "- Sentiment: Strictly return 'Positive', 'Neutral', or 'Negative'. Do not deviate.\n"
        "- Output: Must be a valid JSON object exactly matching this structure, with no markdown formatting around it:\n"
        "{\n"
        '  "summary": "string",\n'
        '  "entities": {\n'
        '    "names": [],\n'
        '    "dates": [],\n'
        '    "organizations": [],\n'
        '    "amounts": []\n'
        '  },\n'
        '  "sentiment": "Neutral"\n'
        "}\n\n---\n"
    )

    prompt_content = [instruction_text]
    
    # We pass both the image and the Tesseract OCR fallback if present
    if is_image and extraction_result.get("image_bytes"):
        import io
        from PIL import Image
        try:
            img = Image.open(io.BytesIO(extraction_result["image_bytes"]))
            # Conversion to RGB ensures maximum compatibility with API for transparency/alphas
            if img.mode != 'RGB':
                img = img.convert('RGB')
            prompt_content.append(img)
            prompt_content.append("Analyze this exact image and extract the data.")
        except Exception as e:
            logging.error(f"Failed to load image for Gemini: {e}")
            prompt_content.append("Analyze the provided visual data.")
            
        if extraction_result.get("text"):
            prompt_content.append(f"\nFor reference, local OCR detected the following text:\n{extraction_result['text']}")
    else:
        text_content = extraction_result.get("text", "")
        prompt_content.append(f"Analyze this document text:\n\n{text_content}\n\nPlease extract the information into the strict JSON schema.")

    try:
        response = model.generate_content(prompt_content)
        raw_text = response.text.strip()
        
        # Safe JSON parsing strips markdown blocks
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        return json.loads(raw_text.strip())
        
    except Exception as gemini_err:
        logging.warning(f"Gemini failed: {gemini_err}. Attempting Groq fallback...")
        
        fallback_prompt = instruction_text + "\nDocument Text Payload:\n" + extraction_result.get("text", "No text extracted from document.")
        
        try:
            import urllib.request
            if not settings.GROQ_API_KEY: raise Exception("GROQ_API_KEY missing.")
            
            req = urllib.request.Request("https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps({
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": fallback_prompt}],
                    "response_format": {"type": "json_object"}
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}", 
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0"
                }
            )
            with urllib.request.urlopen(req) as response:
                ans = json.loads(response.read().decode("utf-8"))["choices"][0]["message"]["content"]
                return json.loads(ans)
                
        except Exception as groq_err:
            logging.warning(f"Groq fallback failed: {groq_err}. Attempting Cohere fallback...")
            
            try:
                import urllib.request
                if not settings.COHERE_API_KEY: raise Exception("COHERE_API_KEY missing.")
                
                req = urllib.request.Request("https://api.cohere.com/v1/chat",
                    data=json.dumps({
                        "model": "command",
                        "message": fallback_prompt
                    }).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {settings.COHERE_API_KEY}", 
                        "Accept": "application/json", 
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    }
                )
                with urllib.request.urlopen(req) as response:
                    ans = json.loads(response.read().decode("utf-8"))["text"].strip()
                    if ans.startswith("```json"): ans = ans[7:]
                    elif ans.startswith("```"): ans = ans[3:]
                    if ans.endswith("```"): ans = ans[:-3]
                    return json.loads(ans.strip())
                    
            except Exception as cohere_err:
                logging.error(f"All LLMs failed spectacularly. Cohere error: {cohere_err}")
                
                err_msg = str(gemini_err)
                if "429" in err_msg:
                    err_msg = "Google Quota Exceeded. Groq/Cohere Fallbacks also failed or are missing Keys."
                
                return {
                    "summary": f"Analysis failed across all providers! Error: {err_msg}",
                    "entities": {
                        "names": [], "dates": [], "organizations": [], "amounts": []
                    },
                    "sentiment": "Neutral"
                }
