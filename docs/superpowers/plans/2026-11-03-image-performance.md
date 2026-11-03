# Image performance implementation plan

> Execute inline with TDD and verification-before-completion.

Goal: responsive Sanity CDN delivery without altering artwork content or crop.
Spec: ../specs/2026-11-03-image-performance-design.md

- [x] Add failing rendered-page tests for direct CDN srcset, square crop, thumbnail sizes/preload, detail aspect ratio and lazy secondary images; loader tests cover DPR widths and existing rect preservation.
- [x] Add SanityImage client wrapper and pure loader/dimension utility; update only artwork image usages. Keep originals and cache settings.
- [x] Run tests, development/production builds and independent review. Verify local images, compare representative transfer sizes and record limits.
- [ ] Deploy develop then main; verify deployed responsive markup and image loads. Report measurements, without equating source-fetch savings to browser bandwidth savings.
