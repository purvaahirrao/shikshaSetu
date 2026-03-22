"""
ocr.py — Image-to-text extraction and Answer Generation with Web Search
Primary:  EasyOCR  (handles English + Hindi/Devanagari)
Fallback: Tesseract via pytesseract
LLM:      llama-cpp-python (Direct GGUF loading)
"""

from __future__ import annotations

import io
import logging
import platform
import shutil

# Set up logger
log = logging.getLogger(__name__)

# Global variables so models only load into RAM once
_easyocr_reader = None
_llm = None

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            log.info("Loading EasyOCR models into memory (this only happens once)...")
            _easyocr_reader = easyocr.Reader(["en", "hi"], gpu=False)
        except ImportError:
            log.warning("EasyOCR is not installed. Skipping to Tesseract.")
            return None
        except Exception as e:
            log.error(f"EasyOCR failed to load: {e}")
            return None
    return _easyocr_reader

def get_llm():
    global _llm
    if _llm is None:
        try:
            from llama_cpp import Llama
            log.info("Loading Llama model into memory (this might take a minute)...")
            _llm = Llama(
                model_path=r"C:\Users\Hardik\OneDrive\Desktop\shikasetu\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
                n_ctx=2048,  
                verbose=False 
            )
        except ImportError:
            log.error("llama-cpp-python not installed. Please run: pip install llama-cpp-python")
            return None
        except Exception as e:
            log.error(f"Failed to load Llama model: {e}")
            return None
    return _llm

def search_online(query: str) -> str:
    """Searches the web to provide real-time context to the AI."""
    try:
        from ddgs import DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            log.warning("Search library not installed. Skipping web search.")
            return ""

    if not query or len(query.strip()) < 5:
        return ""

    try:
        log.info(f"Searching the web for context: '{query[:50]}...'")
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            
        if not results:
            return ""
            
        context = "Here is some up-to-date background information from the internet:\n"
        for r in results:
            context += f"- {r.get('body', '')}\n"
        return context + "\n"
        
    except Exception as e:
        log.error(f"Web search failed: {e}")
        return ""

def generate_answer(text):
    llm = get_llm()
    if llm is None:
        return "Error: Could not load the AI model. Check your console logs."

    # Remove junk characters
    text = text.replace("|", "").strip()

    # 1. Search the web using the extracted text
    web_context = search_online(text)

    # 2. Build the prompt using Llama 3.1 exact formatting requirements
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a strict teacher for class 1–10 students.

IMPORTANT RULES:
- ALWAYS answer the question directly
- NEVER say "this is a general question"
- NEVER give generic advice
- NEVER give study tips
- NEVER explain how to solve in general
- ONLY solve the given question

FORMAT:
Answer: <final answer>

Steps:
1. ...
2. ...
3. ...

Keep language very simple and clear.

