# Plan 01 — Compaction + Sidebar Chevron Token Drift

Commit: `d636abd7a4ce302e7ccb9eb6074f637c6dd4d83b` (`main`). Audit: `design-plans/android-ui-audit.md` finding 1.
Order: execute first (4 lines, zero behavior risk).

## Problem

Two spots on the Android daily path hardcode dark-side grays instead of the theme token, so they drift in light theme (light `foregroundMuted` is `#71717a`, dark is `#A1A5A4` — `styles/theme.ts:317,452`):

- `packages/app/src/components/message.tsx:2224` — `<LoadingSpinner size="small" color="#a1a1aa" />`
- `packages/app/src/components/message.tsx:2226` — `<Scissors size={12} color="#a1a1aa" />`
- `packages/app/src/components/sidebar/project-leading-visual.tsx:246` — `<ChevronDown size={14} color="#9ca3af" />`
- `packages/app/src/components/sidebar/project-leading-visual.tsx:248` — `<ChevronRight size={14} color="#9ca3af" />`

Contract: `docs/design.md` §12 (chevrons use `foregroundMuted`) + §14 (no hardcoded hex; identity table is the only exception).

## Correction (exact)

In `message.tsx`, the owners already exist — `ThemedLoadingSpinner` (`:170`), `foregroundMutedColorMapping` (`:176-178`), exemplar `:902`:

```tsx
<ThemedLoadingSpinner size="small" uniProps={foregroundMutedColorMapping} />
```

1. `:2224` → replace with the exemplar above (same size).
2. Add `const ThemedScissors = withUnistyles(Scissors);` beside `:166-170` (mirror `ThemedChevronRightIcon`, `:169`; exemplar usage `:2572`). `:2226` → `<ThemedScissors size={12} uniProps={foregroundMutedColorMapping} />`.
3. In `project-leading-visual.tsx` (already imports `withUnistyles`, `:2`): add themed chevron wrappers + stylesheet color entries using `theme.colors.foregroundMuted` (follow `unistyles.md` static-imports rule — never import `theme` for live colors). Replace `:246,248`.

Do not touch the `#000000` shimmer-mask values (`message.tsx:1302,1307`) — masks require opaque black. Do not add tokens.

## Verification

- `npm run typecheck`, `npm run lint -- <touched files>`, `npm run format` (repo rules).
- Cold-restart Android build, screenshot CompactionMarker loading/done states + sidebar chevrons in light AND dark theme (QA evidence bar, `docs/qa.md`).
- No new tests required (pure token routing); run any touched existing suite only: `npx vitest run <file> --bail=1`.

## Out of scope

Finding 2 (hooks), any file decomposition, any new primitives or tokens.
