# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the politically curious citizen who sees a poll ("party X at 31%") and wants to know what it means in seats in the Congreso de los Diputados. They often arrive from a shared link on mobile, and expect an answer in seconds without learning electoral law first.

Secondary: journalists and analysts running quick "what if" scenarios, and teachers explaining the Spanish electoral system. Their needs (provincial detail, D'Hondt tables, exports) must stay reachable, but decisions are optimised for the casual citizen first.

## Product Purpose

Simulador de Elecciones turns a vote estimate into the exact seat distribution of the Congreso (350 deputies, 52 constituencies, 3% per-constituency threshold, D'Hondt), computed as the LOREG prescribes. It exists because the gap between "% of vote" and "seats" is where most public misunderstanding lives, and existing tools are opaque about it.

Success: a user enters national shares, instantly sees the hemicycle and possible majorities, understands why each seat went where it did, and shares the scenario as a link.

## Positioning

Faithful and explainable: the engine reproduces official results seat for seat for every bundled election, and every seat can be traced back to its D'Hondt quotient. It is a simulator, never a forecast: the user supplies the estimate; the product ships no poll data or predictions.

## Operating Context

- Users register with email or username and password (Better Auth) to edit simulations or save them to a profile; shared scenarios remain public and read-only through their URL (with Open Graph hemicycle previews).
- Base election: July 2023 general election by default; 2019 (Apr, Nov) and 2016 bundled as alternatives and validation fixtures.
- Two input modes: national shares projected to provinces by proportional swing, and per-province overrides that lock a province.
- Reference data comes from official sources (Ministerio del Interior/Infoelectoral, BOE, INE, CNIG).

## Capabilities and Constraints

- v1 scope: Congreso only. Senado, autonómicas, municipales and europeas are out of scope.
- Committed views: hemicycle (176 majority line), provincial map with Canary Islands inset, coalition calculator, per-province D'Hondt detail.
- Seat engine runs in the browser; recalculation must feel instant (under 100 ms per edit).
- Usable from 360 px width; last two versions of major browsers.
- Spanish is the default locale; English UI is planned.
- User profile: username, province (INE code) and usage profile (citizen, journalist, teacher). Political affiliation or voting intention is never stored.
- Terminology: "bloc" is the user-facing party grouping of local candidacies; "Others" collects unmodelled votes and never wins seats.
- Open: custom domain. Vercel Web Analytics is active on the Hobby plan.

Full specification: `docs/PRD.md`.

## Brand Commitments

- Name: Simulador de Elecciones.
- Strict political neutrality: institutional, didactic tone with no editorial opinion, no favoured party, no loaded wording.
- A persistent "this is a simulation, not a forecast" notice is always visible.
- Party colours are user-editable per bloc and travel in the shared URL; no party is visually privileged by default.

## Evidence on Hand

- Official election results and seat tables (to be built into `data/elections` from Infoelectoral and BOE).
- No testimonials, users, press coverage or usage metrics exist; do not fabricate any.

## Product Principles

1. Exactness over approximation: if the engine disagrees with the official count, it is wrong.
2. Explain every seat: results are always traceable to the rule and quotient that produced them.
3. Neutral by construction: the product never suggests an outcome or favours a party.
4. Low friction: no setup, the link is the scenario.
5. Casual first, depth on demand: national % is the front door; provincial and D'Hondt detail sit one step deeper.

## Accessibility & Inclusion

WCAG 2.2 AA. Every chart has a table or text alternative, and colour is never the only signal (party colours alone must not carry meaning).
