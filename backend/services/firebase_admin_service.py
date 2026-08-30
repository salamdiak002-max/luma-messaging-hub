# Nom : firebase_admin_service.py | Chemin : /backend/services/firebase_admin_service.py
# Rôle : initialisation Firebase Admin, vérification des jetons et gestion des rôles (custom claims).
import os
from functools import wraps

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore
from flask import g, jsonify, request

_app = None


def init() -> None:
    """Initialise Firebase Admin une seule fois (clé de service côté serveur uniquement)."""
    global _app
    if _app is None:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        cred = credentials.Certificate(cred_path) if cred_path else credentials.ApplicationDefault()
        _app = firebase_admin.initialize_app(cred)


def db():
    init()
    return firestore.client()


def verify_token(id_token: str) -> dict:
    init()
    return fb_auth.verify_id_token(id_token)


def set_role(uid: str, role: str) -> None:
    """Rôles autorisés : user, admin, superadmin. Écrit un custom claim non modifiable côté client."""
    if role not in ("user", "admin", "superadmin"):
        raise ValueError("role invalide")
    init()
    fb_auth.set_custom_user_claims(uid, {"role": role})


def require_auth(roles: tuple[str, ...] | None = None):
    """Décorateur : exige un jeton Firebase valide, et éventuellement un rôle."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            if not header.startswith("Bearer "):
                return jsonify(error="unauthorized"), 401
            try:
                g.claims = verify_token(header.split(" ", 1)[1])
            except Exception:
                return jsonify(error="invalid_token"), 401
            if roles and g.claims.get("role") not in roles:
                return jsonify(error="forbidden"), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
