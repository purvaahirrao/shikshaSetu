"""
ShikshaSetu — FastAPI Backend
Endpoints: /ocr  /solve  /chat
"""

import logging
import random

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from ocr import extract_text, generate_answer as local_generate_answer
from server_ai import generate_answer
from server_cache import get_cached, set_cached

log = logging.getLogger("shikshasetu.api")

app = FastAPI(title="ShikshaSetu API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Fast ping — use to verify the process is listening (unlike /ocr, which can be slow)."""
    return {"ok": True, "service": "shikshasetu-api"}


# EasyOCR loads on first /ocr only — preloading here can make the machine feel "frozen" for minutes.

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

def check_filters(text: str) -> dict:
    t = text.strip().lower()
    if t in ["hi", "hello", "hey", "hi!", "hello!", "hey!"]:
        return {"answer": "Hi! 👋 Ask me a question from your studies and I will help you solve it step by step."}
    
    # Check for question intent: must have numbers, math symbols, or question words
    has_math = any(c in t for c in "0123456789+-=/*")
    qwords = ["what", "why", "how", "when", "where", "who", "which", "explain", "solve", "define", "?", "identify", "choose"]
    has_q = any(w in t for w in qwords)
    
    if not (has_math or has_q):
        return {"answer": "Please ask a proper question (math, science, or school topic). 😊"}
    return None

def strip_generic(ans: str) -> str:
    return ans.replace("This is a general question. Here is a structured approach to solve it.", "").replace("This is a general question", "").strip()


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
    
    flt = check_filters(req.text)
    if flt:
        return {"extracted_text": req.text.strip(), "answer": flt["answer"]}
        
    ans = local_generate_answer(req.text.strip())
    ans_clean = strip_generic(ans.strip())
    return {
        "extracted_text": req.text.strip(),
        "answer": ans_clean
    }


@app.post("/solve")
def solve_endpoint(req: SolveRequest):
    """Return answer + step-by-step explanation. Uses in-memory cache."""
    q = req.question.strip()
    if not q:
        raise HTTPException(400, "Question cannot be empty.")

    flt = check_filters(q)
    if flt:
        return {**flt, "cached": False, "steps": [], "tip": ""}

    key    = f"{q.lower()}::{req.language}"
    cached = get_cached(key)
    if cached:
        return {**cached, "cached": True}

    result = generate_answer(q, req.language)
    if "answer" in result:
        result["answer"] = strip_generic(result["answer"])
    
    set_cached(key, result)
    return {**result, "cached": False}


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """Conversational single-turn answer."""
    msg = req.message.strip()
    if not msg:
        raise HTTPException(400, "Message cannot be empty.")
    
    flt = check_filters(msg)
    if flt:
        return {**flt, "steps": [], "tip": ""}
        
    res = generate_answer(msg, req.language, chat_mode=True)
    if "answer" in res:
        res["answer"] = strip_generic(res["answer"])
    return res


# ── Quiz (HTTP) — must stay above __main__ so routes register when run as script ──

from services.quiz_data import quiz_data


@app.get("/quiz")
def get_quiz(class_level: str, subject: str):
    try:
        questions = quiz_data[class_level][subject]
        random.shuffle(questions)
        return {"questions": questions[:5]}
    except Exception:
        return {"error": "No quiz available"}


@app.get("/daily-challenge")
def daily_challenge(class_level: str = "5"):
    """Return 3 random questions from all subjects for daily challenge mode."""
    try:
        class_data = quiz_data.get(class_level, {})
        pool = []
        for subject_questions in class_data.values():
            pool.extend(subject_questions)
        random.shuffle(pool)
        return {"questions": pool[:3]}
    except Exception:
        return {"error": "No daily challenge available"}


# ── Dev server ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("server_main:app", host="0.0.0.0", port=8000, reload=True)