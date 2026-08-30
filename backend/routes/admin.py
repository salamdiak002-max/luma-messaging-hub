# Nom : admin.py | Chemin : /backend/routes/admin.py
# Rôle : endpoints d'administration protégés (attribution des rôles).
from flask import Blueprint, jsonify, request

from services.firebase_admin_service import require_auth, set_role

admin_bp = Blueprint("admin", __name__)


@admin_bp.post("/role")
@require_auth(roles=("superadmin",))
def assign_role():
    data = request.get_json(silent=True) or {}
    uid, role = data.get("uid"), data.get("role")
    if not uid or not role:
        return jsonify(error="uid et role requis"), 400
    try:
        set_role(uid, role)
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    return jsonify(status="ok", uid=uid, role=role)
