# Ultimativer Audit-Prompt — ProgressLab (ZHAW Prototyping, FS26)

> **Einsatzweise:** Diesen Prompt **komplett** in ein neues Coding-Agent-Fenster (Claude Code, Codex,
> Cursor, etc.) einfügen. Der Agent erhält damit den vollständigen Auftrag: Live-App, Repo und Doku
> systematisch gegen die ZHAW-Bewertungskriterien zu prüfen, alle Lücken zwischen IST und
> SOLL für die Note **6** zu identifizieren und priorisierte Patch-Vorschläge zu liefern.
>
> **Sprache:** Deutsch. **Tonalität:** direkt, technisch, ehrlich. Kein Lob ohne Beleg.

---

## 0. HARTE REGELN (NICHT VERHANDELBAR)

1. **KEIN Netlify-Deploy ohne explizites „Go" von Andi.** Der Netlify-Account hat bereits **>50 % der
   Build-Credits aufgebraucht**. Folgendes ist **strikt verboten**, solange Andi nicht in derselben
   Konversation wörtlich „push to Netlify ok", „deploy ok" oder Äquivalent sagt:
    - `git push` auf `main` oder einen Branch, der ein Netlify-Deploy triggert.
    - `netlify deploy` / `netlify deploy --prod` / `npx netlify-cli deploy`.
    - Aktivieren/Reaktivieren von Auto-Publish in `netlify.toml` oder via Netlify-Dashboard.
    - Trigger über GitHub-Actions, die Netlify-Builds anstossen.
2. **Lokale Builds (`npm run build`, `vite build`) sind erlaubt**, solange sie nichts in die Cloud schieben.
3. **Commits lokal sind erlaubt**, aber **nicht pushen**, bis Andi grünes Licht gibt. Vor jedem `git push`
   ausdrücklich nachfragen: *„Soll ich pushen? Das löst potenziell einen Netlify-Build aus."*
4. **`.env` / Secrets / MongoDB-Connection-Strings niemals committen oder loggen.** Vor jeder Änderung
   prüfen, ob `.gitignore` die Datei wirklich schützt.
5. **Keine destruktiven DB-Operationen** auf der Atlas-Live-DB. Nur lokale DB anfassen
   (`mongodb://localhost:27017` oder lokale Atlas-Sandbox). Seeds erst nach Nachfrage.
6. **Wenn ein Schritt unklar ist: nachfragen statt raten.** Andi ist Wirtschaftsinformatik-Student
   im 4. Semester Teilzeit — er erwartet, mitentscheiden zu können, nicht überrumpelt zu werden.

---

## 0.5. STAND DER VOR-AUDITS (BEREITS ADRESSIERT — NICHT DOPPELT ZÄHLEN)

> **Stand:** 21.05.2026, Commit-Range `97a8c45..fc96c3e` auf lokalem `main`,
> **noch nicht gepusht**. Quellbericht: [`docs/audit/audit-2026-05-21.md`](../audit-2026-05-21.md).

Dieser Prompt wurde bereits einmal (von Claude) durchlaufen. Das Audit hat **12 Findings**
identifiziert; **11 davon sind in 11 lokalen Commits** umgesetzt — siehe Tabelle unten.
Bevor du eigene Findings notierst: prüfe pro Punkt, ob dein Befund schon hier steht.

### Adressiert (lokale Commits, noch nicht gepusht)

