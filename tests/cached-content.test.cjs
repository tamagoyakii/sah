const assert = require('node:assert/strict');
const {test} = require('node:test');
const Module = require('node:module');
const path = require('node:path');
const {buildSync} = require('esbuild');

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'apwu4we2';
process.env.NEXT_PUBLIC_SANITY_DATASET = 'development';

function loadQueries() {
  const result = buildSync({entryPoints:['sanity/lib/queries.ts'],bundle:true,write:false,
    platform:'node',format:'cjs',packages:'external'});
  const compiled = new Module(path.join(__dirname,'cached-queries.cjs'),module);
  compiled.paths = module.paths;
  compiled._compile(result.outputFiles[0].text,path.join(__dirname,'cached-queries.cjs'));
  return compiled.exports;
}

test('cached page queries fetch fresh published data rather than re-cache stale API CDN results', async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    assert.match(url.hostname, /^apwu4we2\.(api|apicdn)\.sanity\.io$/);
    requests.push({url, options});
    const title = url.hostname.includes('.apicdn.') ? 'Old published content' : 'New published content';
    const query = url.searchParams.get('query');
    const result = query.includes('_type == "about"') ? {teamName:title}
      : query.includes('slug.current == $slug') ? {title} : [{title}];
    return new Response(JSON.stringify({result}),{status:200,headers:{'content-type':'application/json'}});
  };
  try {
    const queries = loadQueries();
    assert.equal((await queries.getArtworks())[0].title,'New published content');
    assert.equal((await queries.getArtworkBySlug('plastic%20bag')).title,'New published content');
    assert.equal((await queries.getAbout()).teamName,'New published content');
    assert.equal(requests.length,3);
    for (const {url, options} of requests) {
      assert.equal(url.hostname,'apwu4we2.api.sanity.io');
      assert.equal(options.next.revalidate,60,'retain Next data caching rather than querying on every visit');
    }
  } finally {
    global.fetch = originalFetch;
  }
});
