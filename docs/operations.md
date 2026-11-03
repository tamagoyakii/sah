# Environments and hosting

The frontend uses Next.js; content is stored in Sanity project `apwu4we2`.

| Environment | Frontend | Sanity dataset |
| --- | --- | --- |
| Local | `http://localhost:3000` (`npm run dev`) | `development` |
| Develop | `https://develop.d1e1kahcnr7oi1.amplifyapp.com` | `development` (Amplify branch override) |
| Production | `https://sahhhhh.com` / `https://main.d1e1kahcnr7oi1.amplifyapp.com` | `production` |

## Local setup and verification

Copy `.env.example` to `.env.local` for a new checkout. Install the locked dependencies with `npm ci`, then run `npm run dev`. Studio is mounted at `/studio`; changes there affect the selected dataset.

Studio's workspace title shows the connected dataset: `sah · 개발 (development)` or `sah · 운영 (production)`. Local and develop share the development dataset; the title identifies the content being edited rather than the frontend hostname. Standalone `sahhhhh.sanity.studio` uses production. Deploy it with `NEXT_PUBLIC_SANITY_DATASET=production` and select the existing `sahhhhh` hostname.

Run `npm test` for artwork page regression checks. Run `npm run build` for the selected dataset, or `NEXT_PUBLIC_SANITY_DATASET=production npm run build` to verify production content explicitly. `NEXT_PUBLIC_*` values are included at build time; changing an Amplify variable requires a new build.

## Hosting recovery order

1. Verify tests and builds against both datasets before deploying.
2. In AWS Amplify app `d1e1kahcnr7oi1`, inspect `main` and `develop` branch settings and the latest build logs. Use `NEXT_PUBLIC_SANITY_PROJECT_ID=apwu4we2` and `NEXT_PUBLIC_SANITY_API_VERSION=2026-01-03` for both branches. Set `NEXT_PUBLIC_SANITY_DATASET=production` on `main` and `development` on `develop`.
3. Check that the Amplify build process makes those environment values available to the Next.js build and server runtime. The repository has no `amplify.yml`; inspect the existing console build specification before changing it.
4. Deploy the reviewed fix to develop first. Verify its list shows the development artworks (오이, dumplings, 선인장), detail pages load, and image URLs use `/development/`.
5. Deploy the same fix to production. Verify the list contains the 14 production artworks and `/works/flash` renders with an OG image. Check the actual rendered screen, not only HTTP status: streamed errors and 404 screens can return HTTP 200.
6. Check ISR refresh after the configured 60 seconds. If the new deployment still serves stale pages, inspect regeneration logs before using Amplify's cache-clearing redeploy. Do not clear caches as a substitute for fixing regeneration errors.

## Development date migration

`npx sanity exec scripts/migrate-development-dates.cjs --with-user-token` previews the migration. Add `-- --apply` to apply it. The script only targets `development`, backs up full artwork documents under the locally ignored `.superpowers/hosting-recovery/`, and commits changes atomically with revision guards. Existing `date` and `year` fields are preserved. A missing date is derived from an integer `year` as January 1 for year display and ordering; this does not establish the actual creation day.

On 2026-11-02, three development documents were migrated: 오이 → `2025-01-01`, dumplings and 선인장 → `2024-01-01`.

## Diagnosis on 2026-11-02

Both public deployments displayed obsolete `test0` / `test1` entries and production image URLs. The `test0` detail link rendered 404. Direct Sanity queries returned 14 production artworks and three development artworks. Production artwork Flash had an empty first image item; this caused `/works` prerendering and detail metadata to throw. The fix skips image items without an asset reference. The production CMS document is retained unchanged.

AWS credentials are not stored in this repository. Console access is required to confirm deployed commits, branch variables, regeneration errors, and deployment success; local build success alone does not prove the public deployment was updated.

## Amplify recovery on 2026-11-02

Console inspection confirmed the last development deployment (10) succeeded on May 1, 2026 at commit `23922a3`. No newer failed deployment existed; content regeneration failure remains a separate runtime diagnosis. The develop dataset override was incorrectly set to production and has been changed to development. The existing console build spec runs `npm ci --cache .npm --prefer-offline`, then `npm run build`, publishes `.next`, and caches `.next/cache` and `.npm`. No build spec change was needed before the first validation deployment.

Commit `2b1fd26` was fast-forwarded to remote develop, starting Amplify deployment 11. Development deployment 11 succeeded in 2 minutes 52 seconds. The public list returned exactly the three development slugs, and cucumber detail/OG used development assets. The same commit was then fast-forwarded to remote main, starting production deployment 3. Production deployment 3 succeeded in 2 minutes 46 seconds. The public custom domain and main Amplify domain both returned 14 artworks. All 14 thumbnails and the Flash detail image loaded in the browser, and Flash OG metadata referenced the valid image.

Development ISR was checked after expiry: responses progressed from STALE to HIT and then CloudFront HIT, preserving the correct three artworks. No manual cache invalidation was performed. Production deployment 3 initially served the corrected pages, but expired requests remained STALE and CloudWatch showed `UND_ERR_SOCKET` fetch failures. The same commit was redeployed as production deployment 4 (2 minutes 36 seconds) to replace the runtime; no explicit clear-cache option was offered. After deployment 4, production progressed STALE → HIT → CloudFront HIT while retaining all 14 artworks. The deployed application commit on both main and develop is `2b1fd26500c45e74df0e3078202f96ad7bdff394`.

AWS currently documents managed Next.js support through version 15 ([support matrix](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)); this project remains on 16.1.1. No framework change was made because the verified deployment and ISR checks passed after runtime replacement. This test does not guarantee future upstream network availability. If stale content recurs, inspect Hosting compute logs before deciding on a compatibility migration.

## Encoded artwork routes

Next.js 16.1.1 passes encoded dynamic route segments to page code. Decode the segment exactly once before the GROQ slug lookup, and encode the stored slug when generating links. For example, `/works/plastic%20bag` must query the stored slug `plastic bag`. This also preserves Korean slugs and literal percent signs without renaming CMS records. Regression tests cover those cases and malformed URL encoding.

## Studio input validation

Artwork image array members require a linked asset (`required().assetRequired()`), in addition to the existing nonempty image array, title, slug, and date requirements. Optional alt text remains optional. These are Studio publishing rules; clients writing directly to the Content Lake must validate their own mutations. Tests use Sanity’s actual validator in the Studio environment. On 2026-11-03, the one metadata-free empty image placeholder on published Flash was backed up and removed with a revision guard; the existing linked image was retained. All 3 development and 14 production published artworks passed the new rules.
