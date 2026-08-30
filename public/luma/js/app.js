// Nom : app.js | Chemin : /public/luma/js/app.js
// Rôle : utilitaires partagés (thème, garde de session, formatage, avatars).
import { auth, db, onAuthStateChanged, doc, getDoc, isConfigured } from "./firebase.js";

export function applyTheme() {
  const t = localStorage.getItem("luma-theme") || "dark";
  document.documentElement.dataset.theme = t;
  return t;
}
export function toggleTheme() {
  const next = (localStorage.getItem("luma-theme") || "dark") === "dark" ? "light" : "dark";
  localStorage.setItem("luma-theme", next);
  applyTheme();
  return next;
}
applyTheme();

export function avatarUrl(user) {
  if (user?.photoURL) return user.photoURL;
  const name = encodeURIComponent(user?.displayName || user?.username || "LUMA");
  return `https://ui-avatars.com/api/?background=16222c&color=2fd3b5&name=${name}`;
}

export function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}
export function formatFull(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// Protection des pages privées : résout avec { user, profile } ou redirige.
export function requireAuth() {
  return new Promise((resolve) => {
    if (!isConfigured) {
      document.body.innerHTML =
        '<main style="padding:12vh 6vw;text-align:center"><h1>Configuration Firebase requise</h1>' +
        "<p>Renseigne <code>js/firebase-config.js</code> avec la config de ton projet Firebase.</p></main>";
      return;
    }
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.replace("./login.html");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      resolve({ user, profile: { uid: user.uid, ...(snap.data() || {}) } });
    });
  });
}

export function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
