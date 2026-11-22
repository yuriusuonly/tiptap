/**
 * POST /api/gems/reward — AdMob server-to-server (S2S) reward callback.
 *
 * Configure the rewarded ad in AdMob with THIS URL as its S2S callback and set
 * the reward amount to 1. AdMob sends `x-admob-secret` (compare with
 * ADMOB_S2S_SECRET) and fields `transaction_id`/`user_id`/`reward_amount`
 * (camelCase aliases are also accepted). Response: `{gems}`.
 *
 * Server-authoritative: no Firebase token is required here (AdMob is the caller),
 * so the UID must come from the signed callback. The transaction ID is written
 * with `currentDocument.exists=false` in the SAME commit as the counter increment
 * — a replay fails with ALREADY_EXISTS and credits nothing. The increment itself
 * is a Firestore field transform, so concurrent callbacks cannot overwrite each
 * other, and the client never supplies a gem balance.
 * @module app/api/gems/reward+api
 */
import { Buffer } from 'node:buffer';
import { timingSafeEqual } from 'node:crypto';

import { getServerConfig } from '../../../server/config.js';
import { commitWrites, FirestoreError, getDocument } from '../../../server/firestore.js';
import { corsResponse, fail, handle, json, readJsonBody } from '../../../server/http.js';

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function secretMatches(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || !expected) return false;
  const received = Buffer.from(provided);
  const secret = Buffer.from(expected);
  return received.length === secret.length && timingSafeEqual(received, secret);
}

function gemCount(doc) {
  return Number.isFinite(doc?.gems) ? Math.max(0, Math.floor(doc.gems)) : 0;
}

function isAlreadyExists(error) {
  return error instanceof FirestoreError &&
    (error.code === 'ALREADY_EXISTS' || error.status === 409);
}

export async function POST(request) {
  return handle(async () => {
    if (request.method === 'OPTIONS') return corsResponse();
    if (request.method !== 'POST') return fail(405, 'Method not allowed');

    const { admobS2sSecret } = getServerConfig();
    if (!admobS2sSecret) return fail(500, 'AdMob callback is not configured');
    if (!secretMatches(request.headers.get('x-admob-secret'), admobS2sSecret)) {
      return fail(401, 'Invalid secret');
    }

    const body = await readJsonBody(request);
    const uid = firstString(body.user_id, body.userId);
    const transactionId = firstString(body.transaction_id, body.transactionId);
    const rawAmount = body.reward_amount ?? body.rewardAmount;
    const amount = Number(rawAmount);
    if (!uid) return fail(400, 'Missing user_id');
    if (!transactionId) return fail(400, 'Missing transaction_id');
    if (!Number.isInteger(amount) || amount < 1 || amount > 10) {
      return fail(400, 'Invalid reward_amount');
    }

    const userPath = `users/${uid}`;
    const now = new Date().toISOString();
    try {
      await commitWrites([
        {
          type: 'create',
          path: `${userPath}/rewardCallbacks/${transactionId}`,
          fields: {
            createdAt: now,
            rewardAmount: amount,
            rewardItem: firstString(body.reward_item, body.rewardItem),
            adUnitId: firstString(body.ad_unit_id, body.adUnitId),
          },
        },
        {
          type: 'update',
          path: userPath,
          fields: { gems: 0 }, // seed the field if this is a brand-new user doc
          updateMaskFields: ['gems'],
          fieldTransforms: { gems: { increment: { integerValue: amount } } },
        },
      ]);
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;
      // Replay: the callback was already credited. Return the current balance.
      return json({ gems: gemCount(await getDocument(userPath)) });
    }

    return json({ gems: gemCount(await getDocument(userPath)) });
  });
}

export function OPTIONS() {
  return corsResponse();
}