| ID | Severity | Titel | Commit | Verifizierbar via |
|---|---|---|---|---|
| FIND-001 | High | ADR-0005 widersprach Code (network-only vs. network-first) | `97a8c45` | Lies `docs/adr/0005-pwa-custom-service-worker.md` (Status revidiert) + neuer `docs/adr/0007-service-worker-network-only-fuer-api.md` |
| FIND-002 | High | A11y-Audit-Bericht zeigte 7/7, Spec hat 8 Pages | `50e4889` | `docs/a11y-audit.md` zeigt 8/8 inkl. Profile |
| FIND-004 | High | KI-Deklaration §6.3 zu generisch | `c7b8d83` | README §6.3 hat jetzt konkrete Eigenleistung + Tool-Aufteilung + 3 abgelehnte KI-Vorschläge |
| FIND-005 | Medium | Tab-Favicon zeigte Svelte-Default statt ProgressLab-Logo | `b12c43e` | `ProgressLab/src/lib/assets/favicon.svg` hat jetzt das Teal-Logo |
| FIND-006 | Medium | `/api/plan/generate` ohne Rate-Limit | `9fc71f8` | `checkRateLimit(`plan:${userId}`, 5, 60_000)` aktiv |
| FIND-007 | Medium | Profile-PUT clampte silent statt 400 | `dfec359` | `profile-service.normalizeProfileInput` nutzt jetzt `strict*`-Validators mit 400-Errors |
| FIND-008 | Medium | Audit-Prompts lagen ungetracked am Repo-Root | `60b3d69` | jetzt in `docs/audit/prompts/`, Index in `docs/audit/README.md` |
| FIND-009 | Low | `npm run seed` ohne Warnung vor `deleteMany({})` | `599e325` | seed-Skript verlangt `PL_SEED_CONFIRM=1` (CI in `.github/workflows/ci.yml` ist angepasst) |
| FIND-010 | Low | Keine TL;DR-Übersicht im README | `73115a2` | README hat 7-Punkt-Block direkt nach Titel |
| FIND-011 | Low | Phase 3.1 ohne konkrete Persona | `73115a2` | Proto-Persona „Marc, 27, Marketing" im README §3.1 |
| FIND-012 | Nit | `isSmallStepExercise` Heuristik ohne Erklärung | `fc96c3e` | Codekommentar in `recommendation.ts` über Trade-off + produktivem Folge-Schritt |

### Noch offen

| ID | Severity | Titel | Warum offen | Empfohlene Aktion |
|---|---|---|---|---|
| **FIND-003** | High | **Walkthrough-Video fehlt komplett** | Muss Andi selbst aufnehmen (Bildschirm, Voice-over). | 5–10 min Walkthrough mit allen 17 Erweiterungen, in finaler Abgabe-PR mitliefern. Keine Code-Action für dich. |

### Sekundär-Effekte, die du als Codex prüfen kannst (nicht im ersten Audit aufgenommen)

1. **Type-Check / Lint / Tests sind sauber nach allen 11 Commits** (`npm run check`, `npm run lint`,
   `npm run test:unit`, `npm run test:e2e` lokal alle grün). Wenn du etwas anderes findest, ist
   das ein neuer Befund.
