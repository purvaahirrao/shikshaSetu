"""Register / login / profile updates against PostgreSQL users table."""

from __future__ import annotations

import uuid
from typing import Any

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

VALID_ROLES = frozenset({"student", "parent", "teacher"})


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def row_to_user(row: tuple[Any, ...]) -> dict:
    uid, email, full_name, role, class_grade, language_pref = row
    return {
        "id": str(uid),
        "email": email,
        "full_name": full_name,
        "role": role,
        "class_grade": class_grade,
        "language_pref": language_pref or "english",
    }


def register_user(
    cur,
    *,
    email: str,
    password: str,
    full_name: str,
    role: str,
    class_grade: str | None,
    language_pref: str,
) -> dict:
    email = email.strip().lower()
    if role not in VALID_ROLES:
        raise ValueError("Invalid role")
    if role == "student" and not (class_grade and str(class_grade).strip()):
        raise ValueError("Class is required for students")

    cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        raise ValueError("EMAIL_TAKEN")

    ph = hash_password(password)
    cur.execute(
        """
        INSERT INTO users (email, password_hash, full_name, role, class_grade, language_pref)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, email, full_name, role, class_grade, language_pref
        """,
        (email, ph, full_name.strip(), role, class_grade, language_pref),
    )
    row = cur.fetchone()
    return row_to_user(row)


def login_user(cur, *, email: str, password: str) -> dict | None:
    email = email.strip().lower()
    cur.execute(
        """
        SELECT id, email, password_hash, full_name, role, class_grade, language_pref
        FROM users WHERE email = %s
        """,
        (email,),
    )
    row = cur.fetchone()
    if not row:
        return None
    uid, em, ph, full_name, role, class_grade, language_pref = row
    if not verify_password(password, ph):
        return None
    return row_to_user((uid, em, full_name, role, class_grade, language_pref))


def update_profile(
    cur,
    *,
    user_id: str,
    full_name: str,
    class_grade: str | None,
    language_pref: str,
) -> dict | None:
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return None

    cur.execute("SELECT id, role FROM users WHERE id = %s", (str(uid),))
    row = cur.fetchone()
    if not row:
        return None
    _id, role = row
    if role == "student" and not (class_grade and str(class_grade).strip()):
        raise ValueError("Class is required for students")

    cur.execute(
        """
        UPDATE users SET
          full_name = %s,
          class_grade = %s,
          language_pref = %s
        WHERE id = %s
        RETURNING id, email, full_name, role, class_grade, language_pref
        """,
        (full_name.strip(), class_grade, language_pref, str(uid)),
    )
    row = cur.fetchone()
    if not row:
        return None
    return row_to_user(row)


def user_to_client_dict(row: tuple[Any, ...]) -> dict[str, Any]:
    """Full user row → JSON for the Next.js client."""
    (
        uid,
        email,
        full_name,
        role,
        class_grade,
        language_pref,
        phone,
        school_name,
        board,
        learning_goal,
        subject_expertise,
        experience_band,
        teach_classes,
        child_name,
        child_class,
        parent_goal,
        avatar_url,
        client_uid,
        firebase_uid,
        auth_provider,
    ) = row
    tc = list(teach_classes) if teach_classes is not None else []
    return {
        "id": str(uid),
        "email": email,
        "full_name": full_name,
        "role": role,
        "class_grade": class_grade,
        "language_pref": language_pref or "english",
        "phone": phone,
        "school_name": school_name,
        "board": board,
        "learning_goal": learning_goal,
        "subject_expertise": subject_expertise,
        "experience_band": experience_band,
        "teach_classes": tc,
        "child_name": child_name,
        "child_class": child_class,
        "parent_goal": parent_goal,
        "avatar_url": avatar_url,
        "client_uid": client_uid,
        "firebase_uid": firebase_uid,
        "auth_provider": auth_provider or "email",
    }


def get_user_by_id(cur, user_id: str) -> dict[str, Any] | None:
    try:
        uid = uuid.UUID(str(user_id).strip())
    except ValueError:
        return None
    cur.execute(
        """
        SELECT id, email, full_name, role, class_grade, language_pref,
               phone, school_name, board, learning_goal,
               subject_expertise, experience_band, teach_classes,
               child_name, child_class, parent_goal, avatar_url,
               client_uid, firebase_uid, auth_provider
        FROM users WHERE id = %s
        """,
        (str(uid),),
    )
    row = cur.fetchone()
    return user_to_client_dict(row) if row else None


