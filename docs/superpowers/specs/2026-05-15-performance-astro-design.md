# 2026-05-15 Performance and SEO Hardening (Astro)

## Context
- Project uses legacy HTML injected via LegacyDocument.
- Goal is to improve performance without breaking SEO or interactivity.
- Hosting target: Cloudflare Pages.

## Goals
- Convert static <img> to astro:assets <Image> where safe.
- Ensure width and height, LCP prioritization, lazy loading for non-LCP.
- Ensure local fonts use font-display: swap and preconnect only when needed.
- Enable HTML compression and long cache headers for static assets.
- Keep pages SSG and minimize hydration.

## Non-Goals
- Rebuild or redesign content or structure.
- Change URLs, titles, descriptions, canonical, or JSON-LD.
- Remove or refactor client components (islands).

## Constraints
- SEO must remain unchanged per route.
- Migration is incremental per route with build validation.
- Islands must keep hydration (avoid mismatch).

## Approach Summary
- Migrate one route at a time into native .astro with the same HTML.
- Replace only static <img> with <Image>.
- Keep islands as-is; images inside islands are left unchanged for safety.
- Update astro.config.mjs for compressHTML and inlineStylesheets (auto).

## Route Migration Workflow
1. Pick a route (start with /depoimentos/).
2. Extract legacy HTML as base reference.
3. Convert to .astro and replace eligible <img> with <Image>.
4. Validate build and preview output for regressions.
5. Commit and move to next route.

## Image Strategy
- Move referenced images from public/ to src/assets for astro:assets.
- Use <Image> with width, height, and sizes.
- LCP image: loading="eager" and fetchpriority="high".
- Non-LCP images: loading="lazy".
- Keep image alt text intact.
- Exception: images inside hydrated islands remain <img>.

## Fonts
- Fonts are local in public/fonts; font-display: swap already in built CSS.
- Ensure preloads remain for critical fonts.
- No external font CDN usage.

## CSS and JS
- Preserve current CSS files; remove unused CSS only after safe audit.
- Ensure third-party scripts remain async or defer.
- Avoid adding new sync scripts in head.

## HTML and Head
- Ensure meta charset and viewport remain in head.
- Enable HTML minification via Astro config.

## Cache and Compression (Cloudflare Pages)
- Add public/_headers with long cache for /_astro/* and /fonts/*.
- Moderate cache for /imagens/*.
- Rely on Cloudflare Brotli and Gzip (no Astro change required).

## Core Web Vitals
- CLS: enforce width and height on images and keep font swap.
- LCP: prioritize hero image.
- INP: avoid extra client JS; prefer client:idle or client:visible where possible.

## Risks and Mitigations
- Hydration mismatch if replacing images inside islands -> keep islands unchanged.
- SEO drift if head content changes -> keep meta, canonical, JSON-LD untouched.
- Asset path breaks if moved -> update references during migration.

## Validation Checklist
- npm run build succeeds.
- Preview matches current layout and content.
- LCP image is not lazy and has fetchpriority.
- All other images are lazy.
- No SEO head changes (diff head).
