// Nom : firebase-config.js | Chemin : /public/luma/js/firebase-config.js
// Rôle : configuration publique Firebase (clés web, non secrètes).
// Remplace ces valeurs par celles de ta console Firebase :
// Firebase Console → Paramètres du projet → Vos applications → Application Web → Config SDK
export const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJET",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxx",
};

export const isConfigured = !firebaseConfig.apiKey.startsWith("VOTRE_");
