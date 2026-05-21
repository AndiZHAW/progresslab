# Codex Review Prompt — ProgressLab (ZHAW Prototyping, FS26)

> Diesen Prompt **komplett** in Codex (ChatGPT) pasten. Codex bekommt damit alles, was es zum Voll-Review braucht: Repo-Links, Stack, Bewertungskriterien, Review-Scope, Output-Format.

---

## ROLLE

Du bist ein **Senior Code Reviewer & Engineering Lead** für eine Studienarbeit im Modul **Prototyping** (ZHAW, Wirtschaftsinformatik, 4. Semester, Teilzeit). Deine Aufgabe ist ein **Voll-Review** des Repos `progresslab`. Du gibst zuerst eine **strukturierte Befund-Liste** mit Severities ab, danach **konkrete Patch-Vorschläge** (Diff-Form) für die Top-Findings. Tonalität: direkt, technisch, ehrlich — kein Lob, das nicht verdient ist.

Sprache: **Deutsch** (Code-Kommentare/Bezeichner Englisch lassen, wo sie es sind).

---

## PROJEKT-KONTEXT

**Was ist ProgressLab?**
Webbasierte Trainings-App (SvelteKit + MongoDB). Loggt jeden Krafttraining-Satz mit Gewicht/Reps/RPE und liefert pro Übung eine evidenzbasierte **Coach-Empfehlung** für die nächste Session (autoreguliert über RPE statt starrer Pläne wie "5×5"). Zielgruppe: Hobby-Kraftsportler:innen mit 2–4 Trainings/Woche.

**Wichtige Links:**
- **Repository (GitHub, public):** https://github.com/AndiZHAW/progresslab
- **Deployte App (Netlify):** https://progresslab.netlify.app/
- **Demo-Login User:** `demo` / `demo1234`
- **Demo-Login Admin:** `admin` / `admin1234`

**Tech-Stack:**
- Frontend: **SvelteKit 2** + **Svelte 5** (Runes), **TypeScript**, Tailwind-frei (eigene CSS in `src/app.css`), **Chart.js 4** für Visualisierungen, Inter-Font (Fontsource).
- Backend: SvelteKit **Server-Routes** (`+server.ts`, `+page.server.ts`), **Mongoose 9** auf **MongoDB Atlas** (Free Tier).
- Auth: **Eigene Session-Cookie-Auth** mit `bcryptjs` (kein Lucia, kein Better-Auth — bewusst, siehe ADR-0003).
- Hosting: **Netlify** via `@sveltejs/adapter-netlify`, Build-Base `ProgressLab/`.
- Tests: **Playwright** (E2E + axe-core A11y-Regression).
- PWA: Custom Service Worker (`src/service-worker.ts`, siehe ADR-0005).

**Repo-Struktur (Root = Doku, Code im Subfolder, siehe ADR-0006):**
```
/
├── README.md                       # Projektdokumentation (Pflicht-Doku ZHAW)
├── netlify.toml                    # base = "ProgressLab"
├── docs/
│   ├── adr/                        # 6 Architecture Decision Records
│   ├── a11y-audit.md               # WCAG 2.1 AA Audit-Bericht
│   ├── artefakte/                  # Wochen 8–10 Abgaben (PDF/DOCX)
│   └── evaluation/                 # Usability-Test-Material + Protokolle
└── ProgressLab/                    # SvelteKit-App
    ├── src/
    │   ├── app.css, app.html, hooks.server.ts, service-worker.ts
    │   ├── lib/
    │   │   ├── components/         # 14 Svelte-Komponenten (Charts, Cards, Nav, …)
    │   │   ├── server/             # auth.ts, db.ts, dto.ts, recommendation.ts, *-service.ts
    │   │   │   └── models/         # Exercise, Session, Template, User (Mongoose)
    │   │   ├── format.ts, theme.svelte.ts, toast.svelte.ts, types.ts
    │   └── routes/
    │       ├── +layout.{svelte,server.ts}, +page.{svelte,server.ts}
    │       ├── admin/exercises/    # Admin-CRUD
    │       ├── api/auth/{login,logout,register}/+server.ts
    │       ├── api/exercises/{,[id]}/+server.ts
    │       ├── api/sessions/{,[id],export}/+server.ts
    │       ├── api/templates/{,[id]}/+server.ts
    │       ├── exercises/[id]/     # Detail-View
    │       ├── login/, register/
    │       ├── sessions/, stats/, records/, templates/, workouts/
    ├── tests/e2e/                  # Playwright + a11y.spec.ts
    ├── scripts/                    # seed.ts, generate-icons.ts
    └── package.json, playwright.config.ts, svelte.config.js, vite.config.ts
```

