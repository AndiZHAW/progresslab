# Codex-Ergänzungs-Audit ProgressLab — 21.05.2026

- **Auditor:** Codex gemäss `docs/audit/prompts/ULTIMATE_AUDIT_PROMPT.md`
- **Auditierter lokaler Stand:** `07cf3dc` auf `main`
- **Remote/Live-Stand:** `origin/main` auf `da71bfd`, lokales `main` ist **12 Commits voraus**
- **Live-App:** <https://progresslab.netlify.app/>
- **Vorgehen:** Vor-Audit gelesen, 2–3 Fixes stichprobenartig verifiziert, lokale Checks ausgeführt, Live-App read-only per Playwright geprüft. **Kein Push, kein Deploy.**

Dieses Audit ergänzt `docs/audit/audit-2026-05-21.md`. Die dort bereits behobenen Findings werden nicht erneut als offene Mängel gezählt, ausser wenn die Nachprüfung zeigt, dass ein Fix nur teilweise greift.

---

## TEIL 1 — Executive Summary

ProgressLab ist lokal sehr nah an einer 6.0: Architektur, Tests, Doku, A11y, PWA, Rollenmodell und Erweiterungen sind über dem Mindestumfang. Gegen die 13 ZHAW-Kriterien ist der lokale Stand **13/13 erfüllt**, mit mehreren kleineren Risiken zur letzten Politur. Die realistische lokale Notenschätzung liegt bei **5.75–6.0**, falls die Moodle-/Video-Artefakte tatsächlich abgegeben sind.

Das grösste Risiko ist nicht der Code, sondern die Auslieferung: `main` ist nach `git fetch origin` **12 Commits vor GitHub/Netlify**. Damit fehlen auf GitHub und Live-App sehr wahrscheinlich mehrere wichtige Audit-Fixes, unter anderem A11y-Doku, KI-Deklaration, Favicon, Profile-Validation, Plan-Rate-Limit, Seed-Schutz und der Audit-Prompt-Index.

**Top-3-Risiken, die die 6 verhindern können:**

1. Lokale Final-Fixes sind nicht auf GitHub/Netlify (`git status --branch`: `ahead 12`).
2. ADR-0005 enthält trotz ADR-0007 noch widersprüchliche `network-first`-Passagen.
3. Live-Admin wirkt zuerst beschreibbar, obwohl der Demo-Admin erst nach Submit mit 403 als read-only erklärt wird.

---

## TEIL 2 — Befund-Liste

### FIND-CX-001

- **Bereich:** N / A / J
- **Severity:** High
- **Titel:** Lokaler Finalstand ist 12 Commits vor GitHub/Netlify.
- **Beleg:** `git status --short --branch` → `## main...origin/main [ahead 12]`; `git log origin/main..HEAD` listet `97a8c45` bis `07cf3dc`.
- **Beschreibung:** Lokal sind zentrale Audit-Fixes vorhanden, aber GitHub/Netlify kennen sie nicht. Da die Abgabe auf GitHub + Live-App bewertet werden kann, sehen Reviewer:innen potentiell den schwächeren Stand `da71bfd`.
- **Empfehlung:** Erst nach deinem expliziten Go genau **einen gebündelten Push** machen. Vorher lokal final prüfen: `npm run check`, `npm run lint`, `npm run test:unit`, `npm run build`; E2E nur gegen lokale Test-DB.
- **Aufwand:** S

### FIND-CX-002

- **Bereich:** K / H
- **Severity:** Medium
- **Titel:** ADR-0005 ist formal revidiert, enthält aber noch alte `network-first`-Argumentation.
- **Beleg:** `docs/adr/0005-pwa-custom-service-worker.md:20-21` fordert API-Requests `network-first`; `docs/adr/0005-pwa-custom-service-worker.md:53-60` begründet weiter einen Runtime-Cache. Der Code nutzt `networkOnly` in `ProgressLab/src/service-worker.ts:54` und `ProgressLab/src/service-worker.ts:63`; ADR-0007 beschreibt das korrekt.
- **Beschreibung:** Der Vor-Audit-Fix ist nur teilweise sauber: Status und neuer ADR stimmen, aber alte Abschnitte in ADR-0005 widersprechen weiterhin dem Code. Das ist kein Runtime-Bug, aber akademisch unsauber.
- **Empfehlung:** In ADR-0005 die Anforderungen und Begründung klar als “ursprüngliche Annahme, später revidiert” markieren oder die alten `network-first`-Abschnitte durch einen kurzen Verweis auf ADR-0007 ersetzen.
- **Aufwand:** S

