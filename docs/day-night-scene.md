# Scroll-driven portfolio scenes

## City and native exit

The city is one inline SVG (`SkyScene.tsx`), not a crossfade between reference
images. `cityTimeline.ts` coordinates palette, shadows, sun, moon, windows,
streetlamps and reflections. Geometry stays shared across day and night.
`HomePage.tsx` combines the hero reveal with the four-unit city timeline,
scrubbed over 4.5 viewport heights. Portrait framing preserves the streetscape.

After night completes, the city releases its pin and scrolls upward normally.
A separate unpinned `city-exit` ScrollTrigger increases the opacity of a navy
wash from 0 to 1 over exactly the city's height. It starts at the city pin's
end, uses linear easing and immediate scroll scrubbing, and reverses on upward
scroll. No extra scroll distance is introduced by this fade.

The wash, bottom road edge and next section all use **#171f34**. The next section
directly follows the city pin spacer, so there is no gap or overlapping artwork.

## Interface layers and fourth section

`InterfaceLayers.tsx` replaces the subway section with a compact, code-native
SVG. Three isometric panels illustrate structure, interaction and visual polish.
Its separate pin begins only when the section reaches the top of the viewport.
Over 2.2 viewport heights, the panels separate, labels appear, the composition
holds, then labels disappear and the panels reassemble. The card gently shrinks
before the pin releases. All states belong to a reversible GSAP timeline; no
one-way scroll callbacks or React rerenders drive the animation.

The fourth section is a simple full-height text section in normal flow, providing
a visible destination after the card sequence. Mobile uses a centered vertical
layout; desktop puts copy alongside the small object with ample negative space.
The previous underground image files are retained as unused source assets and
are no longer requested by this page.

## Lifecycle and accessibility

Each animation is scoped and cleaned up with `gsap.matchMedia()`. Reduced-motion
visitors get static night and expanded layers without pins or exit animation.
Headings and copy remain HTML; decorative SVG is hidden from screen readers.
The city has refresh priority 10 and its exit priority 5, ensuring downstream
pins measure after upstream spacing. A guarded font-ready refresh and responsive
end measurements keep resize and reverse scrolling consistent.

## Verification

Run `npm run build` and ESLint on changed files. The optional browser test uses
Playwright and installed Chrome:

```sh
npm install --no-save --package-lock=false playwright
npm run dev -- --host 127.0.0.1 --port 5188
node scripts/check-home-scroll.mjs
```

`TEST_URL` overrides the preview URL. Screenshots are saved to ignored
`test-results/`. Checks cover six phone/tablet/desktop/landscape sizes, day/night,
exit fade at quarter increments, native-flow seams, panel positions in both
scroll directions, fourth-section release, resize, copy fit and reduced motion.
