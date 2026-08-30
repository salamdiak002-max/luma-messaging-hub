// Nom : settings.js | Chemin : /public/luma/js/settings.js
// Rôle : thème clair/sombre, informations de compte, déconnexion.
import { auth, signOut } from "./firebase.js";
import { requireAuth, toggleTheme } from "./app.js";

const { user } = await requireAuth();
document.getElementById("email").textContent = user.email;
document.getElementById("theme-toggle").onclick = () => toggleTheme();
document.getElementById("logout").onclick = async () => {
  await signOut(auth);
  location.replace("./login.html");
};
