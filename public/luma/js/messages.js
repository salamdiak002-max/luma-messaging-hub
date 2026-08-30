// Nom : messages.js | Chemin : /public/luma/js/messages.js
// Rôle : interface de messagerie — liste des conversations, messages temps réel, envoi, lus/non lus.
import {
  auth, db, signOut, collection, addDoc, doc, updateDoc,
  query, orderBy, onSnapshot, serverTimestamp, increment,
} from "./firebase.js";
import { requireAuth, avatarUrl, formatTime, formatFull, escapeHtml } from "./app.js";
import { searchUsers, openConversation, listenConversations, markRead } from "./conversations.js";

const el = (id) => document.getElementById(id);
const appEl = el("app");
let me, current = null, unsubMessages = null;

const { profile } = await requireAuth();
me = profile;
el("me-avatar").src = avatarUrl(me);
appEl.hidden = false;

/* ---------- Recherche d'utilisateurs ---------- */
let searchTimer;
el("search-input").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const term = e.target.value;
  searchTimer = setTimeout(async () => {
    const users = await searchUsers(term, me.uid);
    const list = el("search-results");
    list.innerHTML = users
      .map((u) => `<li data-uid="${u.uid}">${escapeHtml(u.displayName)} <span class="muted">@${escapeHtml(u.username)}</span></li>`)
      .join("");
    list.querySelectorAll("li").forEach((li) => {
      li.onclick = async () => {
        const peer = users.find((u) => u.uid === li.dataset.uid);
        const id = await openConversation(me, peer);
        list.innerHTML = "";
        el("search-input").value = "";
        selectConversation(id, peer);
      };
    });
  }, 250);
});

/* ---------- Liste des conversations ---------- */
listenConversations(me.uid, (convs) => {
  const list = el("conv-list");
  if (!convs.length) {
    list.innerHTML = '<li class="muted" style="padding:1rem">Aucune conversation. Recherche un utilisateur pour commencer.</li>';
    return;
  }
  list.innerHTML = convs
    .map((c) => {
      const peerId = c.members.find((m) => m !== me.uid);
      const p = c.memberInfo?.[peerId] || {};
      const unread = c.unread?.[me.uid] || 0;
      return `<li class="conv ${current === c.id ? "active" : ""}" data-id="${c.id}" data-peer="${peerId}">
        <img src="${avatarUrl(p)}" alt="" />
        <div class="conv-body"><b>${escapeHtml(p.displayName || "Utilisateur")}</b>
          <span>${escapeHtml(c.lastMessage || "Nouvelle conversation")}</span></div>
        <div class="conv-meta">${formatTime(c.updatedAt)}${unread ? `<br><span class="badge">${unread}</span>` : ""}</div>
      </li>`;
    })
    .join("");
  list.querySelectorAll(".conv").forEach((li) => {
    li.onclick = () => {
      const c = convs.find((x) => x.id === li.dataset.id);
      selectConversation(c.id, c.memberInfo?.[li.dataset.peer] || {});
    };
  });
});

/* ---------- Conversation active ---------- */
function selectConversation(id, peer) {
  current = id;
  appEl.classList.add("chat-open");
  el("peer-avatar").src = avatarUrl(peer);
  el("peer-name").textContent = peer.displayName || "Utilisateur";
  el("peer-username").textContent = peer.username ? "@" + peer.username : "";
  el("composer").hidden = false;
  document.querySelectorAll(".conv").forEach((n) => n.classList.toggle("active", n.dataset.id === id));

  unsubMessages?.();
  const box = el("messages");
  box.innerHTML = "";
  unsubMessages = onSnapshot(
    query(collection(db, "conversations", id, "messages"), orderBy("createdAt", "asc")),
    (snap) => {
      box.innerHTML = snap.docs
        .map((d) => {
          const m = d.data();
          const mine = m.senderId === me.uid;
          return `<div class="bubble ${mine ? "me" : ""}">${escapeHtml(m.text)}
            <time title="${formatFull(m.createdAt)}">${formatTime(m.createdAt)}</time></div>`;
        })
        .join("");
      box.scrollTop = box.scrollHeight;
      markRead(id, me.uid).catch(() => {});
    }
  );
  markRead(id, me.uid).catch(() => {});
}

/* ---------- Envoi ---------- */
el("composer").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = el("message-input");
  const text = input.value.trim();
  if (!text || !current) return;
  input.value = "";
  const peerId = current.split("_").find((u) => u !== me.uid);
  await addDoc(collection(db, "conversations", current, "messages"), {
    text,
    senderId: me.uid,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "conversations", current), {
    lastMessage: text,
    lastSenderId: me.uid,
    updatedAt: serverTimestamp(),
    [`unread.${peerId}`]: increment(1),
  });
});

el("back").onclick = () => appEl.classList.remove("chat-open");
el("logout").onclick = async () => {
  await signOut(auth);
  location.replace("./login.html");
};
