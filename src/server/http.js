/**
 * Shared HTTP helpers for `+api.js` routes: consistent JSON responses, permissive
 * CORS (including OPTIONS preflight), bearer-token auth and bounded body parsing.
 *
 * Routes always parse the body defensively and derive the user identity from a
 * verified Firebase ID token. All state-changing writes are server-authoritative:
 * clients may only request an action, never supply values such as `premium` or a
 * new gem balance.
 * @module server/http
 */
import { verifyFirebaseIdToken } from './google-auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-admob-secret',
  'Access-Control-Max-Age': '86400',
};

/** Build a JSON response with CORS headers. Success payloads are plain objects. */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

/** Build a consistent `{error: string}` JSON response. */
export function fail(status, message) {
  return json({ error: message }, status);
}

/** Answer a CORS preflight request. */
export function corsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Wrap a route handler so thrown `Response`s (auth/validation failures) become
 * normal responses and unexpected errors never leak details or become unhandled.
 * @param {() => Promise<Response>|Response} handler
 */
export async function handle(handler) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(500, 'Internal server error');
  }
}

/** Extract the token from `Authorization: Bearer <token>`, or null. */
export function readBearer(request) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/**
 * Parse a small JSON object body with a hard size limit. Throws a 400/413
 * `Response` for invalid input.
 * @param {Request} request
 * @param {{maxBytes?: number}} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function readJsonBody(request, { maxBytes = 16 * 1024 } = {}) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw fail(413, 'Request body too large');
  }
  if (!request.body) return {};

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value?.byteLength ?? value?.length ?? 0;
    if (total > maxBytes) {
      await reader.cancel();
      throw fail(413, 'Request body too large');
    }
    chunks.push(value);
  }
  reader.releaseLock?.();

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk?.byteLength ?? chunk?.length ?? 0;
  }
  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) return {};

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw fail(400, 'Invalid JSON body');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw fail(400, 'Invalid JSON body');
  }
  return parsed;
}

/**
 * Authenticate a request and return the Firebase UID from the verified token.
 * @throws {Response} a 401 Response when the bearer token is absent or invalid.
 */
export async function requireUid(request) {
  const token = readBearer(request);
  if (!token) throw fail(401, 'Missing bearer token');
  const uid = await verifyFirebaseIdToken(token);
  if (!uid) throw fail(401, 'Invalid or expired bearer token');
  return uid;
}