2. **Strict-Profile-Validator (FIND-007) ändert API-Verhalten:** ungültige Eingaben werfen jetzt 400
   statt 200 mit gecaptem Wert. Falls ein Frontend-Stelle implizit auf das alte clamp-Verhalten
   vertraut hat (z. B. eine Form, die einen User „still" speichert), wäre das ein Folge-Bug —
   gerne prüfen.
3. **Seed-Bestätigung (FIND-009)** erfordert `PL_SEED_CONFIRM=1`. CI ist angepasst, lokale Setup-
   Doku im README ebenfalls. Falls Andis lokale Dev-Aliases / VS-Code-Tasks existieren, die `npm
   run seed` ohne Env aufrufen, würden sie jetzt mit Exit 2 abbrechen — checken.
4. **ADR-0007 ist neu** und sollte mit dem Code-Verhalten (Service-Worker `network-only` für API
   und HTML) konsistent sein. Verifiziere mit Browser-DevTools → Application → Service Workers.
5. **README ist auf 17 Erweiterungen + TL;DR-Block + neue Persona angewachsen.** Anker im
   Inhaltsverzeichnis prüfen, ob alle Links noch zielen.

### Konkrete Marschroute für dich (Codex)

1. **Lies erst `docs/audit/audit-2026-05-21.md` durch** — kompletter Befundbericht der ersten Runde.
2. **Verifiziere stichprobenartig 2–3 Fixes aus der Tabelle oben** (öffne die Dateien, prüfe
   ob die Behauptung im Code wirklich steht). Notiere als „bestätigt" oder als neues Finding,
   falls etwas nicht passt.
3. **Suche gezielt nach** den oben genannten Sekundär-Effekten.
4. **Suche neue Befunde** in den Bereichen, die der erste Audit nicht oder nur leicht abgedeckt
   hat:
   - **Performance:** Lighthouse-Run gegen Live-URL (read-only) + lokaler Build-Size-Check.
   - **Mongoose-Aggregation-Pipelines:** `stats-service.ts`, `records-service.ts` —
     N+1, ungetypte Pipelines, Sort-Keys.
   - **Service Worker:** Cache-Strategie unter Last (`/_app/immutable/*`-Hash-Wechsel beim
     nächsten Build), Stale-Asset nach Logout/Login.
   - **UI:** Mobile-Bottom-Tab-Bar bei Browser-Notch (`env(safe-area-inset-bottom)`)
     bereits drin — manuell auf iPhone-Simulator gegenchecken.
   - **Coach-ID-Generierung:** Limitations-Substring-Matching ist brittle wie
     `isSmallStepExercise` — gleiches Trade-off, vielleicht ähnlich kommentieren.
5. **Liefere deinen Bericht ergänzend, nicht parallel.** Schreibe ihn nach
   `docs/audit/audit-codex-YYYY-MM-DD.md`, mit Verweis auf den ersten Bericht. Halte dich an das
   §7-Format (Executive Summary → Befund-Liste → Kriterien-Checkliste → Roadmap), aber lass
   alle erledigten Findings aus — referenziere stattdessen die Tabelle oben.
6. **Push/Deploy:** keine. Punkt. Auch keine `git push`-Vorbereitung im Hintergrund. Andis
   Final-Deploy ist gebündelt geplant, nachdem das Video fertig ist.

### Wenn du etwas Widersprüchliches findest

- Wenn dieser Prompt mit `docs/audit/audit-2026-05-21.md` kollidiert: der **Code/Repo-Stand**
  ist die Wahrheit, beide Berichte sind Beobachtungen darauf.
- Wenn dein Befund einen bereits gefixten Finding **anders** beurteilt (z. B. „die strict-Validation
  ist zu hart, sollte aussagekräftigere Fehler-IDs liefern"): trage es als **neuen Befund mit
  Verweis auf die Vor-Audit-ID** ein, **nicht** als „erledigt".

---

## 1. ROLLE & ZIEL

Du bist **Senior Engineering Lead + akademischer Reviewer** für eine Studienarbeit im Modul
**Prototyping** (ZHAW School of Management and Law, BSc Wirtschaftsinformatik, 4. Semester Teilzeit,
FS26). Dein Auftrag:

> **Stelle systematisch fest, was zwischen dem aktuellen IST-Zustand der Abgabe und der bestmöglichen
> Note (Schweizer Notenskala: 6.0) fehlt — und liefere einen priorisierten, umsetzbaren Plan, der
> diese Lücke schliesst, ohne Netlify-Credits zu verbrennen.**

Das Endergebnis dieses Audits ist ein Befundbericht in vier Teilen (siehe §7 Output-Format), nicht
ein wildes Drauflos-Refactoren. Code-Änderungen werden erst nach Freigabe der Befunde geplant und
ausgeführt.

---

## 2. PROJEKT-IDENTITÄT

**Was ist ProgressLab?** Webbasierte Trainings-App. Loggt jeden Krafttraining-Satz mit
Gewicht/Reps/RPE und liefert pro Übung eine evidenzbasierte **Coach-Empfehlung** für die nächste
Session (autoreguliert über RPE statt starrer Pläne wie „5×5"). Zielgruppe: Hobby-Kraftsportler:innen
mit 2–4 Trainings/Woche.

**Empfehlungs-Heuristik:**

- Ø RPE ≤ 7 → **+2.5 kg** (bzw. +1 Rep bei Bodyweight)
- Ø RPE 7–8.9 → **Gewicht halten**
- Ø RPE ≥ 9 → **Deload um 10 %**

**Quellen, die der Agent ZWINGEND inspizieren muss:**

| Quelle | URL / Pfad | Was prüfen |
|---|---|---|
| Live-App (Netlify) | <https://progresslab.netlify.app/> | Funktioniert alles? Login, Dashboard, Session-Logging, Charts, Admin, Mobile-View, A11y |
| GitHub-Repo (public) | <https://github.com/AndiZHAW/progresslab> | Code, Commits, Branches, Actions, Issues |
| Lokales Repo (Andis Maschine) | `C:\Users\andik\OneDrive\ZHAW\4. Semester\Prototyping\Projekt\` | Tatsächlicher Stand — kann von GitHub abweichen, falls noch nicht gepusht |
| README (Pflicht-Doku) | `./README.md` | Vollständig gegen die 13 ZHAW-Kriterien? |
| Bestehender Code-Review-Prompt | `./CODEX_REVIEW_PROMPT.md` | Querprüfen, ob Befunde von dort schon adressiert sind |
| ADRs (6 Stück) | `./docs/adr/0001…0006*.md` | Sind Entscheidungen sauber begründet und konsistent mit Code? |
| A11y-Audit | `./docs/a11y-audit.md` | WCAG 2.1 AA — Behauptungen vs. realer Code |
| Methodische Artefakte | `./docs/artefakte/` (Ideenfindung, Skizzen Woche 9, UI-Prototyping Woche 10) | Sind alle Design-Sprint-Phasen belegt? |
| Usability-Evaluation | `./docs/evaluation/` (Testaufgaben, Feedback-Grid, Protokolle, Issue-Map, Screenshots) | Vollständig dokumentiert? Sind Issues in Code/Doku zurückgeflossen? |
| Moodle | (Andi muss bei Bedarf die genaue Aufgabenstellung & Bewertungs-Rubrik nachreichen) | Verbindlich für jeden konkreten Anspruch |

> **Hinweis vom Auftraggeber:** *„Massgeblich sind die im Unterricht und auf Moodle kommunizierten
> Anforderungen."* Wenn der Agent Punkte aus Moodle nicht kennt, **explizit nachfragen**, statt
> Anforderungen zu erfinden.

---

## 3. TECH-STACK (für gezielte Code-Reviews)

- **Frontend:** SvelteKit 2 + **Svelte 5 (Runes: `$state`, `$derived`, `$effect`, `$props`)**,
  TypeScript, eigene CSS in `src/app.css`, **Chart.js 4**, Inter (Fontsource).
- **Backend:** SvelteKit Server-Routes (`+server.ts`, `+page.server.ts`), **Mongoose 9** auf
  **MongoDB Atlas Free Tier**.
- **Auth:** Eigene Session-Cookie-Auth mit `bcryptjs` (kein Lucia, kein Better-Auth — bewusst,
  siehe ADR-0003).
- **Hosting:** Netlify via `@sveltejs/adapter-netlify`, Build-Base `ProgressLab/`.
- **Tests:** Playwright (E2E + axe-core A11y-Regression).
- **PWA:** Custom Service Worker (`src/service-worker.ts`, siehe ADR-0005).
- **Repo-Layout:** Doku am Repo-Root, App-Code im Subfolder `ProgressLab/` (siehe ADR-0006).

**Demo-Logins:**
- User: `demo` / `demo1234`
- Admin: `admin` / `admin1234` (auf Live read-only, lokal voll)

---

## 4. DIE 13 ZHAW-BEWERTUNGS­KRITERIEN — VOLLSTÄNDIG PRÜFEN

Für jedes Kriterium liefert der Agent eine harte Bewertung: **erfüllt / teilweise / fehlt**,
inklusive Beleg (Pfad + Zeilennummer, URL, Screenshot-Beschreibung).

1. **Ausgangslage & Lösungsidee** sauber dokumentiert (README §1–2).
2. **Design-Sprint-Phasen** alle durchlaufen + Artefakte vorhanden: Understand & Define → Sketch
   → Decide → Prototype → Validate (README §3, `docs/artefakte/`).
3. **Funktionaler Prototyp deployed & erreichbar** (Netlify-URL live, keine 500er, keine
   kaputten Pfade).
4. **Persistenz** mit echter Datenbank (MongoDB Atlas).
5. **CRUD vollständig** auf mind. einer Domain-Entität (hier: Exercises Admin, Sessions User,
   Templates User). Prüfen: alle vier Operationen wirklich funktional, auch DELETE?
6. **Authentifizierung** mit Rollen (User vs. Admin) — und Authorization wirklich serverseitig
   geprüft, nicht nur Layout-Switch.
7. **Validierung** Client + Server (mind. nicht-triviale Felder: Gewicht ≥ 0, Reps ≥ 1,
   RPE 1–10, Notiz ≤ 500 Zeichen).
8. **Visualisierung** der Daten (Charts/Trends pro Übung, Sparkline auf Dashboard).
9. **Responsive Design** (Mobile 320–768 px + Desktop ≥ 1024 px, keine Overflow-Brüche).
10. **Methodische Artefakte:** ADRs (≥ 1), Usability-Evaluation (Testaufgaben + Feedback-Grid +
    Protokolle), A11y-Audit als Bonus.
11. **README-Vollständigkeit:** Setup lauffähig (Klonen → `.env` → `npm i` → `npm run seed`
    → `npm run dev` ohne Stolpersteine), MongoDB-Schema beschrieben, Tests dokumentiert,
    KI-Deklaration vorhanden.
12. **KI-Deklaration:** Welche KI-Tools wie genutzt, mit Reflexion (eigene Leistung vs.
    KI-Beitrag, kritisches Hinterfragen).
13. **Erweiterungen** über das Pflicht-Set hinaus. README §4 listet 16 Erweiterungen — der Agent
    verifiziert pro Erweiterung im Code, ob sie **tatsächlich** vorhanden ist (nicht nur erwähnt).

---

## 5. REVIEW-SCOPE (Voll-Audit — keine Bereiche auslassen)

### A. Live-App-Audit (über die Netlify-URL, **ohne Deploy zu triggern**)

> Browser-Tools nutzen (oder Playwright lokal gegen die Live-URL, ohne sie zu modifizieren).
> Erlaubt: GET-Requests, normale Bedienung als Demo-User. Verboten: Lasttests,
> Brute-Force-Versuche, irgendetwas, das einen Build oder Function-Call-Spike erzeugt.

Checkliste:
- Landing/Login lädt < 3 s, keine Console-Errors.
- Login mit `demo` / `demo1234` funktioniert; falsche Credentials werfen sinnvollen Fehler.
- Dashboard zeigt Kachelübersicht, Sparklines, Push/Pull/Legs-Filter, Empfehlungen.
- Übungs-Detailseite: Verlaufschart, History, „nächste Empfehlung".
- Session-Workflow End-to-End: Übung wählen → Sätze loggen → Bestätigung → Dashboard
  aktualisiert.
- Admin-Login (`admin` / `admin1234`): CRUD auf Exercises (UI sichtbar). Achtung: auf Live
  read-only — Erwartungs-State dokumentieren.
- Logout / Session-Expiry funktioniert.
- Mobile-Viewport (375 × 812 / 414 × 896) — DevTools-Device-Emulation. Keine Overflow-Brüche.
- Dark-Mode-Toggle (falls vorhanden) — kein Flash-of-Wrong-Theme.
- PWA-Manifest erreichbar (`/manifest.webmanifest`), Service-Worker registriert (DevTools →
  Application), Offline-Fallback (Network-Tab → Offline).
- Lighthouse-Score (Performance / A11y / Best Practices / SEO / PWA) als Referenz.
- 404-Seite vorhanden und sinnvoll.

### B. Code-Qualität (SvelteKit / TypeScript)

- TypeScript-Striktheit: `any` / unsichere Casts / `@ts-ignore`? `tsconfig.json` vs. Praxis.
- Svelte 5 Runes konsequent? Keine Legacy-`$:`-Reactivity-Mischungen.
- Trennung Server/Client: `$lib/server/*` nirgends im Client importiert (würde zu Build-Fail
  oder Secret-Leak führen).
- 14 Komponenten in `src/lib/components/` — saubere Verantwortung oder God-Components?
- Service-Layer DRY (`exercise-service.ts`, `stats-service.ts`, `records-service.ts`,
  `template-service.ts`).
- DTO-Mapping (`dto.ts`): `_id` sauber zu `id` serialisiert, keine Mongoose-Internals an Client.
- Magic Numbers im Recommendation-Algorithmus dokumentiert oder als Konstanten benannt.
- Toter Code, ungenutzte Imports/Exports.
- ESLint-Konfiguration (`eslint.config.js`) wird im CI / lokal sauber durchlaufen?
- Prettier-Config konsistent angewendet?

### C. Security

- **Auth (`src/lib/server/auth.ts`, `hooks.server.ts`, `src/routes/api/auth/*`):**
    - bcrypt-Rounds ≥ 10.
    - Session-Cookie: `httpOnly`, `secure`, `sameSite=lax|strict`, `path=/`, sinnvolle Expiry.
    - Session serverseitig validiert, nicht nur Cookie-Existenz.
    - Constant-time Compare beim Login (Timing-Attack-Schutz).
    - Rate-Limit / Brute-Force-Schutz auf `/api/auth/login`.
- **Authorization:** Jede API-Route prüft `userId` der Session vor DB-Zugriff. IDOR auf
  `/api/sessions/[id]`, `/api/templates/[id]` ausgeschlossen.
- **Admin-Routen** (`/admin/exercises`, `/api/exercises` POST/PUT/DELETE): Server-side
  Rollen-Check, nicht nur Layout-Check.
- **Input-Validation auf Server:** NoSQL-Injection (`$gt`, `$ne` als String), Mass-Assignment,
  Type-Confusion abgefangen.
- **CSRF:** SvelteKit-Default aktiv (`csrf.checkOrigin`) — auch für Form-Actions / API.
- **`.env` / MongoDB-URI** wirklich nur lokal, `.gitignore` schützt.
- **CSV-Export** (falls vorhanden): Formula-Injection (`=`, `+`, `-`, `@`) escaped.
- **Service Worker:** Cache leaked keine User-spezifischen Daten an anderen User auf
  geteiltem Gerät.
- **bcryptjs** statt `bcrypt`: Performance auf Netlify Functions akzeptabel?

### D. Datenmodell & DB

- Mongoose-Schemas (`Exercise`, `Session`, `Template`, `User`): sinnvolle Indizes, `unique`,
  `required`, Validatoren.
- Referenzen vs. embedded sinnvoll? Sets in Session embedded — passt zur Query-Last.
- `db.ts` Connection-Pooling auf Serverless korrekt (wiederverwendet, nicht pro Request neu).
- N+1-Queries in `stats-service.ts` / `records-service.ts`?
- Aggregation-Pipelines typisiert.

### E. Recommendation-Engine (`src/lib/server/recommendation.ts`)

- Algorithmus dokumentiert, RPE-Logik nachvollziehbar.
- Edge-Cases: keine vorherige Session, nur 1 Datenpunkt, alle RPE identisch, fehlende Werte,
  Bodyweight-Übung (kein Gewicht).
- Reine Funktion (ADR-0004) — Unit-Tests vorhanden? Wenn nicht: konkrete Test-Cases
  vorschlagen.
- Off-by-One bei „letzten N RPE".

### F. UI / UX

- Loading-States überall (Spinner / Skeleton).
- Error-States: DB-down, 401, 404 — Toast konsistent?
- Form-Validation: Server-Errors zurück in UI gespiegelt.
- Optimistic UI mit sauberem Rollback bei Server-Error.
- Dark-Mode (`theme.svelte.ts`): kein FOUC.
- Mobile-First: kein Layout-Bruch zwischen 320–768 px.
- Empfehlungs-Anzeige UX-konsistent (klare Zahl, klare Aktion).

### G. Accessibility (WCAG 2.1 AA)

- `docs/a11y-audit.md` vs. `tests/e2e/a11y.spec.ts` — Behauptungen vs. Realität.
- Chart.js: Tabellen-Fallback / `aria-label` / Text-Alternative.
- Tab-Reihenfolge logisch.
- Farb-Kontraste in `app.css`: WCAG AA (4.5:1 normal, 3:1 large) wirklich erfüllt.
- Skip-Link funktional.
- Live-Regions (`aria-live`) für Toasts.

### H. PWA / Service Worker

- Cache-Strategie: network-first für API, cache-first für Assets.
- SW-Versionierung invalidiert bei neuem Deploy.
- Offline-Fallback-Seite.
- Install-Prompt (`InstallPrompt.svelte`): Lifecycle, nicht aufdringlich.

### I. Tests

- Playwright-E2E in `tests/e2e/`: Coverage auf Login, Session-Logging, CRUD, Auth-Boundary.
- A11y-Test deckt alle Hauptseiten.
- Unit-Test für `recommendation.ts` (cheap-win-Empfehlung).
- CI: GitHub-Actions für Tests? Läuft Playwright in CI?
- Lokale Test-Runs reproduzierbar (`npm run test`)?

### J. README & Doku (PFLICHT)

- README gegen alle 13 ZHAW-Kriterien geprüft.
- Setup wirklich lauffähig — Trockenlauf-Mental-Test: „Jemand, der dieses Repo zum ersten
  Mal klont, schafft `npm run dev` in ≤ 10 min ohne Rückfragen."
- Inhaltsverzeichnis konsistent mit Überschriften.
- MongoDB-Schema-Sektion akkurat zum aktuellen Code.
- KI-Deklaration vorhanden, ehrlich, reflektiert (was war Andis Leistung, was war KI).
- Alle Links funktionieren (keine 404 auf `docs/artefakte/...`).

### K. ADRs

- 6 ADRs vorhanden (Template + 1–6). Querchecken: ist die Entscheidung im Code wirklich so
  umgesetzt? Hat die Begründung 4. Semester-Niveau (Trade-offs benannt)?

### L. Methodische Artefakte (Design-Sprint-Belege)

- Ideenfindung (Woche 8) → vorhanden.
- Skizzen / Crazy 8s (Woche 9) → vorhanden, mehrere Varianten erkennbar.
- UI-Prototyping (Woche 10) → vorhanden, Mockup vs. finale UI vergleichbar.
- Decide-Phase im README erklärt: warum welche Variante gewählt.

### M. Usability-Evaluation (`docs/evaluation/`)

- Testaufgaben formuliert.
- Feedback-Grid ausgefüllt (≥ 3 Testpersonen ist üblich für ZHAW; falls weniger:
  begründen).
- Protokolle vorhanden.
- Issue-Map: gefundene Issues → tatsächlich in Code/Doku zurückgeflossen?
- Nachfragen / offene Punkte aus `nachfragen.md` adressiert.
- Screenshots vorhanden.

### N. Git / Repo-Hygiene

- `.gitignore` schützt `.env`, `node_modules`, `build/`, `.svelte-kit/`, `test-results/`,
  Log-Files (`*.log`).
- Commits: sprechende Messages, keine `WIP`/`fix`-Wüste am Ende.
- Branching: aktueller Stand auf `main`?
- Keine Secrets in der Historie (`git log -p | grep -iE "mongodb\+srv|password|secret"`).

---

## 6. NOTEN-MAPPING (Schweizer Skala)

| Note | Bedeutung | IST-Indikator |
|---|---|---|
| 6.0 | hervorragend | Alle 13 Kriterien klar **erfüllt**, sichtbarer Mehrwert (Erweiterungen funktionieren, A11y-Audit, sauberer Code, Tests laufen, README ist Vorzeige-Niveau) |
| 5.5 | sehr gut | 13/13 erfüllt, aber kleinere Schönheitsfehler |
| 5.0 | gut | 11–12/13 erfüllt, einige teilweise |
| 4.5 / 4.0 | befriedigend / genügend | Lücken bei Tests, A11y oder Doku |
| < 4 | ungenügend | Kernkriterium fehlt (z. B. Deploy down, CRUD unvollständig) |

**Ziel:** Note **6.0**. Der Agent muss daher nicht nur „erfüllt" feststellen, sondern aktiv suchen,
wo es noch von „gut" auf „herausragend" geht — und zwar **mit konkreten Massnahmen**, die in
≤ 1 Studienwoche umsetzbar sind.

---

## 7. OUTPUT-FORMAT (vier Teile, in dieser Reihenfolge)

### TEIL 1 — Executive Summary (max. 250 Wörter)

- Gesamteindruck (1 Absatz).
- Erfüllungs-Score gegen die 13 ZHAW-Kriterien (z. B. „11/13 voll, 2/13 teilweise").
- Realistische Notenschätzung mit Begründung.
- Top-3-Risiken, die die 6 verhindern.

### TEIL 2 — Befund-Liste

Pro Befund:
- **ID:** `FIND-001`, fortlaufend.
- **Bereich:** A–N (siehe §5).
- **Severity:** `Critical` / `High` / `Medium` / `Low` / `Nit`.
- **Titel:** ein Satz.
- **Beleg:** Datei + Zeile **oder** URL + Screenshot-Beschreibung.
- **Beschreibung:** was ist falsch, was ist die Konsequenz für die Note.
- **Empfehlung:** konkret (Code-Snippet, Doku-Passus, neuer Test), nicht generisch.
- **Aufwand:** S (< 30 min) / M (30–120 min) / L (> 120 min).

**Severity-Definitionen:**
- **Critical:** Verhindert eine Note ≥ 4 (z. B. Deploy down, Auth-Bypass, fehlendes CRUD).
- **High:** Verhindert Note 6 (z. B. README-Lücke bei Bewertungskriterium, fehlende
  Server-Validation, fehlende A11y-Tests).
- **Medium:** Senkt von 6 auf 5.5 (Code-Smell, Lücke in Tests, kleine Doku-Inkonsistenz).
- **Low:** Polish (Naming, Konsistenz, Performance-Mikro-Optimierungen).
- **Nit:** Geschmackssache, optional.

### TEIL 3 — ZHAW-Kriterien-Checkliste (Tabelle)

| # | Kriterium | Status | Beleg | Lücke zur 6 |
|---|---|---|---|---|
| 1 | Ausgangslage & Lösungsidee | … | … | … |
| … | … | … | … | … |

### TEIL 4 — Roadmap zur Note 6 (priorisiert, max. 1 Studienwoche)

- **Heute (≤ 2 h):** kritische Fixes, die ohne Netlify-Deploy umsetzbar sind.
- **Diese Woche (≤ 8 h):** High-Severity-Findings.
- **Optional (Polish):** Medium / Low, falls Zeit bleibt.

Pro Eintrag: konkreter Schritt, betroffene Dateien, Aufwand, erwartete Wirkung auf die Note.
**Am Ende dieser Roadmap: explizite Nachfrage an Andi**, in welcher Reihenfolge er die Schritte
abnehmen will und **wann der einmalige Deploy auf Netlify stattfinden soll** (Credits-bewusst:
idealerweise ein einziger gebündelter Final-Deploy, nicht mehrere).

---

## 8. ARBEITSWEISE DES AGENTS

1. **Erst lesen, dann reden.** Vor der ersten Aussage: README, alle 6 ADRs, a11y-audit,
   evaluation-Ordner, CODEX_REVIEW_PROMPT.md, sowie `package.json`, `netlify.toml`,
   `svelte.config.js`, `hooks.server.ts`, alle Service-Files unter `src/lib/server/` gelesen.
2. **Live-App parallel öffnen** und durchklicken (siehe §5.A).
3. **Bestehende Befunde nicht doppelt zählen.** Wenn `CODEX_REVIEW_PROMPT.md` bereits etwas
   adressiert, das im Code schon erledigt ist, das im Audit als **„erledigt"** markieren.
4. **Bei jeder Unklarheit nachfragen.** Beispiele für legitime Rückfragen an Andi:
    - „Welche genauen Anforderungen stehen aktuell in Moodle? Gibt es eine konkrete Rubrik
      mit Punkten?"
    - „Wie viele Usability-Testpersonen sind im Modul vorgegeben (3? 5?)? "
    - „Gibt es eine Vorgabe zu Walkthrough-Video / Pflicht-Screenshots?"
5. **Nichts pushen.** Siehe §0. Lokale Commits nur in einem klar benannten Branch
   (`feat/audit-fixes-YYYY-MM-DD`).
6. **Reproduzierbar arbeiten:** Befehle, die ausgeführt werden, dokumentieren (Befehl + Output
   in einem Working-Log).
7. **Zeit für Verifikation einplanen.** Bevor ein Befund als „erledigt" markiert wird:
   relevanten Test laufen lassen oder im Browser nachprüfen.

---

## 9. WAS DER AGENT *NICHT* TUN SOLL

- Keine Marketing-Sprache, keine Selbst-Beweihräucherung.
- Kein Drauflos-Refactoring vor Befund-Freigabe.
- Keine neuen Libraries einführen, ohne den Trade-off in einem ADR-Vorschlag zu dokumentieren.
- Keine Architektur-Umbauten (z. B. Auth-Library wechseln) ohne Andis explizite Zustimmung —
  die bewussten Entscheidungen aus ADR-0003/0004/0005 stehen.
- Keine Behauptung ohne Beleg (Datei+Zeile oder URL+Screenshot).
- Keine Netlify-Deploys. Punkt.

---

## 10. KICK-OFF-FRAGEN AN ANDI (vor Audit-Beginn stellen)

1. „Hast du eine aktuelle Moodle-Rubrik / Aufgabenstellung als Datei, die ich verlinken oder
   gegenchecken kann?"
2. „Gibt es eine Punkte-Verteilung pro Kriterium (z. B. CRUD = 20 %, Doku = 15 %), oder ist
   die Bewertung holistisch?"
3. „Bis wann ist die Abgabe? (Datum + Uhrzeit)"
4. „Wurde das Walkthrough-Video schon abgegeben, oder steht es noch aus?"
5. „Welche Erweiterungen aus README §4 sind dir wichtig, und welche kann man fallen lassen,
   falls Zeit knapp wird?"
6. „Wieviele Netlify-Build-Minuten sind real noch übrig? Daraus leite ich ab, wieviele
   Final-Deploys budgetiert sind (Empfehlung: 1 gebündelter)."

Erst nach diesen Antworten beginnt der Agent mit dem strukturierten Audit.

---

**Ende des Prompts.**
