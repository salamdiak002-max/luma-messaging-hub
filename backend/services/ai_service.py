# Nom : ai_service.py | Chemin : /backend/services/ai_service.py
# Rôle : passerelle IA LUMA (préparation) — la clé API reste exclusivement côté serveur.
import os

import requests


def is_enabled() -> bool:
    return bool(os.getenv("AI_API_KEY") and os.getenv("AI_API_URL"))


def ask(prompt: str) -> str:
    """Appelle l'API IA externe. Jamais exposée au frontend."""
    if not is_enabled():
        raise RuntimeError("IA non configurée")
    response = requests.post(
        os.environ["AI_API_URL"],
        headers={"Authorization": f"Bearer {os.environ['AI_API_KEY']}"},
        json={"messages": [{"role": "user", "content": prompt}]},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