### FIND-CX-003

- **Bereich:** A / F / UX
- **Severity:** Medium
- **Titel:** Live-Admin-Read-only wird erst nach fehlgeschlagenem Submit sichtbar.
- **Beleg:** README nennt den Live-Demo-Admin read-only (`README.md:9-10`, `README.md:252`, `README.md:599`). Admin-Page zeigt aber zuerst ein normales Formular (`ProgressLab/src/routes/admin/exercises/+page.svelte:72-150`). Live-Test: Login `admin/admin1234`, Submit “Codex Audit Should Not Create” → Error-Banner “Der öffentliche Demo-Admin ist in der Live-App read-only.”
- **Beschreibung:** Funktional ist der Guard korrekt (`ProgressLab/src/lib/server/demo-guard.ts:4-10`), aber die UI lässt Reviewer:innen erst in einen Fehler laufen. Das kann wie kaputtes CRUD wirken.
- **Empfehlung:** Auf `/admin/exercises` einen sichtbaren Hinweis anzeigen, wenn `data.user.username === 'admin'` und Production aktiv ist; optional Submit/Delete-Buttons disabled mit Erklärung. Dafür muss der Layout-User oder ein `readOnlyDemoAdmin`-Flag an die Page durchgereicht werden.
- **Aufwand:** S

### FIND-CX-004

- **Bereich:** I / D
- **Severity:** Medium
- **Titel:** Lokale E2E-Tests können mit aktueller `.env` gegen Atlas schreiben.
- **Beleg:** `.env` klassifiziert als `env_db=atlas` ohne Secret-Ausgabe; `ProgressLab/package.json:13` startet `playwright test` ohne Test-DB-Override; E2E-Flows loggen Sessions und generieren Pläne (`ProgressLab/tests/e2e/main-flow.spec.ts:68-84`, `ProgressLab/tests/e2e/main-flow.spec.ts:96-117`).
- **Beschreibung:** CI ist sauber isoliert (`.github/workflows/ci.yml` setzt `MONGODB_URI=mongodb://127.0.0.1:27017/progresslab_ci`), lokal kann `npm run test:e2e` aber gegen Atlas schreiben. Deshalb wurde E2E in diesem Audit bewusst nicht ausgeführt.
- **Empfehlung:** Entweder README klar ergänzen: “E2E nur mit lokaler MongoDB ausführen”, oder ein Script `test:e2e:local` mit explizitem lokalen `MONGODB_URI` ergänzen. Noch besser: `.env.test.example` dokumentieren.
- **Aufwand:** S–M

### FIND-CX-005

- **Bereich:** B / Security
- **Severity:** Medium
- **Titel:** Registrierung ist öffentlich und nicht rate-limited.
- **Beleg:** Login nutzt Rate-Limit in `ProgressLab/src/routes/api/auth/login/+server.ts:16-21`. Register hat keinen `checkRateLimit`-Aufruf in `ProgressLab/src/routes/api/auth/register/+server.ts:8-30`.
- **Beschreibung:** Ein Angreifer kann viele Accounts anlegen und dabei bcrypt-Hashes + MongoDB-Writes erzeugen. Für ein Studienprojekt kein Showstopper, aber für eine Security-bewusste Note-6-Abgabe ist die Lücke sichtbar.
- **Empfehlung:** `checkRateLimit(\`register:${getClientAddress()}\`, 3, 60_000)` vor DB-Zugriff ergänzen. Optional bei Erfolg nicht sofort clearen, damit Account-Spam gebremst bleibt.
- **Aufwand:** S

