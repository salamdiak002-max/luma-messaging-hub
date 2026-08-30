# LUMA — Messagerie de l'écosystème Lumesys

Messagerie privée temps réel en **HTML5 / CSS3 / JavaScript ES6+ / Firebase**, avec un **backend Python (Flask)** prêt pour les traitements serveur, l'administration et l'IA LUMA.

## Structure

```
public/luma/            # Frontend statique (servi sur /luma/index.html)
├── index.html          # Accueil
├── login.html          # Connexion
├── register.html       # Inscription
├── messages.html       # Messagerie
├── profile.html        # Profil
├── settings.html       # Paramètres
├── css/                # style.css, auth.css, messages.css, profile.css, responsive.css
└── js/                 # firebase-config.js, firebase.js, app.js, auth.js,
                        # conversations.js, messages.js, profile.js, settings.js
backend/                # app.py, requirements.txt, routes/, services/
firestore.rules         # Sécurité Firestore (deny by default)
storage.rules           # Sécurité Storage
firebase.json           # Hosting + rules
firestore.indexes.json  # Index composite conversations
.env.example            # Variables backend (jamais de secrets committés)
FIREBASE_SETUP.md       # Configuration Firebase pas à pas
```

## Installation

1. Renseigne `public/luma/js/firebase-config.js` avec la config web de ton projet Firebase.
2. Suis `FIREBASE_SETUP.md` (Authentication, Firestore, Storage, règles, index).
3. Ouvre l'application : `/luma/index.html` (la racine `/` y redirige).

Backend Python (optionnel à ce stade) :

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # puis complète les valeurs
python app.py                # http://localhost:8000/api/health
```

## Fonctionnement

- **Auth** : email/mot de passe, réinitialisation, session persistante, redirection des pages privées.
- **Utilisateurs** : document `users/{uid}` (nom, username unique, photo, rôle `user`).
- **Conversations** : `conversations/{uidA_uidB}` avec `members`, `memberInfo`, `lastMessage`, `unread`.
- **Messages** : sous-collection `messages`, écoute `onSnapshot` → temps réel sans rechargement.
- **Lus/non lus** : compteur `unread.{uid}` incrémenté à l'envoi, remis à 0 à l'ouverture.

## Sécurité

Aucune règle permissive : `firestore.rules` et `storage.rules` refusent tout par défaut. Le rôle ne peut pas être modifié depuis le navigateur ; les rôles `admin` / `superadmin` passent par des **custom claims** posés par le backend Python (Admin SDK). Les clés secrètes (Admin SDK, IA) restent exclusivement côté serveur.

## Déploiement

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage
```

Le backend Python se déploie séparément (Cloud Run, Render, VPS) avec `gunicorn app:app`.
