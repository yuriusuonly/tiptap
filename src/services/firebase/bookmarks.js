/**
 * Firestore storage for the signed-in user's bookmarks.
 * Shape: `users/{uid}/bookmarks/{slug}` -> `{bookmarkedAt: serverTimestamp}`.
 * Bookmarks unlocked with a gem are written by the server API route instead;
 * these helpers are for premium/rewarded users toggling bookmarks directly.
 * @module src/services/firebase/bookmarks
 */
import {isTestMode} from "../../constants/configuration";

// eslint-disable-next-line no-undef
function mockBookmarks() {
  return require("../../../test/services/firebase/bookmarks");
}

// eslint-disable-next-line no-undef
function firestoreSdk() {
  return require("@react-native-firebase/firestore");
}

function db() {
  return firestoreSdk().getFirestore();
}

function collectionFor(uid) {
  return collection(db(), "users", uid, "bookmarks");
}

export async function getBookmarks(uid) {
  if (isTestMode) return mockBookmarks().getBookmarks(uid);
  const {collection, getDocs} = firestoreSdk();
  const snapshot = await getDocs(collectionFor(uid));
  return snapshot.docs.map((doc) => doc.id);
}

export async function addBookmark(uid, slug) {
  if (!uid || !slug) return;
  if (isTestMode) return mockBookmarks().addBookmark(uid, slug);
  const {doc, serverTimestamp, setDoc} = firestoreSdk();
  await setDoc(doc(collectionFor(uid), slug), {bookmarkedAt: serverTimestamp()});
}

export async function removeBookmark(uid, slug) {
  if (!uid || !slug) return;
  if (isTestMode) return mockBookmarks().removeBookmark(uid, slug);
  const {deleteDoc, doc} = firestoreSdk();
  await deleteDoc(doc(collectionFor(uid), slug));
}

/** Delete every bookmark in bounded batches during account deletion. */
export async function deleteBookmarks(uid) {
  if (isTestMode) return mockBookmarks().deleteBookmarks(uid);
  const {batch, getDocs, limit, query} = firestoreSdk();
  for (;;) {
    const snapshot = await getDocs(query(collectionFor(uid), limit(500)));
    if (snapshot.empty) break;
    const operation = batch(db());
    snapshot.docs.forEach((doc) => operation.delete(doc.ref));
    await operation.commit();
  }
}
