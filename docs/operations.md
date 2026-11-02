# Environments and hosting

The frontend uses Next.js; content is stored in Sanity project `apwu4we2`.

| Environment | Frontend | Sanity dataset |
| --- | --- | --- |
| Local | `http://localhost:3000` (`npm run dev`) | `development` |
| Develop | `https://develop.d1e1kahcnr7oi1.amplifyapp.com` | Set branch override to `development` in Amplify |
| Production | `https://sahhhhh.com` / `https://main.d1e1kahcnr7oi1.amplifyapp.com` | `production` |

## Local setup and verification

Copy `.env.example` to `.env.local` for a new checkout. Install the locked dependencies with `npm ci`, then run `npm run dev`. Studio is mounted at `/studio`; changes there affect the selected dataset.

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
