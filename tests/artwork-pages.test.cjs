const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { renderToStaticMarkup } = require('react-dom/server');
const { createElement } = require('react');
const { ImageConfigContext } = require('next/dist/shared/lib/image-config-context.shared-runtime');
const { imageConfigDefault } = require('next/dist/shared/lib/image-config');
const imageConfig = { ...imageConfigDefault, ...require('../next.config.js').images };
const render = (element) => renderToStaticMarkup(
  createElement(ImageConfigContext.Provider, { value: imageConfig }, element),
);

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'apwu4we2';
process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';

const validImage = {
  _type: 'image',
  asset: {
    _type: 'reference',
    _ref: 'image-83dc55ebafcf79ac74346ecfb86b130955c69194-5792x8688-jpg',
  },
  alt: 'Flash sculpture',
};
const artwork = {
  _id: 'flash', title: 'Flash', slug: { current: 'flash' },
  date: '2024-05-03', category: 'sculpture',
};

function loadPage(file, images) {
  const fixture = { ...artwork, images };
  const { outputFiles } = buildSync({
    stdin: {
      contents: `export const getArtworks = async () => [${JSON.stringify(fixture)}];
        export const getArtworkBySlug = async () => (${JSON.stringify(fixture)});`,
      resolveDir: process.cwd(),
    },
    write: false, format: 'cjs', platform: 'node',
  });
  const queries = new Module(path.join(process.cwd(), 'tests/queries.cjs'), module);
  queries._compile(outputFiles[0].text, path.join(process.cwd(), 'tests/queries.cjs'));
  const result = buildSync({
    entryPoints: [file], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    external: ['@/sanity/lib/queries'],
  });
  const compiled = new Module(path.join(process.cwd(), 'tests/page.cjs'), module);
  compiled.paths = module.paths;
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = (id) => id === '@/sanity/lib/queries'
    ? queries.exports : originalRequire(id);
  compiled._compile(result.outputFiles[0].text, path.join(process.cwd(), 'tests/page.cjs'));
  return compiled.exports;
}

test('listing skips an empty first image and renders the valid artwork image', async () => {
  const page = loadPage('app/works/page.tsx', [{ _type: 'image' }, validImage]);
  const html = render(await page.default());
  assert.match(html, /alt="Flash sculpture"/);
  assert.match(html, /83dc55ebafcf79ac74346ecfb86b130955c69194/);
  assert.match(html, /href="\/works\/flash"/);
});

for (const images of [[{ _type: 'image' }], [], undefined]) {
  test(`listing preserves the artwork link without usable images: ${JSON.stringify(images)}`, async () => {
    const page = loadPage('app/works/page.tsx', images);
    const html = render(await page.default());
    assert.match(html, /href="\/works\/flash"/);
    assert.doesNotMatch(html, /<img /);
  });
}

test('detail metadata uses the first valid image after an empty image', async () => {
  const page = loadPage('app/works/[slug]/page.tsx', [{ _type: 'image' }, validImage]);
  const metadata = await page.generateMetadata({ params: Promise.resolve({ slug: 'flash' }) });
  const imageUrl = new URL(metadata.openGraph.images[0].url);
  assert.equal(imageUrl.pathname, '/images/apwu4we2/production/83dc55ebafcf79ac74346ecfb86b130955c69194-5792x8688.jpg');
  assert.equal(imageUrl.searchParams.get('w'), '1200');
  assert.equal(imageUrl.searchParams.get('h'), '630');
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  assert.equal((html.match(/<img /g) || []).length, 1);
});

test('detail metadata omits OG images when no image has an asset', async () => {
  const page = loadPage('app/works/[slug]/page.tsx', [{ _type: 'image' }]);
  const metadata = await page.generateMetadata({ params: Promise.resolve({ slug: 'flash' }) });
  assert.equal(metadata.openGraph.images, undefined);
});

test('valid first image retains its thumbnail and OG image', async () => {
  const listing = loadPage('app/works/page.tsx', [validImage]);
  assert.match(render(await listing.default()), /alt="Flash sculpture"/);
  const detail = loadPage('app/works/[slug]/page.tsx', [validImage]);
  const metadata = await detail.generateMetadata({ params: Promise.resolve({ slug: 'flash' }) });
  assert.match(metadata.openGraph.images[0].url, /83dc55ebafcf79ac74346ecfb86b130955c69194/);
});
