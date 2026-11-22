/**
 * POST /api/gems/spend — spend one gem to bookmark a fact.
 *
 * Auth: Firebase ID token in `Authorization: Bearer <token>` (UID is verified).
 * Body: `{factTitle: string}`. Response: `{gems, slug}`; 402 with
 * `{error: 'Not enough gems'}` when the balance is below one.
 *
 * Server-authoritative: the client chooses only the fact title. The server
 * derives the document ID from a slug, checks the balance, and commits the
 * atomic `gems -= 1` transform together with the bookmark write, so a failed
 * bookmark never leaves an unmatched charge (and vice versa).
 * @module app/api/gems/spend+api
 */
import { commitWrites, FirestoreError, getDocument } from '../../../server/firestore.js';
import { corsResponse, fail, handle, json, readJsonBody, requireUid } from '../../../server/http.js';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function gemCount(doc) {
  return Number.isFinite(doc?.gems) ? Math.max(0, Math.floor(doc.gems)) : 0;
}

export async function POST(request) {
  return handle(async () => {
    if (request.method === 'OPTIONS') return corsResponse();
    if (request.method !== 'POST') return fail(405, 'Method not allowed');

    const uid = await requireUid(request);
    const body = await readJsonBody(request);
    const factTitle = typeof body.factTitle === 'string' ? body.factTitle.trim() : '';
    if (!factTitle) return fail(400, 'Missing factTitle');
    const slug = slugify(factTitle);
    if (!slug) return fail(400, 'Invalid factTitle');

    const userPath = `users/${uid}`;
    const current = await getDocument(userPath);
    if (gemCount(current) < 1) return fail(402, 'Not enough gems');

    try {
      await commitWrites([
        {
          type: 'update',
          path: userPath,
          fields: { gems: 0 }, // seed if absent; masked so other fields survive
          updateMaskFields: ['gems'],
          fieldTransforms: { gems: { increment: { integerValue: -1 } } },
        },
        {
          type: 'create',
          path: `${userPath}/bookmarks/${slug}`,
          fields: { bookmarkedAt: new Date().toISOString(), factTitle },
        },
      ]);
    } catch (error) {
      if (error instanceof FirestoreError && error.code === 'ALREADY_EXISTS') {
        return fail(409, 'Fact already bookmarked');
      }
      throw error;
    }

    return json({ gems: gemCount(await getDocument(userPath)), slug });
  });
}

export function OPTIONS() {
  return corsResponse();
}
