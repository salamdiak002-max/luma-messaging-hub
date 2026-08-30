// Nom : profile.js | Chemin : /public/luma/js/profile.js
// Rôle : affichage et modification du profil utilisateur (nom, username, photo).
import { auth, db, doc, updateDoc, getDocs, query, collection, where, limit, updateProfile } from "./firebase.js";
import { requireAuth, avatarUrl } from "./app.js";

const { user, profile } = await requireAuth();
const el = (id) => document.getElementById(id);
const msg = el("msg");

el("email").textContent = user.email;
el("avatar").src = avatarUrl(profile);
el("displayName").value = profile.displayName || "";
el("username").value = profile.username || "";
el("photoURL").value = profile.photoURL || "";

el("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const displayName = el("displayName").value.trim();
  const username = el("username").value.trim().toLowerCase();
  const photoURL = el("photoURL").value.trim();
  msg.classList.remove("error");
  msg.textContent = "Enregistrement…";
  try {
    if (username !== profile.username) {
      const taken = await getDocs(query(collection(db, "users"), where("username", "==", username), limit(1)));
      if (!taken.empty) {
        msg.textContent = "Ce nom d'utilisateur est déjà pris.";
        msg.classList.add("error");
        return;
      }
    }
    await updateDoc(doc(db, "users", user.uid), { displayName, username, photoURL });
    await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
    el("avatar").src = avatarUrl({ displayName, photoURL });
    msg.textContent = "Profil mis à jour.";
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
});
