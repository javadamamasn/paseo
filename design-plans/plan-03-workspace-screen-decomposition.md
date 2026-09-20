# Plan 03 — workspace-screen Decomposition (4421 lines → shell + slices)

Commit: `accf5d09` (`main`). Analysis only — no code moved yet.
Rule: pure moves, zero behavior change. Execute only with a visual loop (debug APK on device); verify each slice before the next.

## Why

`packages/app/src/screens/workspace/workspace-screen.tsx` (4421 lines) mixes six
concerns. Sibling slices already live beside it (`workspace-desktop-tabs-row`,
`workspace-header-menu`, `workspace-new-tab-menu`, `explorer-sidebar*`), so new
files follow the existing convention, not a new one.

## Slices (in order — mobile-first, smallest blast radius first)

1. **`workspace-mobile-tabs.tsx`** — mobile tab switcher cluster, the Android
   daily path: `MobileActiveTabTrigger` (:425), `ResolvedMobileActiveTabTrigger`
   (:450), `switcherTriggerStyle` (:507), `MobileWorkspaceTabOption` (:511),
   `MobileWorkspaceTabSwitcher` (:639, memo), `MobileMountedTabSlot` (:791, memo),
   `useStableTabDescriptorMap` (:828). Move as-is; keep memo boundaries.
2. **`workspace-screen-helpers.ts`** — pure functions with no JSX: `trimNonEmpty`
   (:267), `decodeSegment` (:275), `getFallbackTabOptionLabel` (:304),
   `getFallbackTabOptionDescription` (:351), `getWorkspaceScripts` (:217),
   `getWorkspaceFileLocationFields` (:229), `buildWorkspaceFileLocation` (:239),
   `parsePaneDirection` (:1070), `getHostDisplayName` (:1209),
   `shouldInspectWorkspaceRecovery` (:1285), `paneLocalPlacement` (:1396),
   `canDetectPullRequest` (:1400), `buildWorkspaceTerminalScopeKey` (:1385).
   Add unit tests — currently untested because they were trapped in the screen.
3. **`workspace-header.tsx`** — header cluster: `WorkspaceHeaderProjectRow`
   (:914), `WorkspaceHeaderTitleBar` (:975), `buildWorkspaceHeaderCheckoutState`
   (:1164), `deriveWorkspaceHeaderFields` (:1184).
4. **`workspace-tab-actions.ts`** — hooks: `useCloseTabs` (:883),
   `useWorkspaceTerminalTabActions` (:1441), `useLastMainPane` (:1514),
   `resolveCommandCenterPanelTarget` (:1503).
5. **`workspace-route-gate.tsx`** — route/gate cluster (last, widest wiring):
   `useWorkspaceRouteActions` (:1214), `useResolvedWorkspaceRouteState` (:1251),
   `WorkspaceScreenGateFrame` (:1293), `WorkspaceContentProviders` (:1302),
   `WorkspacePanelContent` (:1316), `renderWorkspaceScreenGateShell` (:1330),
   `WorkspaceDocumentTitleEffect` (:485) + `WorkspaceDocumentTitleEffectSlot`
   (:1351), `shouldShowWorkspaceScreenHeader` (:1378).
6. What stays: `WorkspaceScreen` (:855) + `WorkspaceScreenContent` (:1533),
   provider wiring, and the file's StyleSheet. Themed leaves at :248-249 move
   with their first consumer slice.

## Verification (per slice)

- `oxlint` + `oxfmt --check` on moved + edited files (via `node`, Termux rule).
- App `tsc --noEmit` (via `node`, heap flag); only the pre-existing
  `draggable-list.native.tsx` error may remain.
- Existing suite if touched: `npx vitest run <file> --bail=1`, never the full suite.
- Behavior proof per slice: cold-start workspace, switch 3 tabs, rotate once,
  toggle theme — before/after video on the Android device (docs/qa.md bar).
- One slice per commit; never two slices in one diff.

## Out of scope

No visual changes, no new tokens/primitives, no Unistyles pattern changes, no
desktop-pane logic changes (`canRenderDesktopPaneSplits` untouched).
