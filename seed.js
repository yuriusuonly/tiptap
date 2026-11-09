// Seeds the Firestore `content` collection from `content.json`.
// The app reads `content` (public read, no client writes) via ContentService.
//
// Prerequisites:
//   1. `npm install` (firebase-admin + firebase-tools from package.json)
//   2. Credentials via `.env` (loaded with `node --env-file .env`):
//      GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
//      FIREBASE_SHARED_PROJECT_ID= (or FIREBASE_PROJECT_ID override)
//
// Usage:
//   npm run firebase:seed
//
// Writes docs with IDs derived from titles + `createdAt` offsets.
// Run again to update (set semantics, no duplicates).

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import facts from './content.json' with { type: 'json' };

const projectId = process.env.FIREBASE_SHARED_PROJECT_ID;

if (!getApps().length) {
  initializeApp({ projectId });
}

const db = getFirestore();

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function seed() {
  const CHUNK = 400; // Firestore batch limit is 500
  for (let i = 0; i < facts.length; i += CHUNK) {
    const batch = db.batch();
    facts.slice(i, i + CHUNK).forEach((fact, j) => {
      const idx = i + j;
      const ref = db.collection('content').doc(slug(fact.title));
      batch.set(ref, {
        title: fact.title,
        body: fact.body,
        summary: fact.summary,
        // Stagger createdAt so `orderBy('createdAt', desc)` is deterministic.
        createdAt: new Date(Date.now() - (facts.length - idx) * 1000),
      });
    });
    await batch.commit();
    console.log(`Seeded ${Math.min(i + CHUNK, facts.length)}/${facts.length} docs...`);
  }
  console.log(`Seeded ${facts.length} docs into content (project=${projectId})`);
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
