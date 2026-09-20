# Plan 02 — `useUnistyles()` Out of Hot Android Rows

Commit: `d636abd7a4ce302e7ccb9eb6074f637c6dd4d83b` (`main`). Audit: `design-plans/android-ui-audit.md` finding 2.
Order: execute after Plan 01.

## Problem

`useUnistyles()` re-renders on every Unistyles runtime change and breaks downstream memo boundaries (`docs/unistyles.md`). It sits in per-row components on high-frequency stores, against the coding-standards rule that collection rows must not subscribe independently. Regenerate the full list at execution time:

```
rg -l "useUnistyles\(\)" packages/app/src --glob '!*.test.*'
```

(55 files at audit time.) Phase scope — Android daily path only, in this order:

1. `components/agent-list.tsx:182,344`
2. `components/agent-status-dot.tsx:25`
3. `components/context-window-meter.tsx:109`
4. `components/dictation-controls.tsx`
5. `composer/agent-controls/index.tsx`, `composer/agent-controls/mode-control.tsx`
6. `components/adaptive-modal-sheet.tsx`, `components/add-host-modal.tsx`, `hosts/host-chooser.tsx`, `components/compact-explorer-sidebar.tsx`
7. `screens/sessions-screen.tsx`, `screens/projects-screen.tsx`, `screens/settings-screen.tsx`, `screens/new-workspace-screen.tsx`

Desktop-only files (`desktop/**`, `*.electron.tsx`, `index.web.tsx`) are out of scope.

## Correction (per call site, in order)

1. `StyleSheet.create((theme) => …)` — default; feeds the value back through the `style` prop so the native ShadowRegistry updates with no React re-render.
2. Static literal / static import — only if the value is genuinely fixed (gap, animation distance).
3. `withUnistyles(Component)` — only for theme-reactive non-`style` props (`tint`, icon `color`, navigator options). Exemplars: `ThemedLoadingSpinner` + `foregroundMutedColorMapping` (`components/message.tsx:170,176,902`); themed lucide + stylesheet entry (`message.tsx:169,2572`).
4. There is no step 4. If none fit, file an issue and stop — never re-add the hook.

Also obey while touching these files: no module-scope materialized styles; themed backgrounds on wrapper `View`, never `contentContainerStyle`; never flatten Unistyles style arrays; `Animated.View` keeps static RN styles + inline theme values (the one sanctioned hook use).

## Verification (per file, before moving on)

- `npm run typecheck`, `npm run lint -- <file>`, `npm run format`.
- Existing suite for the file only if one exists: `npx vitest run <file> --bail=1` (never the full suite).
- Renderer/React profiling before/after on an agent-stream session per `docs/development.md`; cold-restart theme-toggle check (light↔dark) for stale paint per `unistyles.md` debugging section.
- QA evidence: before/after numbers if the hot path was touched (`docs/qa.md`, `docs/terminal-performance.md`).

## Out of scope

Plan 01 files (already done), file decomposition, new tokens/primitives, desktop/web-only call sites.
