# Hosting recovery implementation plan

> Execute inline using superpowers:executing-plans and test-driven-development.

**Goal:** Restore builds and artwork pages, migrate development dates, and verify Amplify environments.
**Architecture:** Keep Next.js and Sanity. Select images with an asset reference consistently in artwork listing, metadata, and detail rendering. Preserve existing CMS data; migrate only missing development dates from the existing year.
**Scope:** User approved sequential recovery after the hosting diagnosis in this chat. Work in the existing checkout on `codex/fix-hosting-content`; no deployment before verification.

## Tasks

- [x] 1. Add regression tests for an empty first image followed by a valid image, no valid images, and detail metadata. Verify failures, implement image selection, then run tests and production build.
- [x] 2. Back up development artwork documents. Set missing dates from existing years using January 1 as the year-only sorting convention, preserve year fields, and use revision guards. Verify all three documents and a development build.
- [ ] 3. Inspect Amplify authentication, branches, environment variables, and deployment logs. Separate development dataset if access permits. Verify deployment before cache invalidation; record any access blocker without inventing results.
- [x] 4. Review the diff and run final checks. Keep the local server running and report code, CMS, and deployment status separately.

## Review focus

- The first image may lack an asset while a later image is valid.
- All images or the image array may be absent; omit images and OG metadata safely.
- A valid first image must keep its existing rendering and metadata.
- Migration must preserve existing dates, years, and concurrently edited documents.
- Cached HTTP 200 responses may contain error or 404 screens; verify rendered content.

## Verification and remaining access

- `npm test`: 7/7 passed after clean `npm ci`.
- Production dataset build: passed; `next start` list displayed 14 artworks and Flash detail/OG rendered correctly.
- Development dataset build: passed; local list displayed 3 artworks and cucumber detail/OG rendered with development image URLs.
- Independent review: no actionable correctness findings.
- AWS console redirects to sign-in; no CLI credentials available. Branch environment inspection, remote deployment and cache verification remain pending user login. No remote deployment changes made.
