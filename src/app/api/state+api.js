/**
 * GET /api/state — read the signed-in user's server-side state.
 *
 * Auth: Firebase ID token in `Authorization: Bearer <token>`. The UID comes from
 * Identity Toolkit verification, never from the request body or query string.
 * Response: `{premium, gems, bookmarks, streak, themeMode}`. Missing or legacy
 * field shapes are tolerated so older accounts keep working.
 * @module app/api/state+api
 */
import { getDocument, listCollection } from '../../server/firestore.js';
import { corsResponse, fail, handle, json, requireUid } from '../../server/http.js';

/** Normalize both current and legacy streak shapes into a plain object. */
function normalizeStreak(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return { count: raw, lastUpdated: null };
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;
  const count = raw.count ?? raw.current ?? raw.currentStreak ?? raw.days ?? raw.streak;
  const lastUpdated = raw.lastUpdated ?? raw.lastActiveDate ?? raw.lastDate ?? raw.updatedAt ?? null;
  return {
    ...raw,
    count: Number.isFinite(Number(count)) ? Number(count) : 0,
    lastUpdated: typeof lastUpdated === 'string' ? lastUpdated : null,
  };
}

export async function GET(request) {
  return handle(async () => {
    if (request.method === 'OPTIONS') return corsResponse();
    if (request.method !== 'GET') return fail(405, 'Method not allowed');

    const uid = await requireUid(request);
    const doc = (await getDocument(`users/${uid}`)) || {};
    // Bookmarks are stored as a subcollection (one document per fact slug),
    // written by both the client and the server-side gem spend route.
    const bookmarkDocs = await listCollection(`users/${uid}/bookmarks`);
    const bookmarks = bookmarkDocs
      .map((item) => item.id)
      .filter((item) => typeof item === 'string' && item);

    return json({
      premium: doc.premium === true,
      gems: Number.isFinite(doc.gems) ? Math.max(0, Math.floor(doc.gems)) : 0,
      bookmarks,
      streak: normalizeStreak(doc.streak),
      themeMode: typeof doc.themeMode === 'string' ? doc.themeMode : null,
    });
  });
}

export function OPTIONS() {
  return corsResponse();
}
