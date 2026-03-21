"""
ShikshaSetu — FastAPI Backend
Endpoints: /ocr  /solve  /chat
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from ocr import extract_text, generate_answer as local_generate_answer
from server_ai import generate_answer
from server_cache import get_cached, set_cached

app = FastAPI(title="ShikshaSetu API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────

class SolveRequest(BaseModel):
    question: str
    language: str = "english"

class ChatRequest(BaseModel):
    message:  str
    language: str = "english"

class SolveTextRequest(BaseModel):
    text: str

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "app": "ShikshaSetu API v2"}


@app.post("/ocr")
async def ocr_endpoint(image: UploadFile = File(...)):
    """Extract text from an uploaded image using EasyOCR (Tesseract fallback)."""
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image.")
    data = await image.read()
    text = extract_text(data)
    return {"extracted_text": text.strip()}


@app.post("/solve-text")
def solve_text_endpoint(req: SolveTextRequest):
    """Accept text, send to local Llama model, return explanation."""
    if not req.text.strip():
        raise HTTPException(400, "Text cannot be empty.")
        
    ans = local_generate_answer(req.text.strip())
    return {
        "extracted_text": req.text.strip(),
        "answer": ans.strip()
    }


@app.post("/solve")
def solve_endpoint(req: SolveRequest):
    """Return answer + step-by-step explanation. Uses in-memory cache."""
    q = req.question.strip()
    if not q:
        raise HTTPException(400, "Question cannot be empty.")

    key    = f"{q.lower()}::{req.language}"
    cached = get_cached(key)
    if cached:
        return {**cached, "cached": True}

    result = generate_answer(q, req.language)
    set_cached(key, result)
    return {**result, "cached": False}


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """Conversational single-turn answer."""
    msg = req.message.strip()
    if not msg:
        raise HTTPException(400, "Message cannot be empty.")
    return generate_answer(msg, req.language, chat_mode=True)


# ── Dev server ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("server_main:app", host="0.0.0.0", port=8000, reload=True)