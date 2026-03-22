"""
server_ai.py — Answer generation: OpenAI (if OPENAI_API_KEY) else mock KB + generic fallback.
"""

from __future__ import annotations

import json
import logging
import os
import re
import unicodedata

log = logging.getLogger(__name__)


def normalize_ocr_for_llm(text: str) -> str:
    """Collapse OCR junk whitespace and invisible chars; keep line breaks for multi-part questions."""
    t = unicodedata.normalize("NFC", (text or "").strip())
    t = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", t)
    t = re.sub(r"\n{4,}", "\n\n\n", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    return t.strip()


# ── Language UI labels ────────────────────────────────────────────────────────

LABELS = {
    "english": {
        "answer_label": "Answer",
        "steps_label":  "Step-by-Step Explanation",
        "tip_label":    "💡 Remember",
    },
    "hindi": {
        "answer_label": "उत्तर",
        "steps_label":  "चरण-दर-चरण व्याख्या",
        "tip_label":    "💡 याद रखें",
    },
    "marathi": {
        "answer_label": "उत्तर",
        "steps_label":  "पायरी-पायरी स्पष्टीकरण",
        "tip_label":    "💡 लक्षात ठेवा",
    },
}

# ── Subject keyword map ───────────────────────────────────────────────────────

SUBJECT_KEYWORDS = {
    "math": [
        "add","subtract","multiply","divide","sum","product","quotient","equation",
        "solve","calculate","area","perimeter","fraction","decimal","percentage",
        "square","triangle","circle","algebra","geometry","number","digit","angle",
        "prime","factor","lcm","hcf","ratio","proportion","profit","loss",
    ],
    "science": [
        "plant","animal","body","water","air","light","heat","sound","force","energy",
        "cell","organ","photosynthesis","gravity","magnet","electric","atom","molecule",
        "chemical","weather","climate","ecosystem","food chain","evaporation","condensation",
        "nucleus","mitosis","newton","velocity","acceleration","friction","pressure",
    ],
    "english": [
        "verb","noun","adjective","pronoun","tense","sentence","grammar","spell",
        "punctuation","essay","story","poem","synonym","antonym","meaning","vocabulary",
        "preposition","conjunction","adverb","passive","active","voice","article",
    ],
    "social_science": [
        "history","geography","map","country","capital","river","mountain","freedom",
        "independence","president","government","democracy","state","district","culture",
        "festival","trade","resource","itihas","bhugol","constitution","parliament",
        "election","mughal","british","revolt","nationalism","latitude","longitude",
    ],
}

# ── Mock knowledge base ───────────────────────────────────────────────────────

KB: dict = {
    # MATH
    ("math","area"): {
        "answer": "Area is the amount of flat space enclosed inside a 2D shape.",
        "steps": [
            "Rectangle: Area = Length × Width",
            "Square: Area = Side × Side",
            "Triangle: Area = ½ × Base × Height",
            "Circle: Area = π × radius²  (π ≈ 3.14)",
            "Always write units as cm², m², etc.",
        ],
        "tip": "Think of area as how many unit squares fit inside the shape.",
    },
    ("math","fraction"): {
        "answer": "A fraction represents a part of a whole, written as numerator / denominator.",
        "steps": [
            "The numerator (top) says how many parts you have.",
            "The denominator (bottom) says the total equal parts.",
            "To add fractions with the same denominator, add numerators: 1/4 + 2/4 = 3/4.",
            "To add with different denominators, first find the LCM.",
            "To multiply fractions: multiply numerators and multiply denominators.",
        ],
        "tip": "½ means 1 out of 2 equal parts — like half a pizza!",
    },
    ("math","percentage"): {
        "answer": "Percentage means 'out of 100'. Symbol: %.",
        "steps": [
            "To find percentage of a number: (Percentage ÷ 100) × Number",
            "Example: 30% of 200 = (30 ÷ 100) × 200 = 60",
            "To convert fraction to %: (Numerator ÷ Denominator) × 100",
            "Example: 3/4 = 0.75 × 100 = 75%",
        ],
        "tip": "50% = half, 25% = quarter, 100% = the whole thing.",
    },
    ("math","prime"): {
        "answer": "A prime number has exactly two factors: 1 and itself.",
        "steps": [
            "Check if the number is divisible by any number from 2 to its square root.",
            "If divisible → not prime. If not divisible → prime.",
            "Primes up to 20: 2, 3, 5, 7, 11, 13, 17, 19",
            "Note: 1 is NOT a prime number.",
            "2 is the only even prime number.",
        ],
        "tip": "Use the Sieve of Eratosthenes to find all primes quickly.",
    },
    # SCIENCE
    ("science","photosynthesis"): {
        "answer": "Photosynthesis is the process plants use to make food using sunlight, water, and CO₂.",
        "steps": [
            "Plants absorb CO₂ from air through tiny pores called stomata.",
            "Roots absorb water (H₂O) from soil.",
            "Chlorophyll in leaves traps sunlight energy.",
            "Energy converts CO₂ + H₂O → glucose (sugar) + O₂.",
            "Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
        ],
        "tip": "Chlorophyll makes plants green AND powers their food factory!",
    },
    ("science","gravity"): {
        "answer": "Gravity is the attractive force between objects with mass. Earth pulls everything toward its centre.",
        "steps": [
            "Every object with mass exerts a gravitational pull.",
            "The force depends on mass and distance: F = G × m₁ × m₂ / r²",
            "Earth's gravitational acceleration (g) = 9.8 m/s²",
            "Moon's gravity = 1/6 of Earth's gravity.",
            "Gravity keeps planets in orbit around the Sun.",
        ],
        "tip": "Isaac Newton observed gravity when an apple fell from a tree in 1666.",
    },
    ("science","cell"): {
        "answer": "A cell is the basic structural and functional unit of all living organisms.",
        "steps": [
            "Two types: Prokaryotic (no nucleus, e.g. bacteria) and Eukaryotic (has nucleus).",
            "Key parts: Cell membrane, cytoplasm, nucleus, mitochondria, ribosomes.",
            "Plant cells additionally have: cell wall, chloroplasts, large vacuole.",
            "Nucleus contains DNA — the genetic blueprint.",
            "Mitochondria produce energy (ATP) — called the 'powerhouse of the cell'.",
        ],
        "tip": "Robert Hooke first observed cells in 1665 using a microscope.",
    },
    # ENGLISH
    ("english","verb"): {
        "answer": "A verb expresses an action, state, or occurrence. It is the core of every sentence.",
        "steps": [
            "Action verbs: run, eat, write, think.",
            "Linking verbs (being verbs): is, am, are, was, were.",
            "Auxiliary (helping) verbs: have, has, do, will, can, should.",
            "Verbs change form based on tense: write → wrote → will write.",
            "Identify the verb by asking: What is the subject DOING or BEING?",
        ],
        "tip": "Without a verb, you cannot have a complete sentence!",
    },
    # SOCIAL SCIENCE
    ("social_science","independence"): {
        "answer": "India gained independence from British rule on 15 August 1947.",
        "steps": [
            "British East India Company arrived in India in the early 1600s.",
            "After the 1857 revolt, the British Crown directly ruled India.",
            "Leaders like Gandhi, Nehru, Bose, Ambedkar led the freedom movement.",
            "Key movements: Non-cooperation (1920), Civil Disobedience (1930), Quit India (1942).",
            "On 15 August 1947, Nehru became India's first Prime Minister.",
        ],
        "tip": "15 August = Independence Day. 26 January = Republic Day (Constitution came into effect 1950).",
    },
}


def _detect_subject(question: str) -> str:
    q = question.lower()
    for subject, keywords in SUBJECT_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return subject
    return "general"


def _lookup(subject: str, question: str):
    q = question.lower()
    for (subj, topic), data in KB.items():
        if subj == subject and topic in q:
            return data
    return None


def _lookup_broad(question: str) -> tuple[str, dict] | tuple[None, None]:
    """
    Match any KB topic as substring of the question (longest topic wins).
    Fixes missed hits when _detect_subject is wrong or OCR garbles keywords.
    """
    q = question.lower()
    best: dict | None = None
    best_subj: str | None = None
    best_len = 0
    for (subj, topic), data in KB.items():
        if len(topic) < 3:
            continue
        if topic in q and len(topic) > best_len:
            best_len = len(topic)
            best = data
            best_subj = subj
    if best is not None and best_subj is not None:
        return best_subj, best
    return None, None


def llm_env_configured() -> bool:
    return bool(
        (
            os.environ.get("OPENAI_API_KEY")
            or os.environ.get("XAI_API_KEY")
            or os.environ.get("GROK_API_KEY")
            or os.environ.get("GROQ_API_KEY")
            or os.environ.get("SHIKSHA_OPENAI_API_KEY")
            or ""
        ).strip()
    )


def _fallback_no_match() -> dict:
    """When no LLM key and no KB hit — honest message instead of fake template steps."""
    return {
        "answer": (
            "No AI API key is available to this server, so I can only use a tiny built-in topic list. "
            "Add a key to the Python API environment (or a .env file next to server_main.py for local runs) and restart."
        ),
        "steps": [
            "Hosted (Render etc.): Dashboard → your API service → Environment → add one of: OPENAI_API_KEY, XAI_API_KEY, GROQ_API_KEY.",
            "Groq: set GROQ_API_KEY=gsk-... (no extra URL needed). OpenAI: OPENAI_API_KEY=sk-.... xAI/Grok: XAI_API_KEY + XAI_BASE_URL=https://api.x.ai/v1",
            "Redeploy or restart the API. Open GET /health and check llm.configured is true.",
        ],
        "tip": "Local dev: copy .env.example to .env in the project root and set GROQ_API_KEY or OPENAI_API_KEY.",
    }


def _openai_solve(
    question: str, lang: str, chat_mode: bool, from_ocr: bool = False
) -> dict | None:
    """
    Chat Completions via the OpenAI Python SDK (OpenAI, Grok/xAI, and other OpenAI-compatible APIs).

    Keys (first non-empty wins): OPENAI_API_KEY, XAI_API_KEY, GROK_API_KEY, GROQ_API_KEY, SHIKSHA_OPENAI_API_KEY
    Base URL (optional): OPENAI_BASE_URL or XAI_BASE_URL — e.g. https://api.x.ai/v1 for Grok; Groq defaults to api.groq.com
    Model: OPENAI_MODEL — e.g. gpt-4o-mini (OpenAI), grok-2-latest (xAI), llama-3.1-8b-instant (Groq)
    """
    api_key = (
        os.environ.get("OPENAI_API_KEY")
        or os.environ.get("XAI_API_KEY")
        or os.environ.get("GROK_API_KEY")
        or os.environ.get("GROQ_API_KEY")
        or os.environ.get("SHIKSHA_OPENAI_API_KEY")
        or ""
    ).strip()
    if not api_key:
        return None

    try:
        from openai import OpenAI
    except ImportError:
        log.warning("openai package not installed; skipping LLM solve")
        return None

    base_url = (os.environ.get("OPENAI_BASE_URL") or os.environ.get("XAI_BASE_URL") or "").strip()
    groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
    uses_groq = bool(groq_key) and api_key == groq_key
    if not base_url and (os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY")):
        base_url = "https://api.x.ai/v1"
    elif not base_url and uses_groq:
        base_url = "https://api.groq.com/openai/v1"

    b = base_url.lower()
    if "x.ai" in b:
        default_model = "grok-2-latest"
    elif "groq.com" in b:
        default_model = "llama-3.1-8b-instant"
    else:
        default_model = "gpt-4o-mini"
    model = (os.environ.get("OPENAI_MODEL") or default_model).strip()
    lang_key = lang if lang in LABELS else "english"
    lang_names = {"english": "English", "hindi": "Hindi (Devanagari script)", "marathi": "Marathi"}
    lang_name = lang_names.get(lang_key, "English")

    schema_hint = (
        '{"answer":"string","steps":["string",...],"tip":"string","subject":"math|science|english|social_science|general"}'
    )
    ocr_rules = (
        "The user text may be OCR from a photo: fix likely misread letters (e.g. O/0, l/1, rn/m), "
        "merge broken words where obvious, and ignore decorative borders or watermarks. "
        "If Hindi/Marathi (Devanagari) and English are mixed, use both. "
        "Answer the recovered question with the correct final result for math problems."
    )
    if chat_mode:
        system = (
            f"You are a tutor for grades 1–10. Reply entirely in {lang_name}. "
            "Answer the user's actual question with specific facts, steps, or calculations—never reply with only generic study tips. "
        )
        if from_ocr:
            system += ocr_rules + " "
        system += (
            "Return ONLY valid JSON (no markdown): "
            '{"answer":"direct helpful reply","steps":["concrete point 1","concrete point 2"],"tip":"one line or empty string"}'
        )
    else:
        system = (
            f"You are a careful tutor for grades 1–10. The question may come from a camera/OCR scan (noise, line breaks, typos). "
            f"Write every field in {lang_name}. Answer THIS exact question only—no template paragraphs, no 'identify key information' filler. "
        )
        if from_ocr:
            system += ocr_rules + " "
        system += (
            "Return ONLY valid JSON (no markdown) with shape: "
            f"{schema_hint}. "
            "Use 3–6 concrete steps for non-trivial questions. Pick the closest subject label."
        )

    q_raw = (question or "").strip()[:12000]
    q_use = normalize_ocr_for_llm(q_raw) if from_ocr else q_raw
    if from_ocr:
        user_content = (
            "The following may be from a camera scan (OCR) or pasted homework: it can be noisy or multi-line. "
            "Recover the intended question and answer it precisely (include numeric results for math).\n\n---\n"
            f"{q_use}"
        )
    else:
        user_content = q_use

    temp = 0.22 if from_ocr else 0.35
    max_tok = 2000 if from_ocr else 1400

    client_kw: dict = {"api_key": api_key}
    if base_url:
        client_kw["base_url"] = base_url.rstrip("/")
    client = OpenAI(**client_kw)
    try:
        kwargs = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            "temperature": temp,
            "max_tokens": max_tok,
        }
        try:
            kwargs["response_format"] = {"type": "json_object"}
            resp = client.chat.completions.create(**kwargs)
        except Exception as e1:
            log.info("OpenAI json_object mode failed (%s), retrying without it", e1)
            kwargs.pop("response_format", None)
            resp = client.chat.completions.create(**kwargs)

        raw = (resp.choices[0].message.content or "").strip()
        if not raw:
            return None
        # Strip ```json fences if the model added them
        if raw.startswith("```"):
            raw = raw.removeprefix("```json").removeprefix("```").strip()
            if raw.endswith("```"):
                raw = raw[: raw.rfind("```")].strip()

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            lo, hi = raw.find("{"), raw.rfind("}")
            if lo >= 0 and hi > lo:
                data = json.loads(raw[lo : hi + 1])
            else:
                raise
    except Exception as e:
        log.warning("OpenAI solve failed: %s", e, exc_info=True)
        return None

    answer = str(data.get("answer", "")).strip()
    if not answer:
        return None

    steps_raw = data.get("steps")
    if isinstance(steps_raw, str):
        steps = [s.strip() for s in steps_raw.replace("•", "\n").split("\n") if s.strip()]
    elif isinstance(steps_raw, list):
        steps = [str(s).strip() for s in steps_raw if str(s).strip()]
    else:
        steps = []
    if not steps:
        steps = ["—"]

    tip = str(data.get("tip", "") or "").strip()
    subj = str(data.get("subject", "") or "").lower().strip()
    if subj not in ("math", "science", "english", "social_science", "general"):
        subj = _detect_subject(q_use)

    return {
        "answer": answer,
        "steps": steps,
        "tip": tip,
        "subject": subj,
        "language": lang_key,
        "labels": LABELS[lang_key],
    }


def generate_answer(
    question: str,
    language: str = "english",
    chat_mode: bool = False,
    from_ocr: bool = False,
) -> dict:
    lang = language.lower() if language.lower() in LABELS else "english"
    q_work = normalize_ocr_for_llm(question) if from_ocr else question.strip()

    llm = _openai_solve(q_work, lang, chat_mode, from_ocr)
    if llm:
        return llm

    broad_subj, broad_data = _lookup_broad(q_work)
    if broad_data is not None and broad_subj is not None:
        subject, data = broad_subj, broad_data
    else:
        subject = _detect_subject(q_work)
        data = _lookup(subject, q_work)

    if not data:
        data = _fallback_no_match()
        subject = "general"

    prefix = {"hindi": "[हिंदी] ", "marathi": "[मराठी] "}.get(lang, "")

    return {
        "answer": prefix + data["answer"],
        "steps": data["steps"],
        "tip": data.get("tip", ""),
        "subject": subject,
        "language": lang,
        "labels": LABELS[lang],
    }
