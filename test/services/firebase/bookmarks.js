/** Test-mode bookmark store. @module test/services/firebase/bookmarks */

const stores = new Map();

function storeFor(uid) {
  if (!stores.has(uid)) stores.set(uid, new Set());
  return stores.get(uid);
}

export async function getBookmarks(uid) {
  return [...storeFor(uid)];
}

export async function addBookmark(uid, slug) {
  storeFor(uid).add(slug);
}

export async function removeBookmark(uid, slug) {
  storeFor(uid).delete(slug);
}

export async function deleteBookmarks(uid) {
  stores.delete(uid);
}
