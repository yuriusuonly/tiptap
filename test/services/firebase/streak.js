/** Test-mode streak store. @module test/services/firebase/streak */

const streaks = new Map();

export async function getStreak(uid) {
  return streaks.get(uid) ?? {count: 0, last_activity: null};
}

export async function setStreak(uid, streak) {
  streaks.set(uid, streak);
}
