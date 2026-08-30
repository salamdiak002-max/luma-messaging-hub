# Configuration Firebase — LUMA

## 1. Créer le projet

- Emplacement : <https://console.firebase.google.com> → **Ajouter un projet**
- Action : créer le projet `luma` (Analytics facultatif)
- Pourquoi : héberger l'authentification et la base temps réel.

## 2. Créer l'application Web et récupérer la config

- Emplacement : **Paramètres du projet → Vos applications → Web (</>)**
- Action : enregistrer l'app, copier l'objet `firebaseConfig`, le coller dans `public/luma/js/firebase-config.js`
- Pourquoi : connecter le frontend. Ces clés sont publiques par conception ; la sécurité vient des règles.

## 3. Activer l'authentification

- Emplacement : **Authentication → Sign-in method**
- Action : activer **Email/Password**
- Pourquoi : permettre l'inscription, la connexion et la récupération du mot de passe.
- Optionnel plus tard : activer **Google** (l'architecture est prête).

## 4. Créer Firestore

- Emplacement : **Firestore Database → Créer une base de données**
- Action : mode **production**, région proche de tes utilisateurs (ex. `eur3`)
- Pourquoi : stocker `users`, `conversations`, `messages`, `notifications`.

## 5. Activer Storage

- Emplacement : **Storage → Commencer**
- Action : activer le bucket par défaut
- Pourquoi : photos de profil (`users/{uid}/profile/`) et pièces jointes futures.

## 6. Déployer les Security Rules

- Fichiers : `/firestore.rules` et `/storage.rules` (racine du dépôt)
- Action :
  ```bash
  npm i -g firebase-tools
  firebase login
  firebase use --add           # sélectionner le projet
  firebase deploy --only firestore:rules,storage
  ```
- Alternative manuelle : **Firestore Database → Règles** et **Storage → Règles**, coller le contenu, publier.
- Pourquoi : sans ces règles, les données sont inaccessibles ou exposées.

## 7. Créer l'index composite

- Fichier : `/firestore.indexes.json`
- Action : `firebase deploy --only firestore:indexes`
- Alternative : au premier chargement de la messagerie, Firestore affiche dans la console du navigateur un lien « create index » — cliquer dessus.
- Pourquoi : la requête `members array-contains uid` + tri `updatedAt desc` exige un index.

## 8. Variables backend (Python)

- Emplacement : **Paramètres du projet → Comptes de service → Générer une nouvelle clé privée**
- Action : enregistrer le JSON dans `backend/serviceAccountKey.json` (déjà ignoré par git), puis copier `.env.example` en `.env` et renseigner :
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - `FIREBASE_PROJECT_ID`
  - `ALLOWED_ORIGINS`
  - `AI_API_KEY` / `AI_API_URL` (plus tard)
- Pourquoi : vérifier les jetons et poser les custom claims de rôle côté serveur.
- ⚠️ Ne jamais committer ce JSON ni le `.env`.

## 9. Premier superadmin

- Action : après ton inscription, récupère ton `uid` dans **Authentication → Users**, puis exécute côté serveur :
  ```python
  from services.firebase_admin_service import set_role
  set_role("TON_UID", "superadmin")
  ```
- Pourquoi : les rôles ne peuvent pas être attribués depuis le navigateur.