**ADRs (Architecture Decision Records) — alle in `docs/adr/`:**
1. SvelteKit + TypeScript als Tech-Stack
2. MongoDB Atlas + Mongoose statt relational
3. Eigene Session-Cookie-Auth statt Lucia/Better-Auth
4. Recommendation-Engine als reine Funktion (kein Cache, keine Collection)
5. PWA mit Custom Service Worker statt vite-plugin-pwa
6. Code im `ProgressLab/`-Subfolder, Doku am Repo-Root

---

## ZHAW-BEWERTUNGS­KRITERIEN (Modul Prototyping, FS26)

Die Studienarbeit wird gegen folgende Anforderungen bewertet (massgeblich sind die in Unterricht/Moodle kommunizierten Vorgaben). Prüfe explizit, ob der Code/die Doku jedes Kriterium **wirklich** erfüllt — nicht nur "ist im README erwähnt":

1. **Ausgangslage & Lösungsidee** sauber dokumentiert (README §1–2).
2. **Design-Sprint-Phasen** durchlaufen und Artefakte vorhanden: Understand & Define, Sketch, Decide, Prototype, Validate (README §3, `docs/artefakte/`).
3. **Funktionaler Prototyp deployed & erreichbar** (Netlify-URL muss live sein).
4. **Persistenz** mit echter Datenbank (hier MongoDB Atlas).
5. **CRUD vollständig** auf mind. einer Domain-Entität (hier Exercises Admin, Sessions User, Templates User).
6. **Authentifizierung** mit Rollen (User vs. Admin).
7. **Validierung** Client + Server (mind. nicht-triviale Felder).
8. **Visualisierung** der Daten (Charts/Trends).
9. **Responsive Design** (Mobile + Desktop).
10. **Methodische Artefakte:** ADRs, Usability-Evaluation (Testaufgaben, Feedback-Grid, Protokolle), ggf. A11y-Audit.
11. **README-Vollständigkeit:** Setup-Anleitung lauffähig (User klont → seedet → startet ohne Stolpersteine), MongoDB-Schema, Tests, KI-Deklaration.
12. **KI-Deklaration:** Welche KI-Tools wurden wie genutzt, Reflexion.
13. **Erweiterungen** über das Pflicht-Set hinaus (README §4 listet 16 Erweiterungen — prüfe, ob jede tatsächlich im Code existiert).

---

## REVIEW-SCOPE (Voll-Review)

Prüfe systematisch **alle** Bereiche und führe pro Bereich konkrete Checks aus:

