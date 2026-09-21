# Scroll-driven city scene

The city reference images are art direction only. The animated city illustration
is a single inline SVG, with shared geometry for daylight, golden hour, and night.
The following underground section uses static responsive artwork.

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

## The underground continuation

`UndergroundSection.tsx` follows `.showcase-stage`, inside `main` and outside the
pin. Once the master timeline finishes, the nighttime city scrolls upward and
the underground section enters in ordinary document flow. It has no timeline,
pin, sticky container, or entrance animation. A later interactive section can
own a separate ScrollTrigger scoped to its own container.

Both scene edges meet at `#171f34`. A narrow gradient on the city road normalizes
its last pixels across different crops; the underground artwork blends from
that same edge color. Reserved section dimensions avoid image-loading shifts.

Reduced-motion visitors see a static nighttime scene in normal document flow,
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
ignored `test-results` directory. The tests verify the real underground section,
its responsive image, native scroll movement, content fit, and gap-free join.

## Underground artwork

- `public/scenes/underground-desktop.png`: supplied reference, unchanged.
- `public/scenes/underground-mobile.png`: portrait adaptation made with the
  built-in image-generation tool, keeping the stairs and tunnel in frame.
- Matching `.webp` files are quality-86 delivery encodings (~120 KB each).
  `<picture>` selects the portrait version on portrait viewports. The originals
  remain available as PNG assets; the page only loads its matching WebP.

The mobile generation prompt was:

> Use case: stylized-concept. Asset type: portrait mobile website section background, 9:16 portrait composition. Image 1 is the reference and edit target. Adapt this exact underground railway / cutaway city illustration into a tall portrait composition, retaining the painterly style, architectural materials, warm amber lamps, deep navy-blue shadows, elegant empty quiet atmosphere. Preserve the key story: a thin band of asphalt street at the very top, a thick concrete slab and pipes directly below it, stairs on the LEFT descending from the city, tiled platform, and an arched rail tunnel on the RIGHT with curving tracks toward the lower right foreground. Recompose these same elements naturally so BOTH the stairs and tunnel remain visible on a narrow phone screen; not simply a center crop of the wide image. Top edge should be dark blue-black asphalt close to hex #171f34 so this panel connects seamlessly underneath a nighttime street. Road/structural slab may occupy the upper 15% of the composition, dark uncluttered concrete/overhead space from 18% to 40% should leave room for HTML headline overlaid later; the richly detailed lit stairway, platform, tunnel and tracks should dominate the lower 60%. Maintain depth and perspective, polished atmospheric lighting and subtle material texture from reference. No text, lettering, signage, UI, people, vehicles, logos or watermarks. High quality full-bleed portrait artwork, not a mockup and no border.
