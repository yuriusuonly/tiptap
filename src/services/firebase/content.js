/**
 * Firestore reader for the centralized AI-generated `content` collection.
 * Content is public and read-only in the security rules. The feed mirrors the
 * Flutter app: a random document-id token with wrap-around, a bounded batch,
 * shuffling, and de-duplication by title.
 *
 * The Firestore module is loaded lazily so importing this file during static
 * web rendering never touches native modules.
 * @module src/services/firebase/content
 */
import {isTestMode} from "../../constants/configuration";

// eslint-disable-next-line no-undef
function mockContent() {
  return require("../../../test/services/firebase/content");
}

// eslint-disable-next-line no-undef
function firestoreSdk() {
  return require("@react-native-firebase/firestore");
}

function db() {
  return firestoreSdk().getFirestore();
}

export function slugify(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    {length: 2},
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function toFact(snapshot) {
  const data = snapshot.data() ?? {};
  return {
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    summary: String(data.summary ?? ""),
    slug: snapshot.id || slugify(data.title),
  };
}

/**
 * Fetch one randomized batch of facts, wrapping around when the token is past
 * the last document.
 * @param {{limit?: number, skipTitles?: string[]}} options
 * @returns {Promise<Array<{title: string, body: string, summary: string, slug: string}>>}
 */
export async function fetchFeed({limit = 5, skipTitles = []} = {}) {
  if (isTestMode) return mockContent().fetchFeed({limit, skipTitles});
  const {collection, documentId, getDocs, limit: firestoreLimit, query, where} =
    firestoreSdk();
  const content = collection(db(), "content");
  const token = randomToken();
  let snapshot = await getDocs(
    query(content, where(documentId(), ">=", token), firestoreLimit(limit))
  );
  let docs = snapshot.docs;
  if (docs.length < limit) {
    const wrap = await getDocs(query(content, firestoreLimit(limit - docs.length)));
    const ids = new Set(docs.map((doc) => doc.id));
    docs = [...docs, ...wrap.docs.filter((doc) => !ids.has(doc.id))];
  }
  const skip = new Set(skipTitles);
  return shuffle(docs.map(toFact).filter((fact) => fact.title && !skip.has(fact.title)));
}

/**
 * Fetch bookmarked facts by their slugs. Individual failures are isolated so
 * one missing document cannot blank the whole grid.
 * @param {string[]} slugs
 */
export async function fetchFactsBySlugs(slugs) {
  if (!slugs.length) return [];
  if (isTestMode) return mockContent().fetchFactsBySlugs(slugs);
  const {doc, getDoc} = firestoreSdk();
  const results = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const snapshot = await getDoc(doc(db(), "content", slug));
        return snapshot.exists() ? toFact(snapshot) : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
