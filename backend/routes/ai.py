# Nom : ai.py | Chemin : /backend/routes/ai.py
# Rôle : endpoint IA LUMA (préparation) — architecture prête, activation via .env.
from flask import Blueprint, jsonify, request

from services import ai_service
from services.firebase_admin_service import require_auth

ai_bp = Blueprint("ai", __name__)


@ai_bp.post("/ask")
@require_auth()
def ask():
    if not ai_service.is_enabled():
        return jsonify(error="ia_desactivee"), 503
    prompt = (request.get_json(silent=True) or {}).get("prompt", "").strip()
    if not prompt:
        return jsonify(error="prompt requis"), 400
    return jsonify(answer=ai_service.ask(prompt))
