// Nom : firebase.js | Chemin : /public/luma/js/firebase.js
// Rôle : initialisation unique du SDK Firebase (Auth, Firestore, Storage).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { firebaseConfig, isConfigured } from "./firebase-config.js";

if (!isConfigured) {
  console.warn("[LUMA] Firebase non configuré : renseigne js/firebase-config.js");
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // prêt pour les pièces jointes (v2)
export { isConfigured };

export * from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
export * from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
