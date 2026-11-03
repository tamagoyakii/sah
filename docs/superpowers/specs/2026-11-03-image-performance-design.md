# Artwork image delivery

User selected direct Sanity CDN optimization. Preserve CMS originals, artwork order, square thumbnail crop/hotspot and uncropped detail content. Keep Next Image responsive markup and lazy loading, with only the first visible image preloaded. No caching, framework or CMS content changes.

Use a client image wrapper with a Sanity URL loader: browser-selected width, proportional height for existing square thumbnail URLs, quality 75 (matching current final Next output), auto=format and fit=max. Retain builder-generated rect crops. Supply grid sizes derived from the existing 768/1024px breakpoints and 1280px container. Detail sizes reflect its existing 1024px maximum. Reserve the actual detail aspect ratio using source URL dimensions/rect to prevent layout shifts.

Alternatives: retain Next optimizer plus smaller upstream sources (less code, retains server transformation hop); direct CDN (selected, avoids downloading large sources into Amplify and double processing). No new dependency required. Validate generated markup/URLs, both datasets, actual browser images and byte sizes. Timing measurements are cache-dependent; do not claim guaranteed LCP gains.
