# Water Tracker

A deep-blue, Didone-typographic hydration app (variant **A — Chalice**), implemented in
**React + Vite + TypeScript** from the Claude Design handoff below.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck (tsc -b) + production build to dist/
npm run preview  # serve the production build
```

## What's built

The polished single-app experience inside a realistic iPhone bezel:

- **Today (Chalice)** — the hero drop→fill mechanic: tap **Sip / Glass / Bottle (2 / 8 / 16 oz)**;
  the drop bursts, a droplet falls and splashes, the glass fills, the emerald progress ring +
  live `%` badge advance, and a gold celebration fires at the goal. Plus a non-judgmental
  time-of-day **pacing line** and a 7-day **weekly consistency** chart.
- **History** — 17-week calendar heatmap with a tap-to-open day detail popup.
- **Stats** — day-streak hero, weekly bars, and KPI cards.
- **Awards** — locked/unlocked badge grid.
- **Goal sheet** — stepper (32–160 oz) + reminder toggles, save / reset.

### Source map

- `src/ios/IOSDevice.tsx` — the iPhone frame (status bar, dynamic island, home indicator).
- `src/water/history.ts` — seeded demo history + date helpers.
- `src/water/useWaterApp.ts` — state, actions, and the derived view (port of the prototype's `renderVals`).
- `src/water/WaterApp.tsx` — screen container + ambient glow + tab bar + goal sheet.
- `src/water/screens/` — `TodayA`, `History`, `Stats`, `Awards`.
- `src/index.css` — keyframes (drop fall, splash, bubbles, sparks, …) and press feedback.

The original design bundle is preserved under `project/` and `chats/`.

---

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 2 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/WaterApp.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Water Drinking App Prototype` project files (HTML prototypes, assets, components)
