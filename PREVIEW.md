# TrueCraft editorial design test

Branch: test/haven-inspired-professional. Never merge/deploy directly to production without review.

The Git release branch predates the current production site. To avoid undoing approved content, this visual experiment snapshots the 20 rendered public pages and assets of production deployment dpl_HGu943H8ghpdZ1YuYkc48LeBxv5A, retrieved November 13, 2026. The original backend source could not be fully recovered through Vercel's truncated file response. This is a visual preview, not a backend replacement.

Build: `node scripts/build-preview.mjs`; serve `dist` with any static server.

The new home page preserves Bo's living-room hero photograph, warm brown/cream/gold identity, authentic project imagery, family photograph, ten service towns, service links and Google review destination. Design references Design Haven's editorial hierarchy, static photography, square edges, split service layout, and calm spacing. Other pages retain their current content with a shared restrained visual treatment. All animation/transitions disabled. Analytics removed, forms disabled, robots/noindex set on every page.

Current production, domains, inquiry API and settings were not changed. A hosted preview requires separate approval. Browser rendering QA is pending because local Chromium is blocked by environment socket restrictions. Static checks and build results are recorded in QA.txt.

Asset portability: the Git testing branch contains the HTML/CSS/JS design and a SHA-256 inventory. Missing photography/font assets are retrieved read-only from the live site by `scripts/fetch-preview-assets.mjs`; hash mismatches stop the build instead of silently substituting changed imagery. The complete captured assets also remain in the working copy. No API/backend is called. Build this preview using `npm run build`, not the historical build script.
