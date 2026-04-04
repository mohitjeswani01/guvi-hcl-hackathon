# AI-Powered Document Analysis & Extraction (IDP)

Welcome to our submission for the **HCL GUVI Hackathon (Track 2: AI-Powered Document Analysis)**.
This project is an Intelligent Document Processing (IDP) system that can automatically extract, analyze, and summarize critical data from multiple document formats (PDFs, DOCX, Images) using state-of-the-art AI.

## 🚀 Key Features
- **Multi-Format Hybrid Extraction**: Seamlessly extracts raw text and layout data from PDFs and DOCX files.
- **Computer Vision OCR Engine**: Utilizes Tesseract OCR locally as a fallback mechanism for scanned images and native text detection.
- **Multi-LLM Fallback Architecture**: A highly resilient native cascade system that first queries **Gemini 2.0 Vision**, then falls back dynamically to **Groq (Llama 3.3)**, and eventually **Cohere (Command-R)** to guarantee 100% uptime without Quota Exceeded API blocks!
- **Strict Data Engineering**: Forces pure JSON extraction for seamless summary, entity mapping (Names, Organizations, Dates, Prices), and Sentiment Analysis without hallucinating.

## 🛠 Tech Stack
**Frontend:**
- React 18 / Vite
- Tailwind CSS / Framer Motion
- TypeScript
- TanStack React Query

**Backend:**
- Python 3.12 / FastAPI
- Uvicorn (ASGI)
- `google-generativeai` (Gemini) + `urllib` (Groq/Cohere Fallbacks)
- PyMuPDF / python-docx / Pytesseract (Hybrid Extraction)

## 🏗 Architecture Overview
1. **User Uploads**: Frontend React client validates the document and strictly encodes it into a Base64 payload.
2. **API Handshake**: FastAPI securely intercepts the payload (validating against `x-api-key`). Security blocks arbitrary attacks.
3. **Hybrid Extraction**: The backend dynamically evaluates the MIMETYPE. It fires PyMuPDF if it's a PDF, `python-docx` for word docs, or Pillow+Pytesseract if it's an image.
4. **AI Generation Cascade**:
    - Generates system instructions and routes via Gemini API.
    - If Quota Limits trigger, `analyzer.py` catches the crash and dynamically re-routes the OCR Text to Groq using a `json_object` enforcement flag via Cloudflare-Bypassed `urllib` wrappers.
5. **Dashboard Delivery**: The strict JSON string is decoded natively and passed back to React to smoothly animate into the beautiful Result Tabs.

## 🔗 Presentation Link
https://gamma.app/docs/AI-Powered-Document-Analysis-Extraction-a1nkgcgyzwnl541

## 🤖 AI Tools Used
As per hackathon requirements, here are the AI tools utilized during the ideation and development phase of this project:
- **Google Deepmind / Gemini AI**: Used natively as the core backend inference engine to extract documents.
- **Groq & Cohere AI**: Used as our core Fallback system engines.

## ⚠️ Known Limitations
- The OCR (Pytesseract) fallback for images requires the binary `tesseract.exe` to be installed on the native hosting machine environment.
- Depending on the Google Cloud Account limits, Gemini Vision Free-tier limits may hit 429 Quota Exhausted if dozens of participants test it at the exact same time. (We mitigated this via Groq fallbacks!).
- PDF layout extraction provides raw coordinates but does not natively preserve complex HTML tables in our current free-tier integration.

## ⚙️ Setup Instructions
### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Or venv\Scripts\activate on Windows
pip install -r ../requirements.txt
```
**Environment Variables (.env)**
You must create a `.env` file in the root directory:
```
API_KEY=sk_track2_987654321
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
COHERE_API_KEY=your_cohere_key
```
Run the server:
```bash
uvicorn backend.main:app --reload
```

### 2. Frontend (Vite/React)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:8080/` in your browser.
