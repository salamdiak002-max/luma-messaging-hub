// Nom : conversations.js | Chemin : /public/luma/js/conversations.js
// Rôle : recherche d'utilisateurs, création/liste des conversations privées, compteurs non lus.
import {
  db, collection, doc, getDoc, getDocs, setDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
} from "./firebase.js";

export const convId = (a, b) => [a, b].sort().join("_");

export async function searchUsers(term, myUid) {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return [];
  const snap = await getDocs(
    query(collection(db, "users"), where("username", ">=", t), where("username", "<=", t + "\uf8ff"), limit(8))
  );
  return snap.docs.map((d) => d.data()).filter((u) => u.uid !== myUid);
}

export async function openConversation(me, peer) {
  const id = convId(me.uid, peer.uid);
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      members: [me.uid, peer.uid].sort(),
      memberInfo: {
        [me.uid]: { displayName: me.displayName || "", username: me.username || "", photoURL: me.photoURL || "" },
        [peer.uid]: { displayName: peer.displayName || "", username: peer.username || "", photoURL: peer.photoURL || "" },
      },
      lastMessage: "",
      lastSenderId: "",
      unread: { [me.uid]: 0, [peer.uid]: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

export function listenConversations(uid, cb) {
  return onSnapshot(
    query(collection(db, "conversations"), where("members", "array-contains", uid), orderBy("updatedAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export async function markRead(id, uid) {
  await updateDoc(doc(db, "conversations", id), { [`unread.${uid}`]: 0 });
}
