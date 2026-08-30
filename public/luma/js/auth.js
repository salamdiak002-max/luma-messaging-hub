// Nom : auth.js | Chemin : /public/luma/js/auth.js
// Rôle : inscription, connexion, réinitialisation du mot de passe, session.
import {
  auth, db, isConfigured,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  updateProfile, onAuthStateChanged,
  doc, setDoc, getDocs, query, collection, where, limit, serverTimestamp,
} from "./firebase.js";
import "./app.js";

const msgEl = document.getElementById("msg");
const show = (text, isError = false) => {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.classList.toggle("error", isError);
};

const errors = {
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/invalid-email": "Adresse email invalide.",
  "auth/email-already-in-use": "Cet email est déjà utilisé.",
  "auth/weak-password": "Mot de passe trop court (6 caractères minimum).",
  "auth/too-many-requests": "Trop de tentatives, réessaie plus tard.",
};
const readable = (e) => errors[e.code] || e.message;

if (!isConfigured) show("Firebase n'est pas configuré (js/firebase-config.js).", true);

// Si déjà connecté, aller directement à la messagerie.
if (isConfigured) {
  onAuthStateChanged(auth, (u) => {
    if (u) location.replace("./messages.html");
  });
}

const registerForm = document.getElementById("register-form");
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const displayName = registerForm.displayName.value.trim();
  const username = registerForm.username.value.trim().toLowerCase();
  const email = registerForm.email.value.trim();
  const password = registerForm.password.value;
  show("Création du compte…");
  try {
    const taken = await getDocs(query(collection(db, "users"), where("username", "==", username), limit(1)));
    if (!taken.empty) return show("Ce nom d'utilisateur est déjà pris.", true);

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName,
      username,
      email,
      photoURL: "",
      role: "user",
      createdAt: serverTimestamp(),
    });
    location.replace("./messages.html");
  } catch (err) {
    show(readable(err), true);
  }
});

const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  show("Connexion…");
  try {
    await signInWithEmailAndPassword(auth, loginForm.email.value.trim(), loginForm.password.value);
    location.replace("./messages.html");
  } catch (err) {
    show(readable(err), true);
  }
});

document.getElementById("reset-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  if (!email) return show("Saisis d'abord ton email.", true);
  try {
    await sendPasswordResetEmail(auth, email);
    show("Email de réinitialisation envoyé.");
  } catch (err) {
    show(readable(err), true);
  }
});
