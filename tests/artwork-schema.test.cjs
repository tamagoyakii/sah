const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { createSchema, validateDocument } = require('sanity');
const { createClient } = require('@sanity/client');

// Sanity's validator schedules work through its browser idle-callback fallback.
global.window = { setTimeout, clearTimeout };

const compiled = new Module(path.join(__dirname, 'schema.cjs'), module);
compiled.paths = module.paths;
const built = buildSync({
  entryPoints: ['sanity/schemaTypes/artwork.ts'], bundle: true, write: false,
  platform: 'node', format: 'cjs', packages: 'external',
});
compiled._compile(built.outputFiles[0].text, path.join(__dirname, 'schema.cjs'));
const schema = createSchema({ name: 'artwork-validation-test', types: [compiled.exports.artworkType] });
const client = createClient({
  projectId: 'apwu4we2', dataset: 'development', apiVersion: '2026-01-03', useCdn: false,
});
// Slug uniqueness is an external lookup, unrelated to the field rules under test.
client.fetch = async (query) => {
  assert.match(query, /slug\.current/);
  return true;
};
const workspace = {
  schema,
  getClient: () => client,
};
const validImage = {
  _type: 'image', _key: 'valid-image',
  asset: { _type: 'reference', _ref: 'image-57768d4a40db55e5c7c3e15877b4d187f9d7e6fb-408x408-webp' },
};
const validArtwork = {
  _id: 'artwork-validation-fixture', _type: 'artwork', _rev: 'fixture-revision',
  _createdAt: '2026-11-03T00:00:00Z', _updatedAt: '2026-11-03T00:00:00Z',
  title: 'Validation fixture', slug: { _type: 'slug', current: 'validation-fixture' },
  date: '2026-01-01', images: [validImage],
};
async function errors(overrides) {
  const markers = await validateDocument({
    document: { ...validArtwork, ...overrides }, workspace,
    getDocumentExists: async () => true, environment: 'studio',
  });
  return markers.filter(marker => marker.level === 'error');
}
function hasFieldError(markers, field) {
  return markers.some(marker => marker.path[0] === field);
}

test('an image item without a file blocks artwork publication', async () => {
  const markers = await errors({ images: [{ _type: 'image', _key: 'empty-image' }] });
  assert.ok(hasFieldError(markers, 'images'), JSON.stringify(markers));
});

test('a valid image does not allow another empty image item to be published', async () => {
  const markers = await errors({ images: [validImage, { _type: 'image', _key: 'empty-image' }] });
  assert.ok(hasFieldError(markers, 'images'), JSON.stringify(markers));
});

test('an artwork with a linked image is valid without optional alt text', async () => {
  assert.deepEqual(await errors({}), []);
});

for (const images of [[], undefined]) {
  test(`missing image content is rejected: ${JSON.stringify(images)}`, async () => {
    assert.ok(hasFieldError(await errors({ images }), 'images'));
  });
}
for (const field of ['title', 'slug', 'date']) {
  test(`missing ${field} still blocks publication`, async () => {
    assert.ok(hasFieldError(await errors({ [field]: undefined }), field));
  });
}
