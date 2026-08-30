# Nom : app.py | Chemin : /backend/app.py
# Rôle : point d'entrée du backend Python (Flask) — API sécurisée, admin, IA (préparation).
import os

from flask import Flask, jsonify
from flask_cors import CORS

from routes.admin import admin_bp
from routes.ai import ai_bp


def create_app() -> Flask:
    app = Flask(__name__)
    origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    CORS(app, resources={r"/api/*": {"origins": origins}})

    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", service="luma-backend")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)), debug=os.getenv("FLASK_ENV") == "development")
