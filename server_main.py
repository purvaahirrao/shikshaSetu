"""
ShikshaSetu — FastAPI Backend
Endpoints: /  /ocr  /solve-text  /solve  /chat  /quiz  /daily-challenge
"""

from __future__ import annotations

import os
import random

try:
    from pathlib import Path

    from dotenv import load_dotenv

    _API_ROOT = Path(__file__).resolve().parent
    load_dotenv(_API_ROOT / ".env")
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from ocr import (
    extract_text,
    generate_answer as local_generate_answer,
    ocr_engines_available,
    ocr_health_info,
)
from server_ai import generate_answer, llm_env_configured
from server_cache import get_cached, set_cached
from services.quiz_data import quiz_data

app = FastAPI(title="ShikshaSetu API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ───────────────────────────────────────────────────────────

class SolveRequest(BaseModel):
    question: str
    language: str = "english"
    from_ocr: bool = False

class ChatRequest(BaseModel):
    message:  str
    language: str = "english"

class SolveTextRequest(BaseModel):
    text: str

# ── Helpers ───────────────────────────────────────────────────────────────────

GREETINGS = {"hi", "hello", "hey", "hi!", "hello!", "hey!"}

QUESTION_WORDS = {
    "what", "why", "how", "when", "where", "who", "which",
    "explain", "solve", "define", "identify", "choose", "?",
}

BOILERPLATE = (
    "This is a general question. Here is a structured approach to solve it.",
    "This is a general question",
)


def check_filters(text: str) -> dict | None:
    """
    Return a short-circuit response dict when the input is a greeting or
    doesn't look like a school question.  Return None to allow normal processing.
    Long or non-Latin text is treated as OCR / pasted homework — do not block.
    """
    raw = text.strip()
    t = raw.lower()

    if t in GREETINGS:
        return {
            "answer": (
                "Hi! 👋 Ask me a question from your studies "
                "and I will help you solve it step by step."
            ),
            "steps": [],
            "tip": "",
        }

    if len(raw) >= 72:
        return None
    if len(raw) >= 24 and any(ord(c) > 127 for c in raw):
        return None
    if raw.count("\n") >= 2 and len(raw) >= 40:
        return None

    has_math = any(c in t for c in "0123456789+-=/*%^")
    has_q    = any(w in t for w in QUESTION_WORDS)

    if not (has_math or has_q):
        return {
            "answer": "Please ask a proper question (math, science, or school topic). 😊",
            "steps": [],
            "tip": "",
        }

    return None


def looks_like_ocr_text(q: str) -> bool:
    """Long, multi-line, or noisy text — typical of camera scans; use OCR-tuned LLM prompts."""
    raw = q.strip()
    if len(raw) >= 100:
        return True
    if raw.count("\n") >= 2:
        return True
    noisy = sum(1 for c in raw if c in "|[]{}_^")
    if noisy >= 2 and len(raw) >= 35:
        return True
    return False


def strip_boilerplate(ans: str) -> str:
    """Remove known generic boilerplate phrases from model output."""
    for phrase in BOILERPLATE:
        ans = ans.replace(phrase, "")
    return ans.strip()


def _shuffle_and_slice(questions: list, n: int) -> list:
    """Return a shuffled copy of `questions` sliced to at most `n` items."""
    pool = questions.copy()
    random.shuffle(pool)
    return pool[:n]

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "app": "ShikshaSetu API v2"}


@app.get("/health")
def health():
    """Import / disk checks for OCR. Does not load EasyOCR models (safe for uptime probes)."""
    return {
        "status": "ok",
        "app": "ShikshaSetu API v2",
        "ocr": ocr_health_info(),
        "llm": {"configured": llm_env_configured()},
    }


@app.post("/ocr")
async def ocr_endpoint(image: UploadFile = File(...)):
    """Extract text from an uploaded image using EasyOCR (Tesseract fallback)."""
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        text = extract_text(data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing error: {e!s}",
        ) from e

    if not text.strip() and not ocr_engines_available():
        raise HTTPException(
            status_code=503,
            detail=(
                "OCR is not available on this server: EasyOCR did not initialize (common: out-of-memory on free/small "
                "hosts) and Tesseract is not available. Options: upgrade instance RAM, install Tesseract + pytesseract "
                "on the API host, or run the API locally (`npm run dev:all`). See GET /health for import diagnostics."
            ),
        )

    return {"extracted_text": text.strip()}


@app.post("/solve-text")
def solve_text_endpoint(req: SolveTextRequest):
    """Accept plain text, run through local Llama model, return explanation."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    flt = check_filters(text)
    if flt:
        return {"extracted_text": text, **flt}

    ans = local_generate_answer(text)
    return {
        "extracted_text": text,
        "answer": strip_boilerplate(ans.strip()),
    }


@app.post("/solve")
def solve_endpoint(req: SolveRequest):
    """Return answer + step-by-step explanation. Uses in-memory cache."""
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    flt = check_filters(q)
    if flt:
        return {**flt, "cached": False}

    from_ocr = bool(req.from_ocr) or looks_like_ocr_text(q)
    cache_key = f"{q.lower()}::{req.language}::ocr{int(from_ocr)}"
    cached = get_cached(cache_key)
    if cached:
        return {**cached, "cached": True}

    result = generate_answer(q, req.language, chat_mode=False, from_ocr=from_ocr)
    if "answer" in result:
        result["answer"] = strip_boilerplate(result["answer"])

    set_cached(cache_key, result)
    return {**result, "cached": False}


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """Conversational single-turn answer."""
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    flt = check_filters(msg)
    if flt:
        return flt

    from_ocr = looks_like_ocr_text(msg)
    res = generate_answer(msg, req.language, chat_mode=True, from_ocr=from_ocr)
    if "answer" in res:
        res["answer"] = strip_boilerplate(res["answer"])
    return res


@app.get("/quiz")
def get_quiz(class_level: str, subject: str):
    """Return 5 shuffled questions for the given class and subject."""
    level_data = quiz_data.get(class_level)
    if not level_data:
        raise HTTPException(
            status_code=404,
            detail=f"No quiz data found for class '{class_level}'.",
        )
    subject_questions = level_data.get(subject)
    if not subject_questions:
        raise HTTPException(
            status_code=404,
            detail=f"No questions found for subject '{subject}' in class '{class_level}'.",
        )
    return {"questions": _shuffle_and_slice(subject_questions, 5)}


@app.get("/daily-challenge")
def daily_challenge(class_level: str = "5"):
    """Return 3 random questions drawn from all subjects for daily-challenge mode."""
    class_data = quiz_data.get(class_level)
    if not class_data:
        raise HTTPException(
            status_code=404,
            detail=f"No quiz data found for class '{class_level}'.",
        )
    pool: list = []
    for subject_questions in class_data.values():
        pool.extend(subject_questions)

    if not pool:
        raise HTTPException(
            status_code=404,
            detail="No questions available for daily challenge.",
        )
    return {"questions": _shuffle_and_slice(pool, 3)}


# ── Dev server ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", "8000"))
    uvicorn.run("server_main:app", host="0.0.0.0", port=port, reload=True)
