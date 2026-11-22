/**
 * Daily streak tracking (mirrors the Flutter implementation).
 * Shape: `users/{uid}.streak` -> `{count:number, last_activity:string|null}`.
 * Day boundaries use UTC so device timezone changes cannot extend a streak.
 * @module src/services/firebase/streak
 */
import {isTestMode} from "../../constants/configuration";

// eslint-disable-next-line no-undef
function mockStreak() {
  return require("../../../test/services/firebase/streak");
}

// eslint-disable-next-line no-undef
function firestoreSdk() {
  return require("@react-native-firebase/firestore");
}

function db() {
  return firestoreSdk().getFirestore();
}

export const EMPTY_STREAK = Object.freeze({count: 0, last_activity: null});

export function normalizeStreak(raw) {
  if (typeof raw === "number") {
    return {count: Math.max(0, Math.floor(raw)), last_activity: null};
  }
  if (raw && typeof raw === "object") {
    const count = typeof raw.count === "number" ? raw.count : 0;
    const last = typeof raw.last_activity === "string" ? raw.last_activity : null;
    return {count: Math.max(0, Math.floor(count)), last_activity: last};
  }
  return {...EMPTY_STREAK};
}

/** Compute the next streak without mutating the input. */
export function nextStreak(current, now = new Date()) {
  const streak = normalizeStreak(current);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let last = null;
  if (streak.last_activity) {
    const parsed = new Date(streak.last_activity);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() <= now.getTime()) last = parsed;
  }
  let count = 1;
  if (last) {
    const lastDay = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    const difference = Math.round((today - lastDay) / 86400000);
    if (difference === 1) count = streak.count + 1;
    else if (difference < 0 || difference > 1) count = 1;
    else count = streak.count;
  }
  return {count, last_activity: now.toISOString()};
}

export async function getStreak(uid) {
  if (isTestMode) return mockStreak().getStreak(uid);
  const {doc, getDoc} = firestoreSdk();
  const snapshot = await getDoc(doc(db(), "users", uid));
  return snapshot.exists()
    ? normalizeStreak(snapshot.data()?.streak)
    : {...EMPTY_STREAK};
}

export async function setStreak(uid, streak) {
  if (!uid) return;
  const normalized = normalizeStreak(streak);
  if (isTestMode) return mockStreak().setStreak(uid, normalized);
  const {doc, setDoc} = firestoreSdk();
  await setDoc(doc(db(), "users", uid), {streak: normalized}, {merge: true});
}