def login_user_full(cur, *, email: str, password: str) -> dict[str, Any] | None:
    """Login returning full profile for the API client."""
    email = email.strip().lower()
    cur.execute(
        "SELECT id, password_hash FROM users WHERE email = %s",
        (email,),
    )
    row = cur.fetchone()
    if not row:
        return None
    uid, ph = row
    if not ph or not verify_password(password, ph):
        return None
    return get_user_by_id(cur, str(uid))


def register_user_full(
    cur,
    *,
    email: str,
    password: str,
    full_name: str,
    role: str,
    class_grade: str | None,
    language_pref: str,
    phone: str | None = None,
    school_name: str | None = None,
    client_uid: str | None = None,
    board: str | None = None,
    learning_goal: str | None = None,
    subject_expertise: str | None = None,
    experience_band: str | None = None,
    teach_classes: list[str] | None = None,
    child_name: str | None = None,
    child_class: str | None = None,
    parent_goal: str | None = None,
    avatar_url: str | None = None,
    auth_provider: str = "email",
) -> dict[str, Any]:
    email = email.strip().lower()
    if role not in VALID_ROLES:
        raise ValueError("Invalid role")
    if role == "student" and not (class_grade and str(class_grade).strip()):
        raise ValueError("Class is required for students")
    if role == "teacher" and not (subject_expertise and str(subject_expertise).strip()):
        raise ValueError("Subject is required for teachers")
    if role == "parent":
        if not (child_name and str(child_name).strip()):
            raise ValueError("Child name is required for parents")
        if not (child_class and str(child_class).strip()):
            raise ValueError("Child class is required for parents")

    cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        raise ValueError("EMAIL_TAKEN")

    ph = hash_password(password)
    tc = teach_classes or []
    cur.execute(
        """
        INSERT INTO users (
          email, password_hash, full_name, role, class_grade, language_pref,
          phone, school_name, client_uid, board, learning_goal,
          subject_expertise, experience_band, teach_classes,
          child_name, child_class, parent_goal, avatar_url, auth_provider
        )
        VALUES (
          %s, %s, %s, %s, %s, %s,
          %s, %s, %s, %s, %s,
          %s, %s, %s,
          %s, %s, %s, %s, %s
        )
        RETURNING id, email, full_name, role, class_grade, language_pref,
                  phone, school_name, board, learning_goal,
                  subject_expertise, experience_band, teach_classes,
                  child_name, child_class, parent_goal, avatar_url,
                  client_uid, firebase_uid, auth_provider
        """,
        (
            email,
            ph,
            full_name.strip(),
            role,
            class_grade,
            language_pref,
            (phone or "").strip() or None,
            (school_name or "").strip() or None,
            (client_uid or "").strip() or None,
            (board or "").strip() or None,
            (learning_goal or "").strip() or None,
            (subject_expertise or "").strip() or None,
            (experience_band or "").strip() or None,
            tc,
            (child_name or "").strip() or None,
            (child_class or "").strip() or None,
            (parent_goal or "").strip() or None,
            (avatar_url or "").strip() or None,
            auth_provider,
        ),
    )
    row = cur.fetchone()
    return user_to_client_dict(row)


def upsert_google_user(
    cur,
    *,
    firebase_uid: str,
    email: str,
    full_name: str,
    avatar_url: str | None = None,
) -> dict[str, Any]:
    email = email.strip().lower()
    fb = (firebase_uid or "").strip()
    if not fb or not email:
        raise ValueError("firebase_uid and email are required")

    cur.execute(
        """
        SELECT id, email, full_name, role, class_grade, language_pref,
               phone, school_name, board, learning_goal,
               subject_expertise, experience_band, teach_classes,
               child_name, child_class, parent_goal, avatar_url,
               client_uid, firebase_uid, auth_provider
        FROM users WHERE firebase_uid = %s
        """,
        (fb,),
    )
    row = cur.fetchone()
    if row:
        cur.execute(
            """
            UPDATE users SET
              full_name = COALESCE(NULLIF(%s, ''), full_name),
              email = %s,
              avatar_url = COALESCE(NULLIF(%s, ''), avatar_url),
              auth_provider = 'google'
            WHERE firebase_uid = %s
            RETURNING id, email, full_name, role, class_grade, language_pref,
                      phone, school_name, board, learning_goal,
                      subject_expertise, experience_band, teach_classes,
                      child_name, child_class, parent_goal, avatar_url,
                      client_uid, firebase_uid, auth_provider
            """,
            (full_name.strip(), email, (avatar_url or "").strip() or None, fb),
        )
        row = cur.fetchone()
        return user_to_client_dict(row)

    cur.execute(
        """
        SELECT id, email, full_name, role, class_grade, language_pref,
               phone, school_name, board, learning_goal,
               subject_expertise, experience_band, teach_classes,
               child_name, child_class, parent_goal, avatar_url,
               client_uid, firebase_uid, auth_provider
        FROM users WHERE lower(email) = lower(%s)
        """,
        (email,),
    )
    row = cur.fetchone()
    if row:
        cur.execute(
            """
            UPDATE users SET
              firebase_uid = %s,
              auth_provider = 'google',
              full_name = COALESCE(NULLIF(%s, ''), full_name),
              avatar_url = COALESCE(NULLIF(%s, ''), avatar_url)
            WHERE id = %s
            RETURNING id, email, full_name, role, class_grade, language_pref,
                      phone, school_name, board, learning_goal,
                      subject_expertise, experience_band, teach_classes,
                      child_name, child_class, parent_goal, avatar_url,
                      client_uid, firebase_uid, auth_provider
            """,
            (fb, full_name.strip(), (avatar_url or "").strip() or None, str(row[0])),
        )
        row = cur.fetchone()
        return user_to_client_dict(row)

    cur.execute(
        """
        INSERT INTO users (
          email, password_hash, full_name, role, class_grade, language_pref,
          firebase_uid, auth_provider, avatar_url
        )
        VALUES (%s, NULL, %s, 'student', NULL, 'english', %s, 'google', %s)
        RETURNING id, email, full_name, role, class_grade, language_pref,
                  phone, school_name, board, learning_goal,
                  subject_expertise, experience_band, teach_classes,
                  child_name, child_class, parent_goal, avatar_url,
                  client_uid, firebase_uid, auth_provider
        """,
        (email, full_name.strip() or email.split("@")[0], fb, (avatar_url or "").strip() or None),
    )
    row = cur.fetchone()
    return user_to_client_dict(row)


