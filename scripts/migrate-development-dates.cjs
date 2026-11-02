// Run with: sanity exec scripts/migrate-development-dates.cjs --with-user-token
// Add -- --apply to apply the revision-guarded development-only migration.
const { getCliClient } = require('sanity/cli');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

async function main() {
  const client = getCliClient({ apiVersion: '2026-01-03' }).withConfig({
    dataset: 'development', useCdn: false, perspective: 'raw',
  });
  const documents = await client.fetch('*[_type == "artwork"]');
  const updates = documents.filter((doc) => !doc.date).map((doc) => {
    if (!Number.isInteger(doc.year) || doc.year < 1000 || doc.year > 9999) {
      throw new Error(`Cannot derive a date for ${doc._id}: invalid year`);
    }
    return { id: doc._id, revision: doc._rev, title: doc.title, date: `${doc.year}-01-01` };
  });
  console.log(JSON.stringify({ dataset: 'development', updates }, null, 2));
  if (!process.argv.includes('--apply') || updates.length === 0) {
    console.log(updates.length ? 'Dry run: no documents changed.' : 'No migration needed.');
    return;
  }
  const backupDir = join(process.cwd(), '.superpowers', 'hosting-recovery');
  mkdirSync(backupDir, { recursive: true });
  const backup = join(backupDir, `development-artworks-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(documents, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(`Backup: ${backup}`);
  let transaction = client.transaction();
  for (const update of updates) {
    transaction = transaction.patch(update.id, (patch) => patch
      .ifRevisionId(update.revision).setIfMissing({ date: update.date }));
  }
  await transaction.commit();
  const verified = await client.fetch('*[_type == "artwork"]{_id, title, year, date}');
  for (const update of updates) {
    if (verified.find((doc) => doc._id === update.id)?.date !== update.date) {
      throw new Error(`Verification failed for ${update.id}`);
    }
  }
  console.log(JSON.stringify({ verified }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