{web_context}<|eot_id|><|start_header_id|>user<|end_header_id|>
Question:
{text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

    try:
        log.info("Generating answer directly via GGUF model...")
        response = llm(
            prompt,
            max_tokens=256,
            stop=["<|eot_id|>"], 
            echo=False
        )
        return response['choices'][0]['text'].strip()
    except Exception as e:
        log.error(f"Unexpected error generating answer: {e}")
        return "Error: Unexpected error occurred while generating the answer."

def pytesseract_usable() -> bool:
    try:
        import pytesseract  # noqa: F401
    except ImportError:
        return False
    return _resolve_tesseract_cmd() is not None


def ocr_engines_available() -> bool:
    """True if at least one OCR backend can run (EasyOCR reader or Tesseract binary + pytesseract)."""
    if get_easyocr_reader() is not None:
        return True
    return pytesseract_usable()


def ocr_health_info() -> dict:
    """Lightweight checks (does not load EasyOCR models — safe for /health pings)."""
    h: dict = {}
    try:
        import easyocr  # noqa: F401

        h["easyocr_import"] = True
    except Exception as e:
        h["easyocr_import"] = False
        h["easyocr_import_error"] = str(e)[:400]
    try:
        import torch

        h["torch_version"] = torch.__version__
    except Exception as e:
        h["torch_version"] = None
        h["torch_error"] = str(e)[:200]
    h["tesseract_binary"] = _resolve_tesseract_cmd()
    try:
        import pytesseract  # noqa: F401

        h["pytesseract_installed"] = True
    except ImportError:
        h["pytesseract_installed"] = False
    h["note"] = (
        "EasyOCR loads models on first /ocr call; Render free tier often OOMs. "
        "Install Tesseract on the server or use a larger instance / run API locally."
    )
    return h


def extract_text(image_bytes: bytes) -> str:
    log.info("--- Starting Text Extraction Pipeline ---")
    try:
        return _extract_text_impl(image_bytes)
    except Exception as e:
        log.exception("extract_text crashed: %s", e)
        return ""


def _extract_text_impl(image_bytes: bytes) -> str:
    # Attempt 1: EasyOCR
    text = _easyocr(image_bytes)
    if text and text.strip():
        log.info(f"EasyOCR Success: {text.strip()}")
        return text.strip()
        
    log.info("EasyOCR returned empty. Trying Tesseract (Raw Mode)...")
    
    # Attempt 2: Tesseract on raw image (Best for colors like red)
    text = _tesseract(image_bytes, apply_filter=False)
    if text and text.strip():
        log.info(f"Tesseract (Raw) Success: {text.strip()}")
        return text.strip()

    log.info("Tesseract (Raw) returned empty. Trying Tesseract (High Contrast Mode)...")

    # Attempt 3: Tesseract with heavy contrast (Best for faint pencil marks)
    text = _tesseract(image_bytes, apply_filter=True)
    if text and text.strip():
        log.info(f"Tesseract (Filtered) Success: {text.strip()}")
        return text.strip()

    log.warning("All OCR attempts failed to find text in this image.")
    return ""


# ── EasyOCR ───────────────────────────────────────────────────────────────────

def _prepare_pil_image(image_bytes: bytes):
    """RGB, downscale very large photos (speed + memory), handle alpha."""
    from PIL import Image

    img = Image.open(io.BytesIO(image_bytes))
    if img.mode in ("RGBA", "P", "LA"):
        rgba = img.convert("RGBA")
        bg = Image.new("RGB", rgba.size, (255, 255, 255))
        bg.paste(rgba, mask=rgba.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")

    w, h = img.size
    max_side = 1600
    if max(w, h) > max_side:
        scale = max_side / float(max(w, h))
        nw, nh = int(w * scale), int(h * scale)
        resample = getattr(Image, "Resampling", Image).LANCZOS
        img = img.resize((nw, nh), resample)
    return img


def _easyocr(image_bytes: bytes):
    try:
        import numpy as np
        from PIL import Image, ImageEnhance

        reader = get_easyocr_reader()
        if reader is None:
            return None

        img = _prepare_pil_image(image_bytes)
        arr = np.array(img)
        results = reader.readtext(arr, detail=0, paragraph=True)
        text = " ".join(results) if results else ""
        text = (text or "").strip()

        if text:
            return text

        # Second pass: higher contrast grayscale (helps faint scans)
        gray = Image.fromarray(arr).convert("L")
        gray = ImageEnhance.Contrast(gray).enhance(1.8)
        arr2 = np.array(gray.convert("RGB"))
        results2 = reader.readtext(arr2, detail=0, paragraph=True)
        return " ".join(results2) if results2 else ""

    except Exception as e:
        log.error(f"EasyOCR processing error: {e}", exc_info=True)
        return None

# ── Tesseract ─────────────────────────────────────────────────────────────────

def _resolve_tesseract_cmd() -> str | None:
    """Windows: default install path. macOS/Linux: PATH (brew install tesseract)."""
    if platform.system() == "Windows":
        win = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        try:
            import os

            if os.path.isfile(win):
                return win
        except OSError:
            pass
    return shutil.which("tesseract")


def _tesseract(image_bytes: bytes, apply_filter: bool = False):
    try:
        import pytesseract
        from PIL import Image, ImageEnhance

        cmd = _resolve_tesseract_cmd()
        if cmd:
            pytesseract.pytesseract.tesseract_cmd = cmd

        img = Image.open(io.BytesIO(image_bytes))
        
        if apply_filter:
            # Make image larger
            new_size = (img.width * 2, img.height * 2)
            if hasattr(Image, 'Resampling'):
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            else:
                img = img.resize(new_size, Image.LANCZOS)

            # Convert to grayscale and boost contrast to make text "pop"
            img = img.convert('L')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(2.0)
        
        # --psm 6 tells Tesseract to treat the image as a single uniform block of text. Great for single questions.
        text = pytesseract.image_to_string(img, lang="eng+hin", config='--psm 6')
        return text

    except Exception as e:
        log.error(f"Tesseract processing error: {e}")
        return None