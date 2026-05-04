# ADR-0001: SvelteKit + TypeScript als Tech-Stack

- **Status:** Accepted
- **Datum:** 2026-05-01
- **Beteiligte:** Andi Kadolli

## Kontext

Die ZHAW-Projektaufgabe (`PT Projekt - Anforderungen und Bewertung.pdf`) gibt
**SvelteKit** als Pflichttechnologie vor. Offen war damit nur, ob mit
**JavaScript oder TypeScript** und ob mit der aktuellen **Svelte 5
Runes-Syntax** oder mit der bisherigen Svelte-4-Reactive-Statements-Syntax
gearbeitet wird.

Constraints:

- Einzelarbeit, ca. 6 Wochen für Implementierung + Doku.
- Bewertungs-Rubrik gewichtet "nachvollziehbare Code-Struktur" mit 15 Punkten.
- Deployment auf **Netlify** vorgesehen → Adapter-Wahl muss kompatibel sein.
- Persistenz mit **MongoDB** vorgegeben → kein integriertes ORM-Tooling von
  SvelteKit.

## Entscheidung

**SvelteKit 2 mit Svelte 5 (Runes-Mode) und TypeScript.**

Konkret:

- `npx sv create . --template minimal --types ts --add prettier eslint sveltekit-adapter=adapter:netlify`
- `compilerOptions.runes = true` in `svelte.config.js` für alle Komponenten
  außerhalb von `node_modules`.
- `tsconfig.json` mit `strict: true`.
- `+page.server.ts` für SSR-Loads, `+server.ts` für REST-API-Endpoints.

## Begründung

**TypeScript statt JavaScript:**

- Mongoose-Dokumente, DTOs zwischen Server und Client und die Recommendation-
  Engine haben mehrere ineinander­greifende Datenformen — TypeScript fängt
  Inkonsistenzen beim Refactor (z. B. Umbau der `Recommendation`-Struktur
  während der Erweiterungen).
- `svelte-check` läuft als CI-Equivalent in `npm run check` und blockt
  fehlerhafte Builds.
- Kosten: minimal (kein zusätzliches Tooling, alle Editor-Features bleiben).

**Svelte 5 Runes statt Svelte 4:**

- Runes (`$state`, `$derived`, `$props`, `$effect`) machen Reaktivität
  explizit. Das war beim Theme-Toggle (`theme.svelte.ts`) und beim Toast-System
  (`toast.svelte.ts`) der entscheidende Faktor — Stores wären komplexer
  gewesen.
- `bind:value` mit `$state` ist robust und erspart manuelles Event-Handling.

**SvelteKit-Adapter Netlify:**

- Netlify-Plan ist im Free-Tier ausreichend (eigene Functions für API-Routes).
- Alternative `adapter-node` hätte einen separaten Hosting-Plan verlangt.

## Konsequenzen

**Positiv:**

- Type-Safety vom Mongoose-Schema bis zum Svelte-Component (über
  `InferSchemaType` und geteilte DTO-Typen in `src/lib/types.ts`).
- Form-Actions, API-Routes und Server-Loads in einem einzigen Framework —
  weniger Glue-Code als z. B. Next.js-Route-Handler + tRPC.
- `npm run check` läuft in <2 s und ist Teil der Definition-of-Done für jeden
  Commit.

**Negativ / Trade-offs:**

- Svelte 5 ist seit 2024 stable, aber die Community-Doku referenziert teils
  noch Svelte-4-Syntax. Mongoose-ESM-Imports brauchten einen Workaround
  (`mongoose.models` statt named export — siehe Commit `cccd1d4`).
- Netlify-Adapter bündelt jeden API-Endpoint als eigene Function — Cold-Start
  könnte bei steigender Last spürbar werden. Für den Prototyp irrelevant.
