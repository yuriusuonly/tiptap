/**
 * POST /api/premium/verify — verify a Play subscription and sync the entitlement.
 *
 * Auth: Firebase ID token in `Authorization: Bearer <token>`; the UID is derived
 * from the verified token. Body: `{purchaseToken: string}` — a client-sent
 * `premium` value is deliberately ignored. Response: `{premium, expiresAt}`.
 *
 * The `premium` flag is server-authoritative: it is written only after Google
 * Play confirms an active premium subscription, and only that field is patched
 * (via updateMask) so unrelated user data is never clobbered.
 * @module app/api/premium/verify+api
 */
import { getDocument, updateDocument } from '../../../server/firestore.js';
import { corsResponse, fail, handle, json, readJsonBody, requireUid } from '../../../server/http.js';
import { verifyPremiumPurchase } from '../../../server/play.js';

export async function POST(request) {
  return handle(async () => {
    if (request.method === 'OPTIONS') return corsResponse();
    if (request.method !== 'POST') return fail(405, 'Method not allowed');

    const uid = await requireUid(request);
    const body = await readJsonBody(request);
    const purchaseToken = typeof body.purchaseToken === 'string' ? body.purchaseToken.trim() : '';
    if (!purchaseToken) return fail(400, 'Missing purchaseToken');

    const result = await verifyPremiumPurchase(purchaseToken);
    if (result.active) {
      await updateDocument(`users/${uid}`, { premium: true }, ['premium']);
      return json({ premium: true, expiresAt: result.expiresAt });
    }

    // Only revoke a previously granted entitlement; do not write `false` over
    // an existing/unknown value or create a document just to store false.
    const current = await getDocument(`users/${uid}`);
    if (current?.premium === true) {
      await updateDocument(`users/${uid}`, { premium: false }, ['premium']);
    }
    return json({ premium: false, expiresAt: result.expiresAt });
  });
}

export function OPTIONS() {
  return corsResponse();
}
