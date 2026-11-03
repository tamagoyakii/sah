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

function loadPage(file, images, slug = 'flash', followingArtworks = [], overrides = {}) {
  const fixture = { ...artwork, images, slug: { current: slug }, ...overrides };
  const { outputFiles } = buildSync({
    stdin: {
      contents: `export const getArtworks = async () => [${JSON.stringify(fixture)}, ...${JSON.stringify(followingArtworks)}];
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

test('listing encodes literal percent signs in a stored slug', async () => {
  const page = loadPage('app/works/page.tsx', [validImage], '100% real');
  assert.match(render(await page.default()), /href="\/works\/100%25%20real"/);
});

function loadQueries() {
  const result = buildSync({
    entryPoints: ['sanity/lib/queries.ts'], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    external: ['@/sanity/lib/client'],
  });
  const compiled = new Module(path.join(process.cwd(), 'tests/queries.cjs'), module);
  compiled.paths = module.paths;
  const originalRequire = compiled.require.bind(compiled);
  const records = ['plastic bag', '회색 자동차', 'flash', '100% real', 'literal%20slug'];
  compiled.require = (id) => id === '@/sanity/lib/client'
    ? { client: { fetch: async (_query, params) => records.includes(params.slug)
      ? { title: params.slug, slug: { current: params.slug } } : null } }
    : originalRequire(id);
  compiled._compile(result.outputFiles[0].text, path.join(process.cwd(), 'tests/queries.cjs'));
  return compiled.exports;
}

for (const [encoded, title] of [
  ['plastic%20bag', 'plastic bag'],
  ['%ED%9A%8C%EC%83%89%20%EC%9E%90%EB%8F%99%EC%B0%A8', '회색 자동차'],
  ['flash', 'flash'],
  ['100%25%20real', '100% real'],
  ['literal%2520slug', 'literal%20slug'],
]) {
  test(`detail lookup decodes the route slug once: ${encoded}`, async () => {
    const result = await loadQueries().getArtworkBySlug(encoded);
    assert.equal(result?.title, title);
  });
}

test('malformed URL encoding returns no artwork instead of throwing', async () => {
  assert.equal(await loadQueries().getArtworkBySlug('broken%E0%A4%A'), null);
});

test('thumbnail srcset uses direct responsive Sanity URLs and preserves square crop', async () => {
  const html = render(await loadPage('app/works/page.tsx', [validImage]).default());
  assert.doesNotMatch(html, /\/_next\/image/);
  assert.match(html, /sizes="[^"]*33[^"]*"/);
  assert.match(html, /auto=format/);
  assert.match(html, /fit=max/);
  const image = html.match(/<img[^>]+>/)[0];
  assert.doesNotMatch(image, /loading="lazy"/);
  const srcset = image.match(/srcSet="([^"]+)"/)[1].replaceAll('&amp;', '&');
  for (const candidate of srcset.split(', ')) {
    const [src, descriptor] = candidate.split(' ');
    const url = new URL(src);
    assert.equal(url.hostname, 'cdn.sanity.io');
    assert.equal(url.searchParams.get('w'), descriptor.slice(0, -1));
    assert.equal(url.searchParams.get('h'), descriptor.slice(0, -1));
    assert.equal(url.searchParams.get('rect'), '0,1448,5792,5792');
  }
});

test('detail uses intrinsic portrait ratio, direct CDN and lazy secondary images', async () => {
  const page = loadPage('app/works/[slug]/page.tsx', [validImage, validImage]);
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  assert.doesNotMatch(html, /\/_next\/image/);
  const images = html.match(/<img[^>]+>/g);
  assert.match(images[0], /width="5792" height="8688"/);
  assert.doesNotMatch(images[0], /loading="lazy"/);
  assert.match(images[1], /loading="lazy"/);
  assert.match(images[0], /sizes="[^"]*calc\(100vw - 32px\)/);
});

test('detail reserves the cropped aspect ratio while preserving source rect', async () => {
  const cropped = {...validImage, crop: {top: 0.25, bottom: 0.25, left: 0, right: 0}};
  const page = loadPage('app/works/[slug]/page.tsx', [cropped]);
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  assert.match(html, /width="5792" height="4344"/);
  assert.match(html, /rect=0(%2C|,)2172(%2C|,)5792(%2C|,)4344/);
});


test('listing preloads the first usable thumbnail after an imageless artwork', async () => {
  const page = loadPage('app/works/page.tsx', [], 'empty', [{...artwork, _id: 'second', images: [validImage]}]);
  const html = render(await page.default());
  assert.match(html, /rel="preload"/);
  assert.doesNotMatch(html.match(/<img[^>]+>/)[0], /loading="lazy"/);
});

test('first detail image has high fetch priority and an inline preview without prioritizing secondary images', async () => {
  const preview = 'data:image/jpeg;base64,/9j/2wBDAAYEBAUEBA';
  const page = loadPage('app/works/[slug]/page.tsx', [{...validImage, lqip: preview}, validImage]);
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  const images = html.match(/<img[^>]+>/g);
  assert.match(images[0], /fetchPriority="high"/);
  assert.match(images[0], /background-image:/);
  assert.match(images[0], /data:image/);
  assert.doesNotMatch(images[1], /fetchPriority="high"/);
  assert.match(images[1], /loading="lazy"/);
});

test('missing preview metadata preserves a normal high priority detail image', async () => {
  const page = loadPage('app/works/[slug]/page.tsx', [validImage]);
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  const image = html.match(/<img[^>]+>/)[0];
  assert.match(image, /fetchPriority="high"/);
  assert.doesNotMatch(image, /background-image:/);
});


test('each detail image uses its own inline preview while secondary images stay lazy', async () => {
  const first = 'data:image/jpeg;base64,Zmlyc3Q=';
  const second = 'data:image/jpeg;base64,c2Vjb25k';
  const page = loadPage('app/works/[slug]/page.tsx', [
    {_type: 'image'},
    {...validImage, lqip: first},
    {...validImage, lqip: second},
    {...validImage, lqip: null},
  ]);
  const html = render(await page.default({ params: Promise.resolve({ slug: 'flash' }) }));
  const images = html.match(/<img[^>]+>/g);
  assert.equal(images.length, 3);
  assert.match(images[0], /background-image:/);
  assert.match(images[0], /Zmlyc3Q/);
  assert.match(images[1], /background-image:/);
  assert.match(images[1], /c2Vjb25k/);
  assert.doesNotMatch(images[1], /Zmlyc3Q/);
  assert.doesNotMatch(images[2], /background-image:/);
  assert.match(images[0], /fetchPriority="high"/);
  for (const image of images.slice(1)) {
    assert.match(image, /loading="lazy"/);
    assert.doesNotMatch(image, /fetchPriority="high"/);
  }
  assert.equal((html.match(/rel="preload"/g) || []).length, 1);
});
