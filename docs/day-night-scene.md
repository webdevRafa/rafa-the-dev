# Scroll-driven city scene

The reference images are art direction only. They are not bundled or requested
at runtime. The illustration is a single inline SVG, with shared geometry for
daylight, golden hour, and night.

## Files

- `src/pages/SkyScene.tsx`: original vector artwork, reusable foliage and interior
  shapes, gradient definitions, and architectural anchors.
- `src/pages/HomePage.css`: daylight palette, responsive framing, typography,
  initial light-layer visibility, and reduced-motion fallback.
- `src/pages/cityTimeline.ts`: coordinated material, shadow, sun/moon, window,
  streetlamp, skyline, and reflection transitions.
- `src/pages/HomePage.tsx`: the introductory reveal and master ScrollTrigger.

The 4-unit timeline reserves its first unit for the existing headline reveal.
Daylight is held before the sunset transition. All visual changes are sampled
by the same scroll-controlled timeline, including light activation. No one-way
callbacks or React state updates drive the illustration.

Portrait framing pulls back the complete streetscape around its ground plane
without distorting the geometry. A separate celestial wrapper places the sun
and moon in the open sky, so phone visitors still see the window-lighting story
instead of a narrow crop of the skyline. CSS framing is independent of the GSAP
transforms, so scrolling backward and resizing remain reversible.

## Adding section three

Add the next section after `.showcase-stage`, inside `main`. Do not put it inside
the pinned element, and do not disable `pinSpacing`. Once the master timeline
finishes, the illustrated screen scrolls upward naturally and the next section
enters in ordinary document flow. A later interactive section can own a separate
ScrollTrigger scoped to its own container.

Reduced-motion visitors see a static daytime scene in normal document flow,
with no long pinned sequence. `gsap.matchMedia()` reverts animations and pinning
on preference changes and unmount; font loading triggers a guarded refresh.

## Local verification

Run `npm run build` and lint the changed TypeScript files. The optional headless
browser check uses Playwright with installed Chrome:

```sh
npm install --no-save --package-lock=false playwright
npm run dev -- --host 127.0.0.1 --port 5188
node scripts/check-home-scroll.mjs
```

`TEST_URL` can point the test at another local preview. Screenshots go into the
ignored `test-results` directory. The flow-exit test appends a temporary section
only in the browser; no placeholder section is shipped on the site.