def update_profile_full(
    cur,
    *,
    user_id: str,
    full_name: str | None = None,
    class_grade: str | None = None,
    language_pref: str | None = None,
    phone: str | None = None,
    school_name: str | None = None,
    board: str | None = None,
    learning_goal: str | None = None,
    subject_expertise: str | None = None,
    experience_band: str | None = None,
    teach_classes: list[str] | None = None,
    child_name: str | None = None,
    child_class: str | None = None,
    parent_goal: str | None = None,
) -> dict[str, Any] | None:
    existing = get_user_by_id(cur, user_id)
    if not existing:
        return None
    role = existing["role"]
    fn = (full_name if full_name is not None else existing["full_name"]).strip()
    cg = class_grade if class_grade is not None else existing["class_grade"]
    lp = (language_pref or existing["language_pref"] or "english").strip()
    if role == "student" and not (cg and str(cg).strip()):
        raise ValueError("Class is required for students")
    if role == "parent":
        cn = (child_name if child_name is not None else existing["child_name"]) or ""
        cc = child_class if child_class is not None else existing["child_class"]
        if not cn.strip() or not (cc and str(cc).strip()):
            raise ValueError("Child name and class are required for parents")

    try:
        uid = uuid.UUID(str(user_id).strip())
    except ValueError:
        return None

    tc = teach_classes if teach_classes is not None else existing["teach_classes"]

    cur.execute(
        """
        UPDATE users SET
          full_name = %s,
          class_grade = %s,
          language_pref = %s,
          phone = COALESCE(NULLIF(%s, ''), phone),
          school_name = COALESCE(NULLIF(%s, ''), school_name),
          board = COALESCE(NULLIF(%s, ''), board),
          learning_goal = COALESCE(NULLIF(%s, ''), learning_goal),
          subject_expertise = COALESCE(NULLIF(%s, ''), subject_expertise),
          experience_band = COALESCE(NULLIF(%s, ''), experience_band),
          teach_classes = %s,
          child_name = COALESCE(NULLIF(%s, ''), child_name),
          child_class = COALESCE(NULLIF(%s, ''), child_class),
          parent_goal = COALESCE(NULLIF(%s, ''), parent_goal)
        WHERE id = %s
        RETURNING id, email, full_name, role, class_grade, language_pref,
                  phone, school_name, board, learning_goal,
                  subject_expertise, experience_band, teach_classes,
                  child_name, child_class, parent_goal, avatar_url,
                  client_uid, firebase_uid, auth_provider
        """,
        (
            fn,
            cg,
            lp,
            (phone or "").strip(),
            (school_name or "").strip(),
            (board or "").strip(),
            (learning_goal or "").strip(),
            (subject_expertise or "").strip(),
            (experience_band or "").strip(),
            tc,
            (child_name or "").strip() if child_name is not None else None,
            (child_class or "").strip() if child_class is not None else None,
            (parent_goal or "").strip() if parent_goal is not None else None,
            str(uid),
        ),
    )
    row = cur.fetchone()
    return user_to_client_dict(row) if row else None
