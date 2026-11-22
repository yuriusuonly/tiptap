/**
 * Minimal Firestore REST v1 client for API routes. Uses the server access token
 * so writes bypass client security rules: only trusted route code can call it.
 *
 * Write descriptors accepted by `commitWrites`:
 *   {type: 'set',    path, fields, precondition?}
 *   {type: 'update', path, fields, updateMaskFields?, fieldTransforms?, precondition?}
 *   {type: 'create', path, fields, ...}      // implicit currentDocument.exists=false
 *   {type: 'delete', path, precondition?}
 * `fieldTransforms` maps a field path to a transform, e.g.
 *   {gems: {increment: {integerValue: 1}}}.
 * @module server/firestore
 */
import { FIRESTORE_SCOPE, getGoogleAccessToken } from './google-auth.js';
import { getServerConfig } from './config.js';

const API_ROOT = 'https://firestore.googleapis.com/v1';

/** Error carrying the HTTP status and Firestore status code for callers. */
export class FirestoreError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'FirestoreError';
    this.status = status;
    this.code = code;
  }
}

function documentsBase() {
  const { serviceAccount } = getServerConfig();
  // `(default)` must stay literal: it is Firestore's default database segment.
  return `${API_ROOT}/projects/${encodeURIComponent(serviceAccount.projectId)}/databases/(default)/documents`;
}

function documentName(path) {
  return `${documentsBase()}/${String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/')}`;
}

function documentUrl(path) {
  return `${API_ROOT}/${documentName(path)}`;
}

/** Convert plain JS values into Firestore REST `Value` objects. */
function toValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFields(value) } };
  return { stringValue: String(value) };
}

function toFields(values) {
  const fields = {};
  for (const [key, value] of Object.entries(values || {})) {
    if (value !== undefined) fields[key] = toValue(value);
  }
  return fields;
}

function fromValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue);
  if ('mapValue' in value) return fromFields(value.mapValue?.fields);
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('bytesValue' in value) return value.bytesValue;
  return null;
}

function fromFields(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields || {})) result[key] = fromValue(value);
  return result;
}

/** Authenticated Firestore REST request. Throws on non-2xx with parsed details. */
async function request(url, init) {
  const token = await getGoogleAccessToken([FIRESTORE_SCOPE]);
  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(`Firestore request failed: ${error?.message || 'network error'}`);
  }
  if (!response.ok) {
    let code = null;
    let message = '';
    try {
      const payload = await response.json();
      code = payload?.error?.status || null;
      message = payload?.error?.message || payload?.message || '';
    } catch {
      // Non-JSON error bodies are still surfaced with their HTTP status.
    }
    const suffix = message ? `: ${String(message).slice(0, 300)}` : '';
    throw new FirestoreError(
      response.status,
      code,
      `Firestore request failed (${response.status}${code ? ` ${code}` : ''})${suffix}`
    );
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

/**
 * Read a document as a plain object. Returns null when the document is missing.
 * @param {string} path e.g. `users/{uid}`.
 */
export async function getDocument(path) {
  try {
    const data = await request(documentUrl(path), { method: 'GET' });
    return fromFields(data.fields);
  } catch (error) {
    if (error instanceof FirestoreError && (error.status === 404 || error.code === 'NOT_FOUND')) {
      return null;
    }
    throw error;
  }
}

/**
 * List every document in a collection as plain objects with their document id.
 * @param {string} path e.g. `users/{uid}/bookmarks`.
 */
export async function listCollection(path) {
  const url = `${documentsBase()}/${String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/')}`;
  const data = await request(url, { method: 'GET' });
  return (data.documents || []).map((doc) => ({
    id: String(doc.name || '').split('/').pop(),
    ...fromFields(doc.fields),
  }));
}

/**
 * Patch selected fields of a document. When `updateMaskFields` is omitted all
 * keys of `fields` are used as the mask, leaving unrelated data untouched.
 * @param {string} path
 * @param {Object} fields
 * @param {string[]} [updateMaskFields]
 */
export async function updateDocument(path, fields, updateMaskFields) {
  const params = new URLSearchParams();
  for (const name of updateMaskFields || Object.keys(fields || {})) {
    params.append('updateMask.fieldPaths', name);
  }
  const query = params.toString();
  return request(`${documentUrl(path)}${query ? `?${query}` : ''}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: toFields(fields) }),
  });
}

/** Translate a server-side write descriptor into a Firestore REST `Write`. */
function toRestWrite(write) {
  const { type = 'update', path, fields, updateMaskFields, fieldTransforms, precondition } = write || {};
  if (typeof path !== 'string' || !path) throw new Error('Firestore write requires a path');
  const name = documentName(path);
  const currentDocument = precondition || (type === 'create' ? { exists: false } : undefined);

  if (type === 'delete') {
    return { delete: name, ...(currentDocument ? { currentDocument } : {}) };
  }
  if (!['set', 'update', 'create'].includes(type)) {
    throw new Error(`Unsupported Firestore write type: ${type}`);
  }

  const valueFields = toFields(fields);
  const writeBody = { update: { name, fields: valueFields } };

  // A `set` with no mask intentionally replaces the document; update/create
  // always mask so unrelated fields survive. If only transforms were supplied,
  // mask their paths so an empty `update` cannot erase the document.
  const transformEntries = Object.entries(fieldTransforms || {});
  let mask = updateMaskFields || (type === 'set' ? null : Object.keys(valueFields));
  if ((!mask || mask.length === 0) && transformEntries.length) {
    mask = transformEntries.map(([fieldPath]) => fieldPath);
  }
  if (mask && mask.length) writeBody.updateMask = { fieldPaths: mask };

  const transforms = [];
  for (const [fieldPath, transform] of transformEntries) {
    const [operation, rawValue] = Object.entries(transform || {})[0] || [];
    if (!operation) continue;
    // REST int64 values are strings; accept numeric descriptors from callers,
    // including nested `{increment: {integerValue: n}}` transforms.
    const value = rawValue && typeof rawValue === 'object'
      ? Object.fromEntries(Object.entries(rawValue).map(([key, inner]) => [
          key,
          key === 'integerValue' && typeof inner === 'number' ? String(inner) : inner,
        ]))
      : operation === 'integerValue' && typeof rawValue === 'number'
        ? String(rawValue)
        : rawValue;
    transforms.push({ fieldPath, [operation]: value });
  }
  if (transforms.length) writeBody.updateTransforms = transforms;
  if (currentDocument) writeBody.currentDocument = currentDocument;
  return writeBody;
}

/**
 * Commit several writes atomically (one Firestore transaction). Used for
 * counters and idempotency records so concurrent callbacks cannot double-credit.
 * @param {Object[]} writes
 */
export async function commitWrites(writes) {
  if (!Array.isArray(writes) || writes.length === 0) {
    throw new Error('commitWrites requires at least one write');
  }
  return request(`${documentsBase()}:commit`, {
    method: 'POST',
    body: JSON.stringify({ writes: writes.map(toRestWrite) }),
  });
}
