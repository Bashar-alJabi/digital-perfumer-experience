# Digital Perfumer — The Digital Atelier

Bashar Al-Jabi's original portfolio, presented as a scroll-directed Three.js atelier with camera-projected typography.

## Local development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Development and production builds use Next.js's supported Webpack option for reliable execution in the local Windows environment.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run test:content
npm run build
npm start
```

The content contract checks the original visible copy, all 15 projects, 34 skills, statistics, section order, project image hashes and CV against the original main revision.

## Review

See [the art direction, architecture and verification record](docs/cinematic-atelier.md), including the browser/device checks still required before this preview is marked ready.

Keep development on `feat/cinematic-redesign` and continue using its existing pull request. Do not merge to main without the owner's approval.