### FIND-CX-006

- **Bereich:** D / Performance
- **Severity:** Low
- **Titel:** Workout-Page macht pro Routine-Übung eine eigene Session-Query.
- **Beleg:** `ProgressLab/src/routes/workouts/[id]/+page.server.ts:26-45` ruft in `Promise.all` für jede Übung `Session.find({ userId, exerciseId })` auf.
- **Beschreibung:** Bei 5–6 Übungen ist das noch okay, aber es ist klassisches N+1-Query-Verhalten. Der Prompt nennt `stats-service.ts` und `records-service.ts`; dort wird bereits gebündelt geladen. Diese Page ist der verbleibende Performance-Polish.
- **Empfehlung:** Alle Sessions für `template.exercises.map(e => e.id)` einmal laden, per `Map<exerciseId, sessions[]>` gruppieren und daraus Empfehlungen bauen.
- **Aufwand:** M

### FIND-CX-007

- **Bereich:** A / UX
- **Severity:** Low
- **Titel:** Keine eigene 404-Seite vorhanden.
- **Beleg:** `rg --files ProgressLab/src/routes` zeigt kein `+error.svelte`; Live-Test `/does-not-exist` zeigt nur “404 Not Found” innerhalb des App-Layouts.
- **Beschreibung:** Nicht notenkritisch, aber der Audit-Prompt verlangt eine sinnvolle 404-Seite. Eine gebrandete Fehlerseite wirkt runder und kostet kaum Aufwand.
- **Empfehlung:** `ProgressLab/src/routes/+error.svelte` mit kurzer Erklärung und CTAs zu Dashboard/Login anlegen.
- **Aufwand:** S

---

## TEIL 3 — ZHAW-Kriterien-Checkliste

| # | Kriterium | Status | Beleg | Lücke zur 6 |
|---|---|---|---|---|
| 1 | Ausgangslage & Lösungsidee | erfüllt | `README.md:48-86` | keine |
| 2 | Design-Sprint-Phasen | erfüllt | `README.md:88-231`, `docs/artefakte/` | Moodle-Rubrik nicht lokal prüfbar |
| 3 | Deployed & erreichbar | erfüllt, aber Stand-Risiko | Live: `/` 303 → `/login`, `/login` 200; Playwright-Login erfolgreich | FIND-CX-001 |
| 4 | Persistenz MongoDB | erfüllt | `ProgressLab/src/lib/server/db.ts:1-16`, README Schema `README.md:617-624` | keine |
| 5 | CRUD | erfüllt | Sessions API `ProgressLab/src/routes/api/sessions/[id]/+server.ts:21-57`, Templates API `ProgressLab/src/routes/api/templates/+server.ts:14-39`, Admin Exercises API `ProgressLab/src/routes/api/exercises/+server.ts:15-44` | Live-Admin-Read-only besser erklären |
| 6 | Auth + Rollen | erfüllt | Cookie/Auth `ProgressLab/src/routes/api/auth/login/+server.ts:29-36`, Admin-Layout `ProgressLab/src/routes/admin/+layout.server.ts:4-7` | Register-Rate-Limit ergänzen |
| 7 | Client + Server Validation | erfüllt | Sets `ProgressLab/src/lib/server/validation.ts:22-44`, Profile strict `ProgressLab/src/lib/server/profile-service.ts:191-211` | keine |
| 8 | Visualisierung | erfüllt | Chart-Komponenten `ProgressChart`, `VolumeChart`, `CategoryDonut`, `TrainingHeatmap` | keine |
| 9 | Responsive Design | erfüllt | Mobile safe area `ProgressLab/src/app.css:421`, Tabbar `ProgressLab/src/lib/components/Nav.svelte:542` | keine |
| 10 | Methodische Artefakte | erfüllt | ADRs, A11y, Evaluation, Audit-Prompts unter `docs/` | ADR-0005 Resttext bereinigen |
| 11 | README vollständig | erfüllt | Setup `README.md:566-613`, Schema `README.md:617-624`, Tests `README.md:626-640` | finalen Push/Deploy-Stand synchronisieren |
| 12 | KI-Deklaration | erfüllt | `README.md:466-553` | keine |
| 13 | Erweiterungen | erfüllt | 17 Erweiterungen `README.md:237-424`; Code stichprobenartig verifiziert | keine |