### A. CODE-QUALITÄT (SvelteKit/TypeScript)
- TypeScript-Striktheit: Sind `any`/unsichere Casts verwendet? Stimmt `tsconfig.json` mit der Praxis überein?
- Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`) korrekt verwendet? Keine Legacy-`$:`-Reactivity-Mischungen?
- Trennung Server/Client: Wird `$lib/server/*` versehentlich im Client importiert?
- Komponenten-Verantwortung: Sind die 14 Komponenten in `src/lib/components/` sauber gekapselt oder gibt es Riesen-Komponenten mit zu viel Logik?
- Service-Layer: `exercise-service.ts`, `stats-service.ts`, `records-service.ts`, `template-service.ts` — DRY? Konsistente Fehlerbehandlung? Konsistente Rückgabetypen?
- DTO-Mapping: `dto.ts` — wird Mongoose `_id` sauber serialisiert? Keine Mongoose-Internals an Client geleakt?
- Magic Numbers / Magic Strings im Recommendation-Algorithmus (`recommendation.ts`)?
- Toten Code, ungenutzte Imports, ungenutzte Exporte?

### B. SECURITY
- **Auth (`src/lib/server/auth.ts`, `hooks.server.ts`, `api/auth/*`)**: 
  - bcrypt-Rounds adäquat (≥10)?
  - Session-Cookie: `httpOnly`, `secure`, `sameSite=lax|strict`, `path=/`, sinnvolle Expiry?
  - Wird die Session serverseitig validiert (nicht nur Cookie-Existenz)?
  - Schutz gegen Timing-Attacks beim Login (constant-time compare)?
  - Rate-Limiting / Brute-Force-Schutz auf `/api/auth/login`?
- **Authorization**: Prüfen alle API-Routen die `userId` der Session, bevor sie auf Daten zugreifen? IDOR-Risiko bei `/api/sessions/[id]`, `/api/templates/[id]`?
- **Admin-Routen** (`/admin/exercises`, `/api/exercises` POST/PUT/DELETE): Server-Side-Rollen-Check vorhanden, nicht nur Layout-Check?
- **Input-Validation auf Server** (nicht nur Client): Mongoose-Schema reicht oft nicht — werden böse Payloads (NoSQL-Injection via `$gt`-Operator, Mass-Assignment, Type-Confusion) abgefangen?
- **CSRF**: SvelteKit hat Default-Schutz, aber: ist er für die Form-Actions / API-Routen aktiv?
- **MongoDB-Connection-String** wirklich nur in `.env` (nicht commited)? `.gitignore` korrekt?
- **CSV-Export** (`/api/sessions/export`): Formula-Injection (Zelle beginnt mit `=`/`+`/`-`/`@`) escaped?
- **Service Worker** (`service-worker.ts`): Cache leaked keine User-spezifischen Daten an anderen User auf demselben Gerät?
- **bcryptjs** statt nativem `bcrypt` — performance/sicherheits-Implikation auf Netlify-Functions?

### C. DATENMODELL & DB
- Mongoose-Schemas (`Exercise`, `Session`, `Template`, `User`): sinnvolle Indizes? `unique`? `required`? Validatoren?
- Referenzen vs. embedded: Sind Sets in `Session` embedded — passt das zur Query-Last?
- `db.ts`: Connection-Pooling auf Serverless (Netlify Functions) — wird die Connection wiederverwendet oder pro Request neu geöffnet?
- N+1-Queries: Werden in `stats-service.ts` und `records-service.ts` aggregierte Queries genutzt oder pro Übung einzeln gezogen?
- Aggregation-Pipelines: korrekt typisiert?

### D. RECOMMENDATION-ENGINE (`src/lib/server/recommendation.ts`)
- Algorithmus dokumentiert? Quelle für die RPE-basierte Logik nachvollziehbar?
- Edge-Cases: keine vorherige Session, nur 1 Datenpunkt, alle RPE-Werte identisch, fehlende Werte?
- Reine Funktion (siehe ADR-0004) — werden Tests dazu existieren? Wenn nicht: Unit-Test-Vorschlag.
- Off-by-One bei den letzten N RPE-Werten?

### E. UI / UX
- Loading-States überall (Spinner/Skeleton)? `TileSkeleton.svelte`, `Spinner.svelte` konsistent eingesetzt?
- Error-States: was passiert bei DB-Down, 401, 404? Toast (`toast.svelte.ts`) konsistent?
- Form-Validation: Echo auf Server-Errors, oder nur Client?
- Optimistic UI bei Session-Edit/Delete (README §4.10): wird Rollback bei Server-Error sauber gemacht?
- Dark-Mode (`theme.svelte.ts`): Flash-of-Wrong-Theme (FOUC) auf Initial-Load?
- Mobile-First: bricht das Layout zwischen 320–768px?

### F. ACCESSIBILITY
- Audit-Bericht `docs/a11y-audit.md` und `tests/e2e/a11y.spec.ts` querprüfen — passen Behauptungen zu Code?
- Chart.js-Diagramme: Tabellen-Fallback / aria-label / Beschreibung als Text-Alternative?
- Fokus-Reihenfolge: tab-able durch alle interaktiven Elemente?
- Farb-Kontraste in `app.css`: WCAG AA (4.5:1 normal, 3:1 large) tatsächlich erfüllt?
- Skip-Link funktional?

### G. PWA / SERVICE WORKER
- `service-worker.ts`: Cache-Strategie (network-first für API, cache-first für Assets)?
- Versionierung: invalidiert der SW bei neuem Deploy?
- Offline-Fallback-Seite vorhanden?
- Install-Prompt (`InstallPrompt.svelte`): Lifecycle korrekt, nicht aufdringlich?

### H. TESTS
- Playwright-E2E in `tests/e2e/`: Coverage auf kritischen Pfaden (Login, Session-Logging, CRUD)?
- a11y-Test: deckt alle 7 Hauptseiten?
- Fehlt Unit-Test für `recommendation.ts`? (Wäre cheap-win-Empfehlung.)
- CI: Läuft Playwright auf Netlify-Deploy-Previews oder nur lokal? Existiert eine GitHub-Action?

### I. README & DOKU
- README ist **Pflicht-Doku** für die Bewertung. Prüfe gegen die 13 ZHAW-Kriterien oben.
- Setup-Anleitung wirklich lauffähig? (`.env.example` da, `npm run seed` dokumentiert, MongoDB-Atlas-Schritte für Reviewer:in klar?)
- Inhaltsverzeichnis konsistent mit Überschriften?
- KI-Deklaration vollständig (welche Tools, welche Verwendung, Reflexion)?
- Tote Links / Stale-Hinweise (z. B. "_[bitte URL nach git push ergänzen]_" — laut Repo schon gepusht, also fixen)?
- ADR-Links funktionieren?

### J. ADR-QUALITÄT
- Sechs ADRs (`docs/adr/0001`–`0006`): Status, Kontext, Entscheid, Konsequenzen, Alternativen wirklich vollständig?
- Stimmen die Entscheide mit dem aktuellen Code überein, oder sind sie inzwischen "deprecated, aber nicht markiert"?

### K. EVALUATION (Validate-Phase)
- `docs/evaluation/`: Testaufgaben, Feedback-Grid, Nachfragen vorhanden — sind ausgefüllte Protokolle in `docs/evaluation/protokolle/` da?
- Falls Protokolle existieren: Issue Map / Synthese im README dokumentiert?

### L. ERWEITERUNGEN (README §4.1–4.16)
- README listet 16 Erweiterungen — gehe jede durch und verifiziere im Code, dass sie wirklich existiert und funktioniert (Anker auf Datei/Komponente angeben).
- Erweiterungen, die nicht oder nur halb implementiert sind, als Finding flaggen.

---

## VORGEHENSWEISE FÜR DICH (CODEX)

1. **Klone das Repo lokal** (oder lies im Workspace, falls schon vorhanden):
   ```bash
   git clone https://github.com/AndiZHAW/progresslab.git
   cd progresslab
   ```
2. Lies zuerst die **README.md** komplett, dann alle **ADRs** in `docs/adr/`, dann `docs/a11y-audit.md`.
3. Geh dann den Code Datei für Datei durch — beginne bei `ProgressLab/src/lib/server/` (Security-kritisch), dann `routes/api/`, dann `routes/+page*.svelte`, dann `lib/components/`.
4. Lauf — falls dir möglich — `npm install && npm run check && npm run lint` und melde Compiler-/Lint-Findings.
5. Optional: `npm run test:e2e` (braucht laufende Mongo + dev-server).

---

## PHASE 0 — FUNKTIONALE-CHANGES-CHECK (Pflicht, vor allem anderen)

**Bevor** du irgendetwas anderes machst (keine Severity-Tabelle, keine Patches, kein README-Review), führe diesen Schritt aus:

1. Geh die App durch (Code + deployte Version) und identifiziere, ob **funktionale Änderungen** (= neue Features, geändertes Verhalten, geänderte User-Flows) sinnvoll oder nötig wären. Konkret beantworte:
   - Gibt es **Bugs/funktionale Lücken**, die zwingend behoben werden müssen, damit die App das im README versprochene Verhalten zeigt? (Pflicht zu fixen — fliesst in Severity-Tabelle.)
   - Gibt es **funktionale Verbesserungen oder neue Features**, die deutlich Wert bringen würden (z. B. Recommendation-Tuning, fehlende Edge-Cases, neue Flows, sinnvolle Erweiterungen)?
   - Gibt es **funktionale Vereinfachungen / Entrümpelungen** (Features im Code, die der User-Flow nicht braucht und die nur Komplexität bringen)?

2. Erstelle daraus eine kurze Liste **„Vorschläge für funktionale Changes"** (max. 8 Einträge), jeder Eintrag im Format:
   - **Titel** (1 Zeile)
   - **Was?** (1–2 Sätze: was würde sich für User ändern)
   - **Warum?** (1 Satz: welcher Use-Case / welches Problem)
   - **Aufwand:** XS / S / M / L
   - **Empfehlung:** "machen" / "optional" / "lassen"

3. **STOP und frage den User** wörtlich:
   > „Ich habe folgende funktionale Changes identifiziert: [Liste]. Soll ich einen / mehrere / keinen davon umsetzen, bevor ich mit dem reinen Code-/Security-/Doku-Review weitermache? Bitte antworte mit den Nummern der Changes, die ich umsetzen soll — oder mit ‚keine, weiter mit Review'."

4. **Warte auf Antwort.** Erst danach:
   - Falls der User Changes auswählt: umsetze sie (als Diff-Patches im üblichen Format), committe sie nicht automatisch, sondern zeige Diffs zur Freigabe.
   - Falls „keine, weiter mit Review": geh direkt zu **PHASE 1** (= TEIL 1 unten).

---

## PHASE 0.5 — iOS-DESIGN-FRAGE (nach Phase 0, vor dem eigentlichen Review)

Nachdem Phase 0 abgeschlossen ist (funktionale Changes geklärt), **frage den User** zusätzlich folgende Design-Frage **bevor** du mit dem inhaltlichen Review (Teil 1+) startest:

> „Bevor ich ins Detail-Review gehe: Macht aus deiner Sicht ein **iOS-typisches Design** (Human-Interface-Guidelines-Stil: SF-Pro-Schrift, weiche Cards mit subtilen Schatten, Pull-to-Refresh, Sheet-Modals statt Vollbild-Pages, Tab-Bar unten statt Top-Nav, native Toggle-/Slider-Optik, abgerundete Eingabefelder, Haptic-Feel-Animationen) für ProgressLab Sinn?
>
> **Pro iOS-Design:**
> - App wird primär mobil genutzt (Gym), PWA-Installation ist bereits implementiert → iOS-Look erhöht „native feel".
> - Zielgruppe Hobby-Kraftsportler:innen erwartet App-Optik, keine Web-Optik.
> - Ist als zusätzliche Erweiterung gut bewertbar im ZHAW-Modul.
>
> **Contra iOS-Design:**
> - Aktuelle Cream-/Inter-Optik (README §4.12) ist bereits poliert und konsistent.
> - Nicht-iOS-User:innen (Android, Desktop) finden iOS-Pattern teils befremdlich.
> - Aufwand: substantiell (CSS-Tokens, Komponenten-Rewrite Nav → Tab-Bar, Modal-Sheets, neue Form-Styles).
>
> Soll ich (a) einen kompletten iOS-Redesign-Vorschlag (Komponenten + Tokens + Migrationspfad) ausarbeiten, (b) nur einen leichten ‚iOS-inspired'-Touch (Akzent-Patches: Tab-Bar + Sheet-Modals, Rest bleibt), oder (c) Design so lassen und nur das normale Review machen?"

**Warte erneut auf Antwort.** Erst danach mit **PHASE 1** (TEIL 1 unten) starten.

---

## PHASE 1 — INHALTLICHES REVIEW

Erst jetzt mit dem unter **OUTPUT-FORMAT** beschriebenen Ablauf (Teil 1 → Teil 6) beginnen.

---

## OUTPUT-FORMAT (strikt einhalten)

### TEIL 1 — Executive Summary (max. 10 Zeilen)
- Gesamteindruck (1 Satz)
- Top-3 Risiken (Stichworte)
- Top-3 Stärken (Stichworte)
- Bewertungs-Schätzung gegen ZHAW-Kriterien: erfüllt / teilweise / fehlt

### TEIL 2 — Befund-Tabelle
Markdown-Tabelle, **nach Severity sortiert** (Critical → High → Medium → Low → Nit):

| # | Severity | Bereich | Datei:Zeile | Befund | Empfehlung |
|---|----------|---------|-------------|--------|------------|

Severities:
- **Critical** = Security-Bug, Datenverlust-Risiko, oder verfehlt ZHAW-Pflichtkriterium
- **High** = funktionaler Bug, fehlende Authorization, README-Lücke bei Bewertungs-Kriterium
- **Medium** = Code-Smell, Performance-Issue, UX-Defizit
- **Low** = Style, kleinere Doku-Lücke
- **Nit** = Geschmack

### TEIL 3 — Patch-Vorschläge für die Top-Findings
Für die **Top-5 bis Top-10 Findings** (Critical + High): jeweils ein konkreter Diff im Format

```diff
--- a/PATH
+++ b/PATH
@@ ...
- alter Code
+ neuer Code
```

Mit 1–2 Sätzen Begründung pro Patch.

### TEIL 4 — ZHAW-Kriterien-Checkliste
Tabelle: Kriterium | Status (✅ / ⚠️ / ❌) | Beleg im Repo | Empfehlung falls ⚠️/❌.

### TEIL 5 — Quick-Wins (≤ 30 min Aufwand)
Liste von 5–10 niedrig-hängenden Verbesserungen, die der Student vor Abgabe noch schnell mitnehmen kann.

### TEIL 6 — Strategische Empfehlungen
2–4 Absätze: Was würdest du, wenn der Student noch eine Woche hätte, als priorisierte Verbesserungen umsetzen? Begründet gegen die Bewertungskriterien.

---

## RAHMENBEDINGUNGEN

- Abgabe-Kontext: Studienarbeit, **nicht** Production. Trotzdem werden Security-Bugs als Critical eingestuft, weil sie auch in der Bewertung negativ auffallen.
- Sei **streng aber fair**: Lob nur, wo wirklich gut. Wenn etwas im README behauptet, aber im Code nicht eingelöst wird → Critical/High.
- Gehe davon aus, dass der Student **alleine** an dem Projekt sass (Einzelarbeit).
- Falls dir Code-Kontext fehlt: explizit als Annahme markieren ("ANNAHME: …"), nicht raten.
- Keine ausschweifenden Lob-Postambles. Direkt, präzise, umsetzbar.

**Los geht's. Starte mit TEIL 1.**
