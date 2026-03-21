"""student_activity inserts + progress aggregates for sync with Postgres."""

from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import Any

from psycopg.types.json import Json

VALID_ACTIVITY_TYPES = frozenset({"scan_solve", "chat", "quiz", "manual_solve", "login"})


def _parse_uuid(user_id: str) -> uuid.UUID | None:
    try:
        return uuid.UUID(str(user_id).strip())
    except ValueError:
        return None


def user_exists(cur, user_id: str) -> bool:
    uid = _parse_uuid(user_id)
    if not uid:
        return False
    cur.execute("SELECT 1 FROM users WHERE id = %s", (str(uid),))
    return cur.fetchone() is not None


def insert_activity(
    cur,
    *,
    student_user_id: str,
    activity_type: str,
    subject_hint: str | None = None,
    summary: str | None = None,
    payload: dict | None = None,
) -> str:
    if activity_type not in VALID_ACTIVITY_TYPES:
        raise ValueError("Invalid activity_type")
    uid = _parse_uuid(student_user_id)
    if not uid:
        raise ValueError("Invalid user id")
    cur.execute(
        """
        INSERT INTO student_activity (student_user_id, activity_type, subject_hint, summary, payload)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            str(uid),
            activity_type,
            (subject_hint or "").strip() or None,
            (summary or "").strip() or None,
            Json(payload or {}),
        ),
    )
    row = cur.fetchone()
    return str(row[0]) if row else ""


def try_insert_quiz_attempt(
    cur,
    *,
    student_user_id: str,
    correct: int,
    total: int,
    subject_hint: str | None,
    payload: dict | None,
) -> None:
    """If an app-anchored quiz row exists (see database/04_app_quiz_anchor.sql), mirror results."""
    uid = _parse_uuid(student_user_id)
    if not uid or total <= 0:
        return
    cur.execute(
        "SELECT id FROM quizzes WHERE meta->>'kind' = %s LIMIT 1",
        ("app",),
    )
    row = cur.fetchone()
    if not row:
        return
    quiz_id = row[0]
    pct = round((100.0 * correct) / total, 2)
    cur.execute(
        """
        INSERT INTO quiz_attempts (
          quiz_id, student_user_id, score_percent, total_questions, correct_count, answers, completed_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, now())
        """,
        (
            str(quiz_id),
            str(uid),
            pct,
            total,
            correct,
            Json(payload or {}),
        ),
    )


def _week_bars_from_rows(rows: list[tuple[Any, ...]]) -> tuple[list[int], str | None]:
    """Current ISO week Mon–Sun activity counts (rows: created_at first column)."""
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    week_id = monday.isoformat()
    bars = [0, 0, 0, 0, 0, 0, 0]
    for r in rows:
        created = r[0]
        if not hasattr(created, "date"):
            continue
        d = created.date()
        if d < monday or d > monday + timedelta(days=6):
            continue
        idx = d.weekday()
        bars[idx] += 1
    return bars, week_id


def _streak_from_day_counts(day_counts: dict[date, int]) -> int:
    if not day_counts:
        return 0
    today = date.today()
    if today in day_counts:
        cur = today
    elif (today - timedelta(days=1)) in day_counts:
        cur = today - timedelta(days=1)
    else:
        return 0
    streak = 0
    while cur in day_counts:
        streak += 1
        cur -= timedelta(days=1)
    return streak


def aggregate_progress_from_rows(rows: list[tuple[Any, ...]]) -> dict[str, Any]:
    """
    rows: (created_at, activity_type, subject_hint, summary, payload)
    Build shape compatible with services/userProgress.js defaults.
    """
    questions_solved = 0
    quiz_sessions = 0
    quiz_correct_total = 0
    quiz_questions_total = 0
    perfect_quizzes = 0
    scans_completed = 0
    chat_turns = 0
    subject_counts: dict[str, int] = {
        "Mathematics": 0,
        "Science": 0,
        "English": 0,
        "Social Science": 0,
        "General": 0,
    }
    recent_activity: list[dict[str, Any]] = []
    max_day_counts: dict[date, int] = {}

    def bump_subject(hint: str | None) -> None:
        if not hint:
            subject_counts["General"] = subject_counts.get("General", 0) + 1
            return
        h = hint.strip()
        key = {
            "math": "Mathematics",
            "mathematics": "Mathematics",
            "science": "Science",
            "english": "English",
            "social_science": "Social Science",
            "mixed": "General",
            "general": "General",
        }.get(h.lower().replace(" ", "_"), "General")
        subject_counts[key] = subject_counts.get(key, 0) + 1

    for created_at, act_type, subj_hint, summary, payload in rows:
        pl = payload if isinstance(payload, dict) else {}
        d = created_at.date() if hasattr(created_at, "date") else None
        if d:
            max_day_counts[d] = max_day_counts.get(d, 0) + 1

        if act_type in ("manual_solve", "scan_solve"):
            questions_solved += 1
            bump_subject(subj_hint or pl.get("subject"))
            if act_type == "scan_solve":
                scans_completed += 1
            snip = (summary or pl.get("question_snippet") or "")[:100]
            recent_activity.append(
                {
                    "subject": subj_hint or pl.get("subject_label") or "General",
                    "q": snip or "Question",
                    "time": int(created_at.timestamp() * 1000)
                    if hasattr(created_at, "timestamp")
                    else 0,
                }
            )
        elif act_type == "chat":
            chat_turns += 1
            bump_subject(subj_hint)
        elif act_type == "quiz":
            quiz_sessions += 1
            c = int(pl.get("correct") or 0)
            t = int(pl.get("total") or 0)
            quiz_correct_total += c
            quiz_questions_total += t
            if t > 0 and c == t:
                perfect_quizzes += 1
            bump_subject(pl.get("subject") or subj_hint)

    # streak: consecutive calendar days ending today or yesterday
    streak = _streak_from_day_counts(max_day_counts)

    xp = questions_solved * 15 + quiz_correct_total * 8 + perfect_quizzes * 40 + chat_turns * 3

    bars, week_id = _week_bars_from_rows(rows)

    max_actions_one_day = max(max_day_counts.values()) if max_day_counts else 0

    sorted_days = sorted(max_day_counts.keys(), reverse=True)
    last_active = sorted_days[0].isoformat() if sorted_days else None

    return {
        "questionsSolved": questions_solved,
        "xp": xp,
        "streak": streak,
        "lastActiveDay": last_active,
        "quizSessions": quiz_sessions,
        "quizQuestionsTotal": quiz_questions_total,
        "quizCorrectTotal": quiz_correct_total,
        "perfectQuizzes": perfect_quizzes,
        "scansCompleted": scans_completed,
        "chatTurns": chat_turns,
        "subjectCounts": subject_counts,
        "weekId": week_id,
        "weekBars": bars,
        "weeklyActions": sum(bars),
        "maxActionsOneDay": max_actions_one_day,
        "recentActivity": recent_activity[:10],
    }


def fetch_activity_rows(cur, user_id: str, limit: int = 800) -> list[tuple[Any, ...]]:
    uid = _parse_uuid(user_id)
    if not uid:
        return []
    cur.execute(
        """
        SELECT created_at, activity_type, subject_hint, summary, payload
        FROM student_activity
        WHERE student_user_id = %s
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (str(uid), limit),
    )
    return list(cur.fetchall())


def get_progress_payload(cur, user_id: str) -> dict[str, Any]:
    rows = fetch_activity_rows(cur, user_id)
    return aggregate_progress_from_rows(rows)