---

## TEIL 4 — Roadmap zur Note 6

### Heute (≤ 2 h, ohne Push/Deploy)

1. **Remote-/Live-Stand bewusst entscheiden**  
   Betroffen: Git/GitHub/Netlify. Aufwand S. Wirkung hoch: verhindert, dass Reviewer:innen einen alten Stand sehen. Kein Push ohne dein Go.

2. **ADR-0005 Restwiderspruch bereinigen**  
   Betroffen: `docs/adr/0005-pwa-custom-service-worker.md`. Aufwand S. Wirkung mittel: Doku wirkt konsistent.

3. **Live-Admin-Read-only in der UI sichtbar machen**  
   Betroffen: `ProgressLab/src/routes/admin/exercises/+page.server.ts`, `+page.svelte`. Aufwand S. Wirkung mittel: Admin-CRUD wirkt nicht kaputt.

4. **Register-Rate-Limit ergänzen**  
   Betroffen: `ProgressLab/src/routes/api/auth/register/+server.ts`. Aufwand S. Wirkung mittel: Security-Härtung.

### Diese Woche (≤ 8 h)

1. **E2E-Test-DB lokal isolieren**  
   Betroffen: `package.json`, README, optional `.env.test.example`. Aufwand S–M. Wirkung: Tests reproduzierbar ohne Atlas-Risiko.

2. **Workout-N+1 entfernen**  
   Betroffen: `ProgressLab/src/routes/workouts/[id]/+page.server.ts`. Aufwand M. Wirkung: Performance-Polish.

3. **Custom 404-Seite ergänzen**  
   Betroffen: `ProgressLab/src/routes/+error.svelte`. Aufwand S. Wirkung: UX-Polish.

4. **Finale Live-Verifikation nach einem gebündelten Deploy**  
   Betroffen: Netlify. Aufwand S. Wirkung hoch. Erst ausführen, wenn du explizit sagst, dass Push/Deploy okay ist.

### Optional / Polish

- Lighthouse mit installiertem Tool nachholen. In diesem Audit war `lighthouse=not_installed`; Build-Grösse ist unkritisch (`build/_app/immutable`: 60 Files, ca. 665 KB).
- Offline-Fallback optisch branden statt Plain-Text-503 aus dem Service Worker.
- Admin-CRUD lokal im Video zeigen, wenn Live-Demo-Admin read-only bleibt.

**Frage an Andi:** Welche Reihenfolge willst du freigeben: erst die vier “Heute”-Punkte lokal fixen, oder zuerst nur FIND-CX-001 klären und danach bewusst genau einen Final-Push/Netlify-Deploy machen?

---

## Verifikations-Log

```text
git fetch origin                                  -> ok, kein Push
git status --short --branch                      -> main...origin/main [ahead 12]
curl.exe -I https://progresslab.netlify.app/     -> 303 /login
curl.exe -I https://progresslab.netlify.app/login -> 200
curl.exe -I /manifest.webmanifest                -> 200
Playwright live user smoke                        -> Login demo ok, Mobile Nav sichtbar, /profile ok, keine Console-Errors
Playwright live pages                             -> /, /stats, /records, /templates, /sessions, /profile ok
Playwright live admin                             -> Admin-Seite ok, Submit zeigt read-only-403
npm.cmd run check                                 -> 0 errors, 0 warnings
npm.cmd run lint                                  -> Prettier + ESLint ok
npm.cmd run test:unit                             -> 6/6 passed
npm.cmd run build                                 -> ok, adapter-netlify done
npm.cmd run test:e2e                              -> nicht ausgeführt: .env zeigt auf Atlas, Suite schreibt Daten
git log --all --no-textconv -G secret patterns    -> nur .env.example-Platzhalter, kein echter Secret-Fund
```
