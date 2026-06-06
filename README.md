# Projektdokumentation - ProgressLab

> Webbasierte Trainings-App, die nach jedem Krafttraining-Satz eine evidenzbasierte
> Empfehlung für die nächste Session liefert. Autoreguliert über RPE statt starrer Pläne.

**Deployte App:** <https://progresslab.netlify.app/>  
**GitHub-Repository:** <https://github.com/AndiZHAW/progresslab>

> **Demo-Login zum Ausprobieren:** `demo` / `demo1234`. Der Demo-Admin `admin` / `admin1234`
> ist lokal nach `npm run seed` voll nutzbar; auf der Live-App ist er aus Sicherheitsgründen read-only.

## TL;DR — Was zeigt diese App?

ProgressLab ist ein Web-Trainings-Coach: jeder Krafttraining-Satz wird mit Gewicht, Reps und
RPE (Anstrengungs-Skala 1–10) erfasst, und die App schlägt für die nächste Session konkrete
Werte vor. Highlights:

- **Coach-Empfehlung pro Übung** (`+2.5 kg`, halten oder Deload) basierend auf den letzten Sessions
- **Routinen + geführter Workout-Modus** mit Fortschrittsbalken
- **Statistik-Dashboard** mit Volumen pro Woche, Trainings-Streak und Heatmap der letzten 12 Monate
- **Personal Records** inklusive Epley-1RM-Schätzung
- **Coach-ID** generiert personalisierte Pläne aus Ziel/Erfahrung/Equipment/Einschränkungen
- **iOS-inspirierte UI**, Dark-Mode, PWA-installierbar, WCAG 2.1 AA verifiziert
- **18 Erweiterungen** (siehe §4), **37 E2E-Tests + 6 Unit-Tests** lokal abgesichert

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
   1. [Understand & Define](#31-understand--define)
   2. [Sketch](#32-sketch)
   3. [Decide](#33-decide)
   4. [Prototype](#34-prototype)
   5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang](#7-anhang)
8. [Setup-Anleitung](#8-setup-anleitung)
9. [MongoDB-Schema](#9-mongodb-schema)
10. [Tests](#10-tests)
11. [Methodische Artefakte](#11-methodische-artefakte)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

## 1. Ausgangslage

- **Problem:** Hobby-Kraftsportler:innen führen ihr Training oft ohne strukturiertes Feedback durch.
  Trainingspläne sind statisch (z. B. „5×5"), berücksichtigen aber weder Tagesform noch tatsächliche
  Leistung. Wer „nach Gefühl" trainiert, riskiert entweder Stagnation (zu vorsichtige Steigerung) oder
  Übertraining (zu ambitionierte Steigerung trotz hoher RPE-Werte). Tools wie Strong oder Hevy loggen
  zwar Sätze, geben aber keine konkrete Handlungsempfehlung für die nächste Session.
- **Ziele:**
  - Webbasierte App (SvelteKit), die jeden Trainingssatz mit Gewicht/Reps/RPE erfasst und persistiert.
  - Eine **Coach-Empfehlung** pro Übung für die nächste Session, basierend auf den letzten RPE-Werten.
  - Übersicht der gesamten Übungspalette mit Trend-Anzeige (steigend/stagniert/fallend).
  - Vollständiger CRUD-Workflow auf Übungen (Admin) und Sessions (User), persistiert in MongoDB.
  - Niederschwellige Bedienung: Eine Session inkl. drei Sätzen ist in unter einer Minute eingetragen.
- **Primäre Zielgruppe:** ambitionierte Kraftsportler:innen und Hybrid-Athlet:innen mit 3–5 Trainings
  pro Woche, die strukturierter vorgehen möchten als nach Bauchgefühl, aber kein Personal Coaching haben.
- **Weitere Stakeholder:**
  - Anfänger:innen, die durch klare Empfehlungen Sicherheit bei der Steigerung gewinnen.
  - Dozierende des Moduls Prototyping als Bewertende.

## 2. Lösungsidee

- **Kernfunktionalität:**
  - **Dashboard** mit Kachelübersicht aller Übungen, gefiltert nach Push/Pull/Legs, mit Sparkline
    (Top-Gewicht der letzten Sessions) und Empfehlung „was nächstes Mal".
  - **Übungs-Detailseite** mit Verlaufschart (Top-Gewicht und Ø RPE über alle Sessions) und
    History der letzten Trainings.
  - **Session-Workflow** in zwei Schritten: Übung wählen → Sätze loggen (Gewicht, Reps, RPE pro Satz)
    mit vorbefüllten Empfehlungs-Werten → Bestätigungsscreen mit aktualisierter Empfehlung.
  - **Empfehlungs-Engine** auf Basis der RPE-Heuristik:
    - Ø RPE ≤ 7: +2.5 kg (bzw. +1 Rep bei Bodyweight)
    - Ø RPE 7–8.9: Gewicht halten
    - Ø RPE ≥ 9: Deload um 10 %
- **Annahmen:**
  - Nutzer:innen kennen das Konzept der Rate of Perceived Exertion (RPE 1–10).
  - Eine einfache regelbasierte Empfehlung schlägt das fehlende Strukturgefühl beim Training „nach Gefühl".
  - Pro User reicht ein persönlicher Datenraum; Routinen bilden wiederkehrende Workouts ab, aber keine komplexe Periodisierung.
- **Abgrenzung:**
  - Kein Cardio-Tracking, keine Dehnübungen, kein Kalorien-/Ernährungs-Modul.
  - Keine Mobile-App; die Web-App ist responsive.
  - Keine mehrwöchigen Programme mit Periodisierung oder automatischer Kalenderplanung; Nutzer:innen
    können Sessions frei oder über einfache Routinen starten.

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define

- **Zielgruppenverständnis:** Ambitionierte:r Kraftsportler:in trainiert 3–5×/Woche, kennt RPE als Konzept, möchte
  kontinuierlich progredieren, scheitert aber an der Frage „soll ich heute mehr Gewicht ansetzen?".
  Bestehende Apps (Strong, Hevy, FitNotes) loggen, beraten aber nicht.

- **Proto-Persona Marc, 27:**
  Marketing-Angestellter, trainiert 3×/Woche im Quartier-Studio (Mo/Mi/Fr abends, je 60–75 min).
  Aktuelle Bestwerte: Bench Press 80 kg × 5, Squat 100 kg × 5, Deadlift 130 kg × 5. Ziel: in
  6 Monaten 100 kg Bench, ohne sich kaputt zu machen. Frustriert davon, dass er nach 3 Monaten
  „5×5"-Programm bei Bench stagniert und nicht weiss, ob er pushen oder runterfahren soll.
  Will im Training schnell tippen, **vor und nach jedem Satz** die Hände frei haben (Hantel-Griff,
  Magnesium) und nicht 2 Min durch eine UI scrollen.

- **Wesentliche Erkenntnisse:**
  - Eine konkrete Zahl als Empfehlung („+2.5 kg") senkt die kognitive Last beim Training.
  - Der Verlauf einzelner Übungen ist wichtiger als Gesamtstatistiken.
  - Drei Sätze als Default decken den häufigsten Use-Case ab.
- **Artefakte:** Siehe [`docs/artefakte/Ideenfindung_ProgressLab_Andi Kadolli.pdf`](docs/artefakte/Ideenfindung_ProgressLab_Andi%20Kadolli.pdf).

### 3.2 Sketch

- **Variantenüberblick:** In Woche 9 (Crazy 8s, Solution Sketch) wurden mehrere Varianten skizziert:
  klassisches Listen-Layout, Karten-Grid, Wochen-Timeline. Die finale Variante kombiniert Karten-Grid
  (Dashboard) mit Session-Workflow als Modal-Stack.
- **Skizzen:** Siehe [`docs/artefakte/Woche9_Skizzieren_Andi_Kadolli.docx`](docs/artefakte/Woche9_Skizzieren_Andi_Kadolli.docx) und [`docs/artefakte/Woche9_Aufgabe_Andi_Kadolli.pdf`](docs/artefakte/Woche9_Aufgabe_Andi_Kadolli.pdf).

### 3.3 Decide

- **Gewählte Variante & Begründung:** Karten-Grid + Push/Pull/Legs-Filter, weil dies den Übergang von
  „welche Übung trainiere ich heute" zu „welche Empfehlung gibt der Coach" am direktesten unterstützt.
- **End-to-End-Ablauf:** Dashboard → Übung wählen (Tile oder FAB-Picker) → Set-Logger → Bestätigung mit
  neuer Empfehlung → zurück zum Dashboard mit aktualisierten Tiles.
- **Mockup:** Klickbarer HTML-Prototyp [`ProgressLab_Prototyp.html`](ProgressLab_Prototyp.html) (Woche 10),
  Doku [`docs/artefakte/Woche10_UI-Prototyping_Andi_Kadolli.pdf`](docs/artefakte/Woche10_UI-Prototyping_Andi_Kadolli.pdf).

### 3.4 Prototype

#### 3.4.1. Entwurf (Design)

- **Informationsarchitektur:**
  - `/login`, `/register` – öffentlich
  - `/` – Dashboard (Kachel-Grid, Filter, Suche, Sortierung)
  - `/exercises/[id]` – Übungs-Detail (Empfehlung, Chart, History)
  - `/sessions` – Session-Übersicht (alle eigenen Sessions, gefiltert)
  - `/sessions/new` – Übungs-Picker (Schritt 1 von 2)
  - `/sessions/new/[exerciseId]` – Set-Logger (Schritt 2 von 2)
  - `/sessions/[id]/done` – Bestätigungs-Screen
  - `/stats` – Statistik-Dashboard mit Volumen, Streak und Heatmap
  - `/records` – persönliche Bestwerte je Übung
  - `/templates` – Routinen erstellen und starten
  - `/workouts/[id]` – geführter Workout-Modus für eine Routine
  - `/profile` – Coach-ID mit Ziel, Erfahrung, Trainingsfrequenz und Plan-Generator
  - `/admin/exercises` – Admin-only: Übungen anlegen, bearbeiten und löschen
- **User Interface Design:** iOS-inspirierte App-Optik mit neutralem Hintergrund, glasigem Header,
  Mobile-Bottom-Tab-Bar, klaren Cards, Segmented Controls und grossen Touch-Zielen. Das Dashboard
  wurde zusätzlich stärker in Richtung moderner Trainings-App gestaltet: dunkler "Heute trainieren"-
  Hero, horizontale Workout-Cards, visuelle Übungskarten und reduzierte, ruhige Flächen. Die
  Empfehlungs-Karte bleibt das zentrale Element; Sparklines und Chart.js-Verlaufscharts übernehmen
  die visuelle Idee aus dem Mockup.
- **Designentscheidungen:**
  - **Single-Spalten-Layout** statt Phone-Frame: Web-App soll auf Desktop und Mobile gleich gut
    funktionieren, deshalb Container mit `max-width: 960px`.
  - **FAB** ergänzend zur „+ Neue Session"-Schaltfläche, weil aus dem Mockup ein etabliertes Muster.
  - **Toasts** für nicht-blockierendes Feedback, Banner für Inline-Fehler.

#### 3.4.2. Umsetzung (Technik)

- **Technologie-Stack:**
  - **SvelteKit 2** mit Svelte 5 (Runes-Mode), TypeScript
  - **MongoDB Atlas** mit **Mongoose 9**
  - **Chart.js 4** für den Verlaufschart auf der Detail-Page
  - **bcryptjs** für Passwort-Hashes, eigene Session-Cookie-Auth (kein externes Auth-Paket)
  - **@sveltejs/adapter-netlify** für das Deployment
- **Tooling:** VS Code, Git/GitHub, Prettier + ESLint, `tsx` für Seed-Skript, MongoDB Atlas (Free Tier).
- **Struktur & Komponenten:**
  - Routen in `src/routes/` (Pages mit `+page.svelte`/`+page.server.ts`, API-Routes mit `+server.ts`)
  - Wiederverwendbare Komponenten in `src/lib/components/`:
    `ExerciseTile`, `FilterTabs`, `RecommendationCard`, `ProgressChart`, `SessionList`,
    `SetLoggerTable`, `Nav`, `Toaster`, `Spinner`
  - Server-Logik in `src/lib/server/`: `db.ts` (Mongoose-Connection-Singleton),
    `models/`, `auth.ts`, `recommendation.ts`, `profile-service.ts`, `exercise-service.ts`, `dto.ts`
  - Globaler Toast-State über `src/lib/toast.svelte.ts` (Svelte 5 Rune)
- **Daten & Schnittstellen:** MongoDB mit sieben Collections (Schema-Übersicht weiter unten).
  REST-artige API-Routes:
  - `POST /api/auth/{login,register,logout}`
  - `GET/POST /api/exercises` · `GET/PUT/DELETE /api/exercises/[id]`
  - `GET/POST /api/sessions` · `GET/PUT/DELETE /api/sessions/[id]` · `GET /api/sessions/export`
  - `GET/POST /api/templates` · `GET/PUT/DELETE /api/templates/[id]`
  - `GET/PUT /api/profile` · `POST /api/plan/generate`
  - `POST /api/planned-recommendations` · `DELETE /api/planned-recommendations/[exerciseId]`
- **Deployment:** <https://progresslab.netlify.app/> (Netlify, automatischer Build aus dem `main`-Branch via `netlify.toml` mit `base = "ProgressLab"`)
- **Besondere Entscheidungen:**
  - Eigenes minimales Auth statt Lucia/Better-Auth, weil der Scope das nicht rechtfertigt.
  - Recommendation als reine Funktion (`buildRecommendation`) – wird on-the-fly aus Sessions berechnet,
    damit keine inkonsistente Cache-Pflege nötig ist. Akzeptierte oder manuell angepasste Next-Session-
    Pläne werden separat als `plannedrecommendations` gespeichert und nach dem Logging verbraucht.

### 3.5 Validate

- **URL der getesteten Version:** lokal auf `main` mit `npm run dev` als primäre Review-Version;
  <https://progresslab.netlify.app/> dient bis zum freigegebenen nächsten Deploy nur als öffentliche Referenz.
  Screenshots der Usability-Evaluation liegen unter
  [`docs/evaluation/screenshots/`](docs/evaluation/screenshots/README.md); aktuelle lokale
  Final-Screenshots vor dem gebündelten Deploy liegen unter
  [`docs/evaluation/screenshots-final-local/`](docs/evaluation/screenshots-final-local/README.md).

- **Ziele der Evaluation:**
  - Verstehen Nutzer:innen die Coach-Empfehlung intuitiv (Wert + Begründung)?
  - Ist das Erfassen einer Session schnell genug für „mitten im Training" (Ziel: < 60 s für 3 Sätze)?
  - Wird das Konzept einer „Routine" auf Anhieb verstanden und genutzt?
  - Findet sich die Information „mein bisher höchstes Gewicht je Übung" intuitiv?
  - Werden RPE-Werte als Hürde oder als wertvoller Input empfunden?

- **Vorgehen:** moderiert · on-site · think-aloud · paarweise im Übungsslot mit
  Mitstudierenden (gegenseitiges Testen). Beobachtungen werden pro Testperson
  in einem Feedback-Grid protokolliert (Vorlage:
  [`docs/evaluation/feedback-grid.md`](docs/evaluation/feedback-grid.md)).

- **Stichprobe:** 2 Testpersonen aus dem IT-Studium, beide mit grundlegender Web-App-Erfahrung
  und unterschiedlicher Nähe zu Krafttraining. Durchführung am 20.05.2026 im moderierten
  Think-Aloud-Setting mit Laptop/Chrome. Die Stichprobe entspricht der Übungsvorgabe für die
  gegenseitige Usability-Evaluation mit zwei Studierenden.

- **Aufgaben/Szenarien:** 4 szenario-basierte Aufgaben mit steigender Komplexität,
  alle in neutraler Sprache ohne UI-Begriffe formuliert. Vollständiger Text:
  [`docs/evaluation/testaufgaben.md`](docs/evaluation/testaufgaben.md).
  1. Verlauf einer Übung erkunden und die nächste Empfehlung verstehen.
  2. Eine Session festhalten (Kniebeugen, 3 × 5 @ 100 kg, RPE 7).
  3. Eine gespeicherte Routine („Push Day") starten und die erste Übung erfassen.
  4. Den bisher höchsten Wert einer Übung herausfinden.

- **Kennzahlen & Beobachtungen:** Siehe [`docs/evaluation/issue-map.md`](docs/evaluation/issue-map.md).
  Aufgabe 1, 2 und 4 wurden von beiden Testpersonen abgeschlossen; Aufgabe 3 (geführte Routine)
  wurde nur teilweise ohne Hilfe gefunden. Die wichtigsten Probleme waren die Sichtbarkeit der
  Routinen, fehlende RPE-Erklärung für weniger erfahrene Nutzer:innen und die Einordnung der
  vorbefüllten Empfehlungswerte.

- **Zusammenfassung der Resultate:** Dashboard, Filter, Übungsdetails, Charts und konkrete
  Coach-Empfehlungen wurden schnell verstanden und positiv bewertet. Der grösste Usability-Bruch
  lag beim Einstieg in den Routine-/Workout-Modus, weil „Routine" nicht sofort als geführtes
  Training verstanden wurde. RPE ist für trainierende Nutzer:innen wertvoll, braucht aber eine
  kurze Erklärung für Einsteiger:innen.

- **Abgeleitete Verbesserungen:** Aus der Evaluation wurden die RPE-Hilfe im Logger, der
  deutlichere „Nächste Übung"-Block im Workout-Modus, die prominente Mobile-Tab-Bar mit
  Loggen-Aktion sowie das cleanere iOS-inspirierte Design priorisiert umgesetzt. Weitere
  Ideen wie Pausentimer, Kalenderansicht und Onboarding bleiben als spätere Erweiterungen offen.
  Zusätzlich wurden nach dem strengen Review persistente akzeptierte Empfehlungen, Edit-Workflows
  für Übungen/Routinen und zusätzliche Playwright-Checks ergänzt.

## 4. Erweiterungen

> Über den Mindestumfang hinaus umgesetzt, klar abgrenzbar.
> Pfade beziehen sich auf den Projektroot (siehe Abschnitt 5: Code in `ProgressLab/`).

### 4.1 Authentifizierung mit User- und Admin-Rolle

- **Beschreibung & Nutzen:** Eigenes Konto mit Username/Passwort. Sessions werden pro User getrennt
  gespeichert. Admin-Rolle darf Übungen anlegen und löschen, normale User nicht.
- **Wo umgesetzt:**
  - **Backend:** `ProgressLab/src/lib/server/auth.ts` (bcrypt-Hashing, Session-Cookies),
    `ProgressLab/src/hooks.server.ts` (User aus Cookie pro Request),
    API-Endpoints `ProgressLab/src/routes/api/auth/*`
  - **Frontend:** `ProgressLab/src/routes/login/`, `ProgressLab/src/routes/register/`,
    Admin-Guard in `ProgressLab/src/routes/admin/+layout.server.ts`
  - **Datenbank:** Collections `users` und `sessiontokens`
- **Demo-Accounts:** `demo / demo1234` (User), `admin / admin1234` (Admin) – nach `npm run seed`.
  Auf der Live-App ist der öffentliche Demo-Admin read-only; lokale Admin-CRUD-Tests bleiben möglich.

### 4.2 Komplexe Validierung (Client + Server)

- **Beschreibung & Nutzen:** Eingaben werden sowohl im Browser (Live-Hints, Submit-Disable) als auch
  serverseitig (HTTP-Statuscodes mit präzisen Fehlermeldungen) validiert. Beispiele: Username-Regex,
  Passwort-Länge, Gewicht 0–1000 kg, Reps 1–100, RPE 1–10, mindestens ein Satz.
- **Wo umgesetzt:**
  - **Frontend:** `register/+page.svelte` (`$derived`-Validität), `sessions/new/[exerciseId]`
    (per-Set-Errors)
  - **Backend:** Mongoose-Schemata mit `min/max/match`, zusätzliche Prüfungen in den `+server.ts`
    Endpoints

### 4.3 Filter, Suche, Sortierung im Dashboard

- **Beschreibung & Nutzen:** Über die Push/Pull/Legs-Tabs hinaus existiert eine Volltextsuche
  (Übungsname + Muskelgruppe) und drei Sortierungen (häufigste zuerst, alphabetisch, nach Trend).
  Damit findet man auch bei vielen Übungen schnell die gewünschte.
- **Wo umgesetzt:** `ProgressLab/src/routes/+page.svelte` (`$derived` mit Filter-/Sortier-Pipeline)

### 4.4 Visualisierung mit Chart.js – Verlauf, Volumen, Donut

- **Beschreibung & Nutzen:** Drei Chart-Typen auf zwei Seiten:
  - **Detail-Page:** Dual-Axis-Linienchart (Top-Gewicht + Ø RPE über alle Sessions)
  - **Statistik-Page:** Bar-Chart Volumen pro Woche
  - **Statistik-Page:** Doughnut-Chart der Volumen-Verteilung Push/Pull/Legs
- **Wo umgesetzt:** `ProgressLab/src/lib/components/ProgressChart.svelte`,
  `VolumeChart.svelte`, `CategoryDonut.svelte`. Chart-Farben werden zur Laufzeit aus den
  CSS-Custom-Properties gelesen, damit die Diagramme im Light- und Dark-Mode konsistent aussehen.

### 4.5 Coach-Empfehlung als eigene Engine

- **Beschreibung & Nutzen:** Die App tippt nicht nur Daten ein, sondern berechnet aus den letzten
  Sessions eine konkrete Handlungsempfehlung (Gewicht, Reps, Begründung, Trend, Deload-Flag, e1RM)
  für die nächste Session. Das ist der eigentliche „Mehrwert" gegenüber bestehenden Logger-Apps.
  Seit dem Review unterscheidet die Engine zwischen grossen Grundübungen (`+2.5 kg`) und kleineren
  Isolationsübungen, die zuerst über Wiederholungen und danach feiner über `+1 kg` gesteigert werden.
- **Wo umgesetzt:** `ProgressLab/src/lib/server/recommendation.ts` (reine Funktion mit Epley-1RM,
  PR-Detection, RPE-Heuristik), eingebunden in Dashboard, Detail-Page und Set-Logger.

### 4.6 Responsive Design

- **Beschreibung & Nutzen:** Das Layout funktioniert von schmaler Mobile-Ansicht (≤ 640 px,
  Bottom-Tab-Bar mit zentraler Loggen-Aktion) bis Desktop. Container mit `max-width: 1040px`,
  CSS-Grid für Tile-Layout und fixe Touch-Ziele verhindern Layout-Sprünge.
- **Wo umgesetzt:** Globale CSS-Variablen in `ProgressLab/src/app.css`, Media-Queries pro Komponente.

### 4.7 Dark-Mode mit System-Präferenz

- **Beschreibung & Nutzen:** Vollständiges Dark-Theme mit eigener Farb-Palette. Toggle in der Nav,
  Persistenz via Cookie (1 Jahr), kein Flash-of-Wrong-Theme dank serverseitiger Initialisierung über
  `transformPageChunk` in `hooks.server.ts`. Auch die Charts respektieren das aktive Theme.
- **Wo umgesetzt:** `ProgressLab/src/lib/theme.svelte.ts` (Svelte 5 Rune-Store),
  `ProgressLab/src/app.css` (`[data-theme='dark']`-Variablen),
  `ProgressLab/src/hooks.server.ts` (initiales Theme aus Cookie ins HTML).

### 4.8 Personal Records mit 1RM-Schätzung (Epley)

- **Beschreibung & Nutzen:** Eigene Records-Seite mit Top-Gewicht, Top-Reps, geschätztem 1-Rep-Max
  (Epley-Formel `w × (1 + r/30)`) und höchstem Session-Volumen je Übung. Auf Dashboard-Tiles erscheint
  ein PR-Badge, wenn in den letzten 7 Tagen ein neuer Bestwert aufgestellt wurde.
- **Wo umgesetzt:** `ProgressLab/src/lib/server/recommendation.ts` (`computePR`, `epley1RM`,
  `isPRSession`), `ProgressLab/src/lib/server/records-service.ts`,
  `ProgressLab/src/routes/records/`.

### 4.9 Statistik-Dashboard mit Streak-Tracking

- **Beschreibung & Nutzen:** Eigene Statistik-Seite mit Total-Volumen, Sessions, Sätze, Reps,
  aktueller und längster Trainings-Streak (zusammenhängende Tage), Trainings/Woche, Top-6-Übungen
  nach Volumen und den beiden Charts aus 4.4. Streak-Berechnung tagesgenau aus echten Datumswerten.
- **Wo umgesetzt:** `ProgressLab/src/lib/server/stats-service.ts` (reine Aggregations-Logik),
  `ProgressLab/src/routes/stats/`.

### 4.10 Sessions vollständig CRUD-fähig (Edit + Delete) mit Optimistic UI

- **Beschreibung & Nutzen:** Sessions können bearbeitet (Datum, Sätze, RPE, Notiz) und gelöscht
  werden. Auf der Sessions-Liste gibt es einen Schnell-Lösch-Button mit optimistischem Update und
  Undo-Fenster: der Eintrag verschwindet sofort, der Server-Delete wird aber erst nach wenigen
  Sekunden ausgeführt. Bei Undo oder Serverfehler wird der Eintrag wiederhergestellt.
- **Wo umgesetzt:** `ProgressLab/src/routes/api/sessions/[id]/+server.ts` (PUT/DELETE),
  `ProgressLab/src/routes/sessions/[id]/edit/`,
  `ProgressLab/src/routes/sessions/+page.svelte` (Optimistic-Removal-Set).

### 4.11 CSV-Export der eigenen Trainings­daten

- **Beschreibung & Nutzen:** Ein Klick auf „CSV exportieren" lädt alle eigenen Sessions als
  CSV-Datei mit UTF-8-BOM (Excel-kompatibel) herunter – ein Satz pro Zeile, mit Datum, Übung,
  Kategorie, Satz-Nummer, Gewicht, Reps, RPE und Notiz. Textfelder werden gegen CSV-Formula-Injection
  geschützt, damit Excel keine Notizen als Formeln interpretiert.
- **Wo umgesetzt:** `ProgressLab/src/routes/api/sessions/export/+server.ts` (eigener Endpoint mit
  korrektem `content-disposition`-Header), Download-Button im Stats-Header und der Sessions-Liste.

### 4.12 Cleaneres Visual-Design (iOS-/Training-App-inspirierte Optik)

- **Beschreibung & Nutzen:** Vollständiges Re-Design mit neutraler App-Hintergrundfläche,
  iOS-inspirierter Mobile-Bottom-Tab-Bar, glasigem Sticky-Header, weicheren Multi-Layer-Shadows,
  grösseren Touch-Zielen, Segmented Controls, nativer wirkenden Inputs und Inter/SF-kompatibler
  System-Font-Stack. Ergänzt wurde ein stärkerer Premium-Trainings-Look mit dunklem Dashboard-Hero,
  kompakten Workout-Rails, visuellen Exercise-Cards und ruhigerem Feedback unterhalb der Navigation.
  Die App fühlt sich dadurch auf Mobile stärker wie eine installierte PWA an, bleibt aber auf Desktop
  weiterhin sauber nutzbar.
- **Wo umgesetzt:** `ProgressLab/src/app.css` (Design-Tokens, Light + Dark, Controls),
  `ProgressLab/src/lib/components/Nav.svelte` (Mobile Tab-Bar + Header),
  `ProgressLab/src/lib/components/FilterTabs.svelte`, `ExerciseTile.svelte`,
  `SetLoggerTable.svelte`, `Toaster.svelte`, Dashboard-FAB und Trainings-Hero in
  `ProgressLab/src/routes/+page.svelte`, Routine-Cards in `ProgressLab/src/routes/templates/+page.svelte`.

### 4.13 Workout-Routinen (Templates) mit geführtem Workout-Modus

- **Beschreibung & Nutzen:** User kann beliebige Übungs-Kombinationen als Routine speichern (z. B.
  „Push Day", „Pull Day", „Leg Day"). Klick auf eine Routine startet einen geführten Workout-Modus
  mit Fortschrittsbalken: jede Übung der Routine bekommt einen „Loggen"-Button, bereits in den
  letzten 4 Stunden geloggte Übungen sind grün markiert. Die nächste offene Übung wird hervorgehoben,
  ein „Weiter loggen"-CTA führt direkt zum passenden Logger, und nach Abschluss erscheint ein
  Abschlussstatus. Beim Loggen aus der Routine kommt man über den `?back=`-Parameter zurück zum
  Workout-Flow.
- **Wo umgesetzt:**
  - **Backend:** `ProgressLab/src/lib/server/models/Template.ts`, `template-service.ts`,
    API-Endpoints `ProgressLab/src/routes/api/templates/*`
  - **Frontend:** `ProgressLab/src/routes/templates/` (CRUD), `ProgressLab/src/routes/workouts/[id]/`
    (Workout-Modus mit Progress-Bar), Quick-Start-Cards auf dem Dashboard
  - **Datenbank:** Collection `templates` mit Unique-Index auf `(userId, name)`
- **Demo-Daten:** Seed legt automatisch 5 Routinen für demo-User an (Push Day, Pull Day, Leg Day,
  Upper Body, Lower Body).

### 4.14 Trainings-Heatmap (GitHub-Style)

- **Beschreibung & Nutzen:** Auf der Statistik-Seite eine Year-Heatmap der letzten 12 Monate, die
  jeden Tag als kleine Zelle mit Farbintensität nach Anzahl Sessions (0–4+) anzeigt. Sofort
  erkennbar, wann gearbeitet wurde, wo Pausen liegen und ob sich eine Routine etabliert hat.
- **Wo umgesetzt:** `stats-service.ts` (`heatmapDays` aggregiert in 365 Day-Buckets),
  `ProgressLab/src/lib/components/TrainingHeatmap.svelte` (CSS-Grid mit color-mix für die
  Intensitätsstufen), eingebunden in `/stats`.

### 4.15 Progressive Web App (PWA) mit Offline-Cache

- **Beschreibung & Nutzen:** ProgressLab kann als App installiert werden (Edge/Chrome zeigen
  „Installieren"-Button im Browser, plus eigener Install-Prompt nach erstem Besuch). Service Worker
  cached nur statische Assets (`cache-first`). API- und HTML-Requests bleiben `network-only`, damit
  keine user-spezifischen Daten nach Login/Logout aus einem alten Cache angezeigt werden. Bei
  kompletter Offline-Situation gibt es eine saubere Fehlermeldung.
- **Wo umgesetzt:**
  - `ProgressLab/static/manifest.webmanifest` mit Icons und Theme-Color
  - `ProgressLab/static/icon-{192,512,maskable}.png` (generiert aus `icon.svg` via
    `npm run icons` mit `sharp`)
  - `ProgressLab/src/service-worker.ts` (SvelteKit erkennt das automatisch)
  - `ProgressLab/src/lib/components/InstallPrompt.svelte` für den eigenen Install-Hinweis,
    eingebunden im Layout

### 4.16 Coach-ID und personalisierte Plan-Generierung

- **Beschreibung & Nutzen:** User kann eine Coach-ID mit Körperdaten, Ziel (`Hypertrophy`, `Kraft`,
  `Balanced`), Erfahrung, Trainingsfrequenz, Split-Präferenz, Equipment und optionalen
  Einschränkungs-Checkboxen (`Schulter`, `Knie`, `Rücken`, `Arm/Ellbogen/Handgelenk`) speichern.
  Daraus erzeugt die App automatisch passende Routinen als echte
  Templates. Hypertrophy-Pläne setzen stärker auf Volumen und 8–15 Reps, Kraft-Pläne auf
  Grundübungen und niedrigere Rep-Ranges, Balanced-Pläne mischen beides.
- **Wo umgesetzt:**
  - **Backend:** `ProgressLab/src/lib/server/models/Profile.ts`, `profile-service.ts`,
    API-Endpoints `ProgressLab/src/routes/api/profile/` und `ProgressLab/src/routes/api/plan/generate/`
  - **Frontend:** `ProgressLab/src/routes/profile/`, CTA auf dem Dashboard und in `/templates`,
    Coach-Badge für automatisch generierte Routinen
  - **Datenbank:** Collection `profiles`; generierte Routinen werden in `templates` mit
    `source = "generated"` und `planKey` gespeichert

### 4.17 End-to-End-Tests mit Playwright

- **Beschreibung & Nutzen:** 12 automatisierte Main-Flow-Tests decken den Hauptworkflow ab: Auth-Redirect,
  Login, Dashboard, Übungs-Detail (inkl. Chart-Rendering), Stats-Page (mit Heatmap-Sektion),
  Records, Routinen, Coach-ID-Plan-Generierung, vollständiger Session-Workflow (Picker → Logger →
  Confirmation), Logout.
  Weitere 8 UI-Feedback-/CRUD-Tests prüfen Registrierung mit persistierendem Login, Fehlermeldungen,
  Toasts, Profile-Buttons, den persistenten Next-Session-Plan, Routine-Edit und lokalen Admin-Exercise-CRUD.
  Zusätzlich prüfen 9 Button-Audit-Tests Navigation, Theme, Filter, Suche, Sortierung, Detail-Aktionen,
  Empty-State-CTAs, Mobile-Menü und sekundäre Cancel/Delete-Flows. Zusätzlich prüfen 8 axe-core-Checks
  die Hauptseiten auf WCAG-AA-Verstösse. Tests starten den Dev-Server selbständig via `webServer`-Config
  und sind gegen Remote-Datenbanken gesperrt, damit Demo-/Produktivdaten nicht versehentlich verändert werden.
- **Wo umgesetzt:** `ProgressLab/playwright.config.ts`,
  `ProgressLab/tests/e2e/main-flow.spec.ts`, `ProgressLab/tests/e2e/ui-feedback.spec.ts`,
  `ProgressLab/tests/e2e/button-audit.spec.ts`, `ProgressLab/tests/e2e/a11y.spec.ts`.
  Ausführen: `npm run test:e2e` (CLI) oder
  `npm run test:e2e:ui` (Playwright UI mit Time-Travel-Debugger).

### 4.18 Persistente Next-Session-Planung

- **Beschreibung & Nutzen:** Eine Coach-Empfehlung kann aktiv akzeptiert oder kontrolliert manuell
  angepasst werden. Die App speichert diesen Plan pro User und Übung, übernimmt ihn beim nächsten Logger
  automatisch als Startwerte und markiert ihn nach erfolgreichem Session-Speichern als erledigt. Dadurch
  ist Workflow A ein echter End-to-End-Ablauf: Empfehlung verstehen → akzeptieren/anpassen → nächste
  Session mit diesen Werten loggen → neue Empfehlung sehen.
- **Wo umgesetzt:**
  - **Backend:** `ProgressLab/src/lib/server/models/PlannedRecommendation.ts`,
    `ProgressLab/src/lib/server/planned-recommendation-service.ts`,
    API-Endpoints `ProgressLab/src/routes/api/planned-recommendations/*`
  - **Frontend:** `ProgressLab/src/routes/exercises/[id]/+page.svelte` und
    `ProgressLab/src/routes/sessions/new/[exerciseId]/+page.svelte`
  - **Datenbank:** Collection `plannedrecommendations` mit Unique-Index auf
    `(userId, exerciseId, status = planned)`

## 5. Projektorganisation

- **Repository & Struktur:**

  ```
  /                              Repository-Root
  ├── README.md                  Diese Projektdokumentation
  ├── netlify.toml               Netlify-CI-Config (base = "ProgressLab")
  ├── ProgressLab_Prototyp.html  Klickbarer Mockup aus Woche 10
  ├── docs/                      Methodische Artefakte
  │   ├── adr/                   Architecture Decision Records
  │   ├── a11y-audit.md          WCAG 2.1 AA Audit-Bericht
  │   └── artefakte/             Eigene Phasen-Arbeiten (Wochen 8–10)
  └── ProgressLab/               SvelteKit-App
      ├── src/
      │   ├── routes/            Pages und API-Endpoints
      │   ├── lib/
      │   │   ├── components/    Wiederverwendbare Svelte-Komponenten
      │   │   ├── server/        Server-Only Logik (db, models, auth, services)
      │   │   ├── format.ts      Formatierungs-Helpers
      │   │   ├── theme.svelte.ts Theme-Store (Light/Dark, Svelte 5 Rune)
      │   │   ├── toast.svelte.ts Globaler Toast-State
      │   │   └── types.ts       Geteilte DTO-Typen
      │   ├── app.css            Design-Tokens (Light + Dark)
      │   ├── app.html           HTML-Shell mit Theme-Slot
      │   ├── app.d.ts           App.Locals (User-Typ)
      │   └── hooks.server.ts    Setzt locals.user + Theme pro Request
      ├── scripts/seed.ts        Datenbank-Seed
      ├── netlify.toml           Adapter-Config (functions, publish)
      ├── .env.example           Vorlage für Env-Variablen
      └── package.json
  ```

- **Commit-Praxis:** Sprechende Commit-Messages mit Conventional-Prefix
  (`feat`, `fix`, `chore`, `docs`, `refactor`), jeweils Mindestumfang oder Erweiterung erkennbar.

## 6. KI-Deklaration

### 6.1 KI-Tools

- **Eingesetzte Tools:**
  - **Anthropic Claude (Sonnet 4.7)** als Haupt-Sparringpartner für Architektur,
    Implementierung der ersten Version, Iterations-Reviews und Audit-Berichte.
    Eingesetzt über die Claude-Code-CLI im VS Code.
  - **OpenAI Codex** für gezielte Code-Reviews, Refactoring-Runden und
    UI-Polish (insbesondere iOS-inspiriertes Mobile-Design, Profile-Feature,
    Security-Härtung mit Rate-Limit/Demo-Guard, Screenshot-Erstellung).
- **Zweck & Umfang:** KI hat den überwiegenden Teil des Boilerplate-Codes geschrieben
  (SvelteKit-Pages, Mongoose-Models, Komponenten, Seed-Skript, Playwright-Tests). Die
  finalen Audits sowie die KI-übergreifende Konsistenz (z. B. dass Claude die
  Codex-Ergebnisse re-verifizieren musste) wurden ebenfalls KI-gestützt durchgeführt,
  die Befunde aber pro Schritt menschlich abgenommen.

### 6.2 Prompt-Vorgehen

Iterativ in klar abgegrenzten Phasen, jedes Mal vorab Plan einfordern und freigeben,
danach in Schritten implementieren:

- **Setup-Phase:** Tech-Stack-Wahl, Repo-Struktur, ADR-0001/0006.
- **Modelle:** Datenmodell aus dem Mockup ableiten, ADR-0002, ADR-0003.
- **Workflow:** Hauptworkflow End-to-End, dann Erweiterungen Stück für Stück.
- **Härtung:** zwei Review-Runden (Codex-Prompt + Audit-Prompt) mit gezielten Findings,
  jeweils lokal verifiziert via `npm run check / lint / test:unit / test:e2e`.

Nach jeder Phase: Browser-Smoke-Test (lokal oder live), `git status` prüfen, Commits
mit sprechenden Messages (Conventional Prefixes).

### 6.3 Reflexion (Eigenleistung vs. KI-Beitrag)

**Was KI gemacht hat:**

- Boilerplate-Code (Komponenten-Strukturen, CRUD-Endpoints, Mongoose-Schemas).
- Anpassung von Code an SvelteKit-/Svelte-5-Konventionen (Runes, `+server.ts`-Patterns).
- Erste Vorschläge für UI-Strukturen, Toasts, Charts, A11y-Setup.
- Test-Code für Playwright + Unit-Tests, Seed-Daten mit realistischen Werten.

**Was bei mir lag (inhaltliche Entscheidungen):**

- **Idee und Scope:** ProgressLab als RPE-basierter Krafttraining-Logger statt der
  ursprünglich angedachten Lernplaner-App; Abgrenzung „kein Cardio, keine Periodisierung".
- **Empfehlungs-Heuristik:** RPE-Bänder (≤7 → +2.5 kg, 7–8.9 → halten, ≥9 → Deload −10 %)
  und Epley-Formel für 1RM-Schätzung — domänen-validiert basierend auf gängiger
  Powerlifting-/Hypertrophie-Literatur (Rippetoe, Helms).
- **Datenmodell-Entscheid:** Sätze als embedded Array in `sessions` statt separater
  Set-Collection — bewusst für atomare Schreibvorgänge (siehe ADR-0002).
- **Architektur-Entscheide:** Eigene Auth statt Lucia/Better-Auth (ADR-0003), Pure-
  Function-Recommendation ohne Cache-Collection (ADR-0004), Service-Worker
  `network-only` für API/HTML statt `network-first` (ADR-0007) — jeweils Trade-offs
  abgewogen und im ADR begründet.
- **Auswahl/Reihenfolge der 18 Erweiterungen:** Welche reinkommen, welche bewusst
  weggelassen werden (z. B. kein Pausentimer, kein Onboarding-Tutorial im
  Prototyp-Scope), und welche zu Note 6 beitragen (A11y-Audit, ADRs, Plan-Generation).
- **Issue-Triage in der Usability-Evaluation:** welche der 5 Findings mit welcher
  Priorität umgesetzt werden — und welche als „spätere Erweiterung" markiert
  werden (siehe `docs/evaluation/issue-map.md`).

**Wo KI-Vorschläge korrigiert oder abgelehnt wurden:**

- Codex schlug ursprünglich einen `RUNTIME_CACHE` für API-Antworten vor (ADR-0005). Nach
  Diskussion mit Claude über Multi-User-Leak-Szenarien wurde das auf `network-only`
  zurückgesetzt (ADR-0007).
- Mehrere generische UI-Empfehlungen („Dashboard-Cards mit Stock-Foto-Hintergrund")
  wurden zugunsten der ruhigeren iOS-inspirierten Sprache verworfen.
- Demo-Daten der ersten Iteration enthielten nur 3 Übungen pro Routine — auf
  Hinweis hin auf 5–6 Übungen erweitert (commit `8017267`).

**Grenzen:**

- Domänenwissen (RPE-Bänder, sinnvolle Default-Werte für Übungen, realistische
  Demo-Gewichte) muss menschlich validiert werden — KI generiert oft falsche
  Reps-Ranges oder zu hohe Default-Gewichte.
- Plan-Generierung im Profile-Service hat einige Spezialfälle (Kniebeschwerden →
  keine Lunges) die KI nicht vorgeschlagen hätte, ohne dass ich sie als
  Anforderung formuliert hätte.
- Bewertungsrubrik-Mapping (was zählt wie viel Punkte) — die KI tendiert dazu,
  Wunschdenken statt strenger Bewertung zu liefern. Das Audit-Dokument
  `docs/audit/audit-2026-05-21.md` ist daher mit explizit eingebauten Severity-
  Kriterien geschrieben, um optimistische Selbstbewertung zu vermeiden.

**Qualitätssicherung:** `npm run check`, `npm run lint`, `npm run build`,
`npm run test:unit` und `npm run test:e2e` als lokale Checks; identische Befehle
laufen in GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) bei
jedem Push, sodass Regressionen früh erkannt werden.

## 7. Anhang

- **Quellen:** Mockup [`ProgressLab_Prototyp.html`](ProgressLab_Prototyp.html) und [`docs/artefakte/Woche10_UI-Prototyping_Andi_Kadolli.pdf`](docs/artefakte/Woche10_UI-Prototyping_Andi_Kadolli.pdf)
  (eigenständig erstellt). Empfehlungs-Heuristik basierend auf gängigen RPE-basierten
  Auto-Regulations-Schemata (z. B. Rippetoe, Helms).

## 8. Setup-Anleitung

### Voraussetzungen

- Node.js ≥ 20 (entwickelt mit 24)
- MongoDB Atlas Cluster (Free Tier reicht) oder lokale MongoDB

### Lokal starten

Alle SvelteKit-Befehle laufen aus dem `ProgressLab/`-Verzeichnis:

```bash
cd ProgressLab

# 1. Abhängigkeiten installieren
npm install

# 2. .env aus Vorlage anlegen und Connection-String eintragen
cp .env.example .env
# dann MONGODB_URI in .env setzen

# 3. Datenbank seeden (Übungen + 2 Demo-Accounts + Demo-Sessions)
# Das Skript löscht alle bestehenden Daten und legt anschliessend
# die Demo-Daten an. Die explizite Bestätigung verhindert versehentliche
# Läufe gegen produktive Daten:
PL_SEED_CONFIRM=1 npm run seed
# PowerShell: $env:PL_SEED_CONFIRM=1; npm run seed

# 4. Dev-Server starten
npm run dev
```

App läuft auf <http://localhost:5173>.

### Demo-Login

- **User:** `demo` / `demo1234`
- **Admin:** `admin` / `admin1234`

Hinweis: Der öffentliche Demo-Admin ist auf der Live-App read-only. Lokal nach `npm run seed`
kann der Admin-CRUD vollständig getestet werden.

### Build & Deployment

```bash
npm run build      # Netlify-Build (adapter-netlify)
npm run preview    # lokale Vorschau des Production-Builds
```

Für Netlify: Repository verbinden, im Dashboard die folgenden Environment-Variablen setzen:

- `MONGODB_URI` – Atlas Connection-String mit Datenbank-Name `progresslab`

`netlify.toml` ist im Repo enthalten.

## 9. MongoDB-Schema

| Collection        | Felder                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **users**         | `username` (uniq, lowercase, 3–32 Zeichen, regex), `passwordHash` (bcrypt), `role` (`user`\|`admin`), Timestamps                                                    |
| **sessiontokens** | `token` (32-byte hex), `userId`, `expiresAt` (30 Tage TTL)                                                                                                          |
| **exercises**     | `name` (uniq), `category` (`push`\|`pull`\|`legs`), `muscleGroup`, `isBodyweight`, `defaultRepTarget` (1–50), `defaultRpeTarget` (1–10), Timestamps                 |
| **sessions**      | `userId`, `exerciseId`, `date`, `sets: [{weight, reps, rpe}]` (≥ 1 Satz), `note` (≤ 500 Zeichen), Timestamps. Index: `(userId, exerciseId, date desc)`              |
| **templates**     | `userId`, `name`, `description`, `source` (`manual`\|`generated`), `planKey`, `exerciseIds: ObjectId[]` (≥ 1, geordnet), Timestamps. Unique-Index: `(userId, name)` |
| **profiles**      | `userId` (uniq), `heightCm`, `bodyWeightKg`, `experience`, `goal`, `trainingDays`, `splitPreference`, `equipment`, `limitations`, Timestamps                        |
| **plannedrecommendations** | `userId`, `exerciseId`, `weight`, `reps`, `rpeTarget`, `reason`, `source` (`coach`\|`manual`), `status` (`planned`\|`completed`), Timestamps. Unique planned Index: `(userId, exerciseId, status)` |

## 10. Tests

```bash
cd ProgressLab
npm run test:unit      # Unit-Tests für die Recommendation-Engine
npm run test:e2e       # 37 sichere lokale E2E-Tests, seedet mongodb://127.0.0.1:27017/progresslab_e2e
npm run test:e2e:local # Alias für denselben lokalen E2E-Lauf
npm run test:e2e:ui    # gleicher lokaler Seed + Playwright UI mit Time-Travel-Debugging
```

Voraussetzung: Vor dem ersten Lauf einmal `npx playwright install chromium` ausführen.
Für lokale E2E-Läufe ist `npm run test:e2e` bewusst sicher konfiguriert: Das Skript blockiert
nicht-lokale MongoDB-URIs und seedet nur die lokale Testdatenbank. Direkte Playwright-Läufe
gegen Atlas oder andere Remote-Datenbanken sind standardmässig gesperrt und benötigen bewusst
`PL_ALLOW_REMOTE_E2E=1` für eine explizit konfigurierte Testumgebung.

## 11. Methodische Artefakte

### 11.1 Architecture Decision Records (ADR)

Über den Mindestumfang hinaus dokumentieren wir die wichtigsten Architektur-
Entscheide als **ADR** nach dem Format von Michael Nygard. Jeder ADR hält
Kontext, Entscheidung, Begründung und Konsequenzen fest, sodass spätere
Reviewer den Entscheid nachvollziehen können.

Übersicht: [`docs/adr/`](docs/adr/README.md)

| Nr.                                                           | Titel                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| [0001](docs/adr/0001-sveltekit-typescript.md)                 | SvelteKit + TypeScript als Tech-Stack                             |
| [0002](docs/adr/0002-mongodb-mongoose.md)                     | MongoDB Atlas + Mongoose statt relationaler DB                    |
| [0003](docs/adr/0003-eigene-session-auth.md)                  | Eigene Session-Cookie-Auth statt Lucia/Better-Auth                |
| [0004](docs/adr/0004-recommendation-pure-function.md)         | Recommendation-Engine als reine Funktion                          |
| [0005](docs/adr/0005-pwa-custom-service-worker.md)            | PWA mit Custom Service Worker statt Plugin                        |
| [0006](docs/adr/0006-repo-struktur-progresslab-subfolder.md)  | Code im `ProgressLab/`-Subfolder, Doku am Root                    |
| [0007](docs/adr/0007-service-worker-network-only-fuer-api.md) | Service Worker: `network-only` für API und HTML (verfeinert 0005) |

### 11.2 Usability-Evaluation-Material

Testaufgaben (szenario-basiert), Feedback-Grid-Vorlage und strukturierte
Nachfragen liegen vorbereitet unter
[`docs/evaluation/`](docs/evaluation/README.md). Die ausgefüllten Protokolle
landen pro Testperson in `docs/evaluation/protokolle/` und werden in der
Issue Map zusammengeführt.

### 11.3 Phasen-Artefakte aus Wochen 8–10

Eigene Arbeiten aus den vorgelagerten Übungen liegen unter
[`docs/artefakte/`](docs/artefakte/README.md). Aufgabenstellungen,
Bewertungs-Rubrik und Walkthrough-Video sind **nicht** im Repo — sie wurden
in den jeweiligen Moodle-Übungen abgegeben und sind den Dozierenden direkt
zugänglich.

### 11.4 Accessibility-Audit (WCAG 2.1 AA)

Vollständiger A11y-Audit mit **axe-core** über alle 8 Hauptseiten — Bericht in
[`docs/a11y-audit.md`](docs/a11y-audit.md). Ergebnis: **0 Violations** auf WCAG
2.1 Level AA. Identifizierte Probleme (Farb-Kontrast, ARIA-Rollen, fehlender
Skip-Link, Chart-Text-Alternativen) wurden behoben und das Audit ist als
Playwright-Test (`tests/e2e/a11y.spec.ts`) als Regressions-Schutz im CI-Lauf.

```bash
cd ProgressLab && npx playwright test tests/e2e/a11y.spec.ts
# 8 passed (≈ 22 s)
```
