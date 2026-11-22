/** Test-mode entitlement API used when EXPO_PUBLIC_APP_MODE=test. @module test/services/api/entitlements */

let state = {
  premium: false,
  gems: 3,
  bookmarks: [],
  streak: null,
  themeMode: null,
};

export async function fetchEntitlements() {
  return {...state, bookmarks: [...state.bookmarks]};
}

export async function verifyPremiumPurchase() {
  state = {...state, premium: true};
  return {premium: true, expiresAt: null};
}

export async function recordTestReward() {
  state = {...state, gems: state.gems + 1};
  return {gems: state.gems};
}

export async function spendGemOnFact(factTitle) {
  if (state.gems < 1) {
    const error = new Error("Not enough gems");
    error.status = 402;
    throw error;
  }
  const slug = factTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  state = {
    ...state,
    gems: state.gems - 1,
    bookmarks: state.bookmarks.includes(slug)
      ? state.bookmarks
      : [...state.bookmarks, slug],
  };
  return {gems: state.gems, slug};
}
