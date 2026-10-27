# Digital Perfumer / The Digital Atelier

This branch transforms the original portfolio at `dd1b4f9` into a scroll-directed atelier. It is a preview for artistic and device review, not a claim of parity with the reference studios.

## Identity and content contract

The original pale pink `#ffeff5`, coral `#f36371`, soft pink `#ffd8df`, black, Inter and Playfair Display remain the foundation. The three signature dots become three authored, bevelled glass/ink/coral sweeps. The perfume bottle remains the scroll indicator, with its cap, narrow neck, glass body, draining coral liquid and current section name.

Original section order is unchanged:

1. Home
2. Philosophy
3. Formula
4. About
5. Impact
6. Work
7. Memory
8. Skills
9. Contact, then Footer

All 15 project records, 34 skills, note descriptions, statistics, project images, CV and original visible copy are preserved. The role line in the opening is taken from the original biography to make the actual profession clear immediately. No project screenshots were fabricated. Four professional projects have no original image; the WebGL gallery shows their original title/category as a typographic plate.

`npm run test:content` compares the content arrays and visible source copy to the original Git revision, checks chapter order and hashes every original project image and the CV.

## Reference study

Primary references inspected in the browser:

- [Igloo Inc.](https://www.igloo.inc/): a coherent material language, close-range object interaction, camera travel into portfolio objects, atmospheric depth and minimal wayfinding. Inspected the opening and ice portfolio station at portrait dimensions.
- [Active Theory](https://activetheory.net/): an opening sculpture, spatial project planes, type entering the same composition, and a continuous environment connecting work. Inspected the opening, headline transition and E.C.H.O. gallery in both scroll directions.
- [Three.js CSS3DRenderer](https://threejs.org/docs/#CSS3DRenderer): reference for matching CSS camera/object transforms to the WebGL perspective. The installed renderer source was read alongside the implementation.
- Installed Next.js 16.2.10 guides for pages/layouts, client boundaries, CSS, fonts, lazy loading and CLI options.

Their assets, shaders, typography and layouts were not copied. The usable principles are shared art direction, deliberate dwell time, reversible movement and content that occupies the camera's space.

## Rendering architecture

The portfolio is server rendered. A dynamically imported Three.js engine progressively enhances it.

- One WebGL renderer, one perspective camera and nine stations along a continuous world axis.
- Native document scroll is the source of truth. Lenis smooths wheel movement without replacing document anchors or touch scrolling.
- CSS3D camera and object matrices are calculated from the actual Three.js camera. The text planes move in perspective with the objects, rather than remaining fixed over the canvas.
- A reading interval occupies most of each chapter. Its final portion drives the camera into the next station and moves/fades the current content out.
- Only the active chapter can appear or receive focus in cinematic mode. This also prevents gallery/skills content leaking into other sections.
- Chapter items, project buttons and arrows seek the same scroll timeline. Scrolling back reverses the same calculation.
- Geometry and lighting are procedural/local. RoomEnvironment provides reflections without an external HDR dependency.
- Work textures load on demand, use the original WebP files and preserve top-aligned previews. Project records remain the sole source of image/link/description data.

Scene treatments:

| Original section | Treatment                                                                     |
| ---------------- | ----------------------------------------------------------------------------- |
| Hero             | Editorial opening with the three-material signature sculpture                 |
| Philosophy       | Signature separates as the original Top/Heart/Base texts take focus           |
| Formula          | Three notes assemble into the glass vessel                                    |
| About            | Large editorial type, original biography, CV and social links                 |
| Impact           | Original four figures with material specimens                                 |
| Work             | Spatial image plates, reversible rail movement, two original collections      |
| Scent Memory     | Signature releases into a particle field across the three original statements |
| Skills           | Five glass shelves and the five original ingredient groups                    |
| Contact/Footer   | Reassembled signature, original contact copy and Formspree form               |

## Adaptive behavior and accessibility

At viewports at least 900px wide and 640px high the camera-projected presentation is enabled. Smaller/shorter screens use native content flow with a compact WebGL layer. Work uses its native image presentation there, avoiding a duplicate WebGL gallery. OS reduced-motion preference or the Motion control switches to document flow and removes WebGL. The original bottle still reports progress.

There are native links/buttons, visible focus styles, an escape-closing mobile menu, a skip link, labelled form fields, service selection state and a complete no-WebGL document. A no-JavaScript project index makes all project records reachable without interactive controls.

DPR is capped at 1.6 on cinematic desktop and 1.15 otherwise. Idle rendering is limited to 30fps; scroll/interaction uses the display cadence. Rendering pauses when the tab is hidden. A one-way quality adjustment can lower DPR on slower devices. Textures, geometry, materials, observers and listeners are disposed on teardown. Context loss returns to native document flow.

The supported Webpack CLI option is used for dev/build. Turbopack's PostCSS subprocess failed locally on this Windows environment before the original page could compile. No Next.js version change was required.

## Verification record

Completed:

- Clean initial working tree and correct `feat/cinematic-redesign` branch; `HEAD`, local `main` and fetched `origin/main` agreed at the start.
- Original content/asset contract test.
- TypeScript and ESLint.
- Production build with static generation.
- Browser inspection at 1280×720 and 1280×800, plus an observed 920×715 native-flow state.
- Visual review of Hero, Philosophy, Formula and Work.
- Note selection and chapter anchor navigation.
- All 15 project selections, names and displayed destination links; both collections and code-only ClickMart.
- Fixed an observed skills-panel visibility leak, anchor stopping before a chapter, stale camera code during hot refresh and duplicate gallery imagery in native flow.

Still required before marking this preview ready:

- Real portrait/mobile visual verification. The browser viewport override did not produce the requested portrait size, and native Windows browser control then stopped because the tool could not establish the current URL confidently. Browser automation was not continued afterward.
- Complete forward/backward visual sweep of About, Impact, all Memory/Skills states and Contact/Footer.
- Browser verification of OS reduced motion, Motion toggle, keyboard traversal, resize preservation and context loss.
- Form validation/success/error-path verification. The original Formspree endpoint `mnpqzbbe` is retained; no test message was sent.
- On-device frame-rate/load profiling and a final artistic review of scene pacing and depth. No measured Lighthouse or FPS score is claimed.

Keep subsequent changes on this branch and this PR. Do not merge to main without the owner's approval.
