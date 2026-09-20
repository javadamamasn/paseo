# Android UI Audit — Agent Workflow Surface

Scope: Android (compact) daily path — sidebar list → workspace pane → transcript → composer/tracks.
Commit: `d636abd` (shallow clone, `main`). Date: 2026-09-20.

## Design language

- Audited surface: sidebar list, workspace pane, transcript (`message.tsx`), composer + tracks — the agent run/monitor loop on Android.
- Design sources: `docs/design.md`, `docs/hover.md`, `docs/unistyles.md`, `docs/forms.md`, `docs/qa.md`, `docs/glossary.md` (Composer / Composer track terms).
- Documented decisions: primitive reuse over hand-matching (§2); hierarchy via weight+color (§3); one accent CTA per surface; `StyleSheet.create((theme) => …)` default with `useUnistyles()` banned; canonical hover = plain View + pointer events with separate inner Pressable; schedule form as golden shape.
- Governing owners and consumers: `styles/theme.ts` tokens; `components/ui/` primitives; `styles/settings.ts` card/row; `control-geometry.ts` sizes; `getStatusDotColor`; `FLOATING_ACTION_BUTTON_CLEARANCE`.
- Explicit exceptions: identity-color table is the documented exception to the no-hardcoded-hex rule (design §13). Nothing else cited.

## Findings

| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | ------- | -------- | --------------- | ----- | ---------- |
| 1 | Hardcoded grays bypass `foregroundMuted` on the Android daily path | `components/message.tsx:2224,2226` (`#a1a1aa` spinner + scissors); `components/sidebar/project-leading-visual.tsx:246,248` (`#9ca3af` chevrons). Contract: design §12 (chevrons use `foregroundMuted`) + §14 (no hardcoded hex; identity table is the only exception). Runtime: light `foregroundMuted` is `#71717a`, dark is `#A1A5A4` (`theme.ts:317,452`) — hardcoded values freeze the dark-side gray and drift in light theme. Same file already owns the correct pattern (`foregroundMutedColorMapping`, `message.tsx:176`; `ThemedLoadingSpinner`, `:902`). | Route all four through `theme.colors.foregroundMuted` via the existing owners (uniProps mapping in `message.tsx`; `withUnistyles` leaf icon per `unistyles.md` static-imports rule). | 2 files, 4 lines | High |
| 2 | `useUnistyles()` in 55 files, including hot Android rows | `components/agent-list.tsx`, `components/agent-status-dot.tsx`, `components/context-window-meter.tsx`, `components/dictation-controls.tsx`, `composer/agent-controls/mode-control.tsx` (full list via `rg -l "useUnistyles\(\)" packages/app/src`). Contract: `unistyles.md` — new calls rejected, existing tolerated only until touched. Runtime: the hook re-renders on every runtime change; per-row subscriptions on high-frequency stores break the coding-standards collection-rows rule and risk lockstep re-renders on agent streams. | Convert touched Android-path call sites to `StyleSheet.create((theme) => …)` + `withUnistyles` leaf wrappers; verify with renderer profiling per `development.md`. | Phased, Android path first | Medium |

## Rejected candidates (falsified on re-open)

- `composer/tracks.tsx:254` pointer events — the `hover.md` canonical pattern, cited in the file's own comment. Deliberate.
- `message.tsx:1302,1307` `#000000` — shimmer mask values; masking requires opaque black. Functional, not theming.
- Spacing scale — only hit is generated mermaid HTML. Discipline holds.
- FAB clearance — single-surface use (`git/jump-to-file`), matches the one-per-surface rule.

## Structural inventory (heavy-plan input, not findings)

God files on the Android path (non-test tsx): `workspace-screen.tsx` 4421, `message.tsx` 3223, `sidebar-workspace-list.tsx` 2802, `composer/index.tsx` 2685, `new-workspace-screen.tsx` 2599, `composer/input/input.tsx` 2086, `composer/agent-controls/index.tsx` 1991, `settings-screen.tsx` 1875, `panels/agent-panel.tsx` 1852, `ui/combobox.tsx` 1809, `workspace-desktop-tabs-row.tsx` 1746. Plus 72 `useIsCompactFormFactor` branches. Decomposition order for the overhaul: composer → transcript → sidebar → workspace shell.

## Improve first

Finding 1. Four lines, deterministic visual consequence, zero behavior risk — and it proves the token pipeline before the decomposition phases touch the same files.
