"""
server_ai.py — Answer generation: OpenAI (if OPENAI_API_KEY) else mock KB + generic fallback.
"""

from __future__ import annotations

import json
import logging
import os

log = logging.getLogger(__name__)

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


def _generic(question: str, subject: str) -> dict:
    return {
        "answer": "Here is the step-by-step solution to your question.",
        "steps": [
            "Identify the key information given in the question.",
            "Apply the relevant concepts directly to solve it.",
            "Follow through with the calculation or logic.",
            "Verify the final answer."
        ],
        "tip": "",
    }


def _openai_solve(question: str, lang: str, chat_mode: bool) -> dict | None:
    """
    Chat Completions via the OpenAI Python SDK (OpenAI, Grok/xAI, and other OpenAI-compatible APIs).

    Keys (first non-empty wins): OPENAI_API_KEY, XAI_API_KEY, GROK_API_KEY, SHIKSHA_OPENAI_API_KEY
    Base URL (optional): OPENAI_BASE_URL or XAI_BASE_URL — e.g. https://api.x.ai/v1 for Grok
    Model: OPENAI_MODEL — e.g. gpt-4o-mini (OpenAI) or grok-2-latest (xAI; check current docs)
    """
    api_key = (
        os.environ.get("OPENAI_API_KEY")
        or os.environ.get("XAI_API_KEY")
        or os.environ.get("GROK_API_KEY")
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
    if not base_url and (
        os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY")
    ):
        base_url = "https://api.x.ai/v1"
    default_model = "grok-2-latest" if "x.ai" in base_url.lower() else "gpt-4o-mini"
    model = (os.environ.get("OPENAI_MODEL") or default_model).strip()
    lang_key = lang if lang in LABELS else "english"
    lang_names = {"english": "English", "hindi": "Hindi (Devanagari script)", "marathi": "Marathi"}
    lang_name = lang_names.get(lang_key, "English")

    schema_hint = (
        '{"answer":"string","steps":["string",...],"tip":"string","subject":"math|science|english|social_science|general"}'
    )
    if chat_mode:
        system = (
            f"You are a warm tutor for school students (grades 1–10). Reply entirely in {lang_name}. "
            "Be concise. Return ONLY valid JSON (no markdown): "
            '{"answer":"...","steps":["short point 1","short point 2"],"tip":"one line or empty"}'
        )
    else:
        system = (
            f"You are a careful tutor for grades 1–10. The question may come from a camera/OCR scan (noise, line breaks, typos). "
            f"Write every field in {lang_name}. Answer THIS exact question only—no template paragraphs, no 'identify key information' filler. "
            "Return ONLY valid JSON (no markdown) with shape: "
            f"{schema_hint}. "
            "Use 3–6 concrete steps for non-trivial questions. Pick the closest subject label."
        )

    client_kw: dict = {"api_key": api_key}
    if base_url:
        client_kw["base_url"] = base_url.rstrip("/")
    client = OpenAI(**client_kw)
    try:
        kwargs = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": question.strip()[:12000]},
            ],
            "temperature": 0.35,
            "max_tokens": 1400,
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
        subj = _detect_subject(question)

    return {
        "answer": answer,
        "steps": steps,
        "tip": tip,
        "subject": subj,
        "language": lang_key,
        "labels": LABELS[lang_key],
    }


def generate_answer(question: str, language: str = "english", chat_mode: bool = False) -> dict:
    lang = language.lower() if language.lower() in LABELS else "english"

    llm = _openai_solve(question.strip(), lang, chat_mode)
    if llm:
        return llm

    subject = _detect_subject(question)
    data = _lookup(subject, question) or _generic(question, subject)
    prefix = {"hindi": "[हिंदी] ", "marathi": "[मराठी] "}.get(lang, "")

    return {
        "answer": prefix + data["answer"],
        "steps": data["steps"],
        "tip": data.get("tip", ""),
        "subject": subject,
        "language": lang,
        "labels": LABELS[lang],
    }
