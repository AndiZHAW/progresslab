# Projektdokumentation - ProgressLab

> Webbasierte Trainings-App, die nach jedem Krafttraining-Satz eine evidenzbasierte
> Empfehlung für die nächste Session liefert. Autoreguliert über RPE statt starrer Pläne.

**Deployte App:** _[Platzhalter – Netlify-URL nach Deployment]_  
**GitHub-Repository:** _[Platzhalter – Repo-URL nach `git push`]_

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
- **Primäre Zielgruppe:** Hobby-Kraftsportler:innen mit 2–4 Trainings pro Woche, die strukturierter
  vorgehen möchten als nach Bauchgefühl, aber kein Personal Coaching haben.
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
  - Single-Tenant pro User reicht – keine Trainingspläne, keine Templates, keine Programme.
- **Abgrenzung:**
  - Kein Cardio-Tracking, keine Dehnübungen, kein Kalorien-/Ernährungs-Modul.
  - Keine Mobile-App; die Web-App ist responsive.
  - Keine Trainingspläne („3-Tage-Split", „Push-Pull-Legs-Programm" usw.) – Nutzer:in wählt pro
    Session frei.

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define

- **Zielgruppenverständnis:** Hobby-Kraftsportler:in trainiert 2–4×/Woche, kennt RPE als Konzept, möchte
  kontinuierlich progredieren, scheitert aber an der Frage „soll ich heute mehr Gewicht ansetzen?".
  Bestehende Apps (Strong, Hevy, FitNotes) loggen, beraten aber nicht.
- **Wesentliche Erkenntnisse:**
  - Eine konkrete Zahl als Empfehlung („+2.5 kg") senkt die kognitive Last beim Training.
  - Der Verlauf einzelner Übungen ist wichtiger als Gesamtstatistiken.
  - Drei Sätze als Default decken den häufigsten Use-Case ab.
- **Artefakte:** Siehe `Ideenfindung_ProgressLab_Andi Kadolli.pdf`.

### 3.2 Sketch

- **Variantenüberblick:** In Woche 9 (Crazy 8s, Solution Sketch) wurden mehrere Varianten skizziert:
  klassisches Listen-Layout, Karten-Grid, Wochen-Timeline. Die finale Variante kombiniert Karten-Grid
  (Dashboard) mit Session-Workflow als Modal-Stack.
- **Skizzen:** Siehe `Woche9_Skizzieren_Andi_Kadolli.docx` und `Woche 9_Aufgabe_Andi Kadolli.pdf`.

### 3.3 Decide

- **Gewählte Variante & Begründung:** Karten-Grid + Push/Pull/Legs-Filter, weil dies den Übergang von
  „welche Übung trainiere ich heute" zu „welche Empfehlung gibt der Coach" am direktesten unterstützt.
- **End-to-End-Ablauf:** Dashboard → Übung wählen (Tile oder FAB-Picker) → Set-Logger → Bestätigung mit
  neuer Empfehlung → zurück zum Dashboard mit aktualisierten Tiles.
- **Mockup:** Klickbarer HTML-Prototyp `ProgressLab_Prototyp.html` (Woche 10),
  Doku `Woche10_UI-Prototyping_Andi_Kadolli.pdf`.

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
  - `/admin/exercises` – Admin-only: Übungen anlegen/löschen
- **User Interface Design:** Schwarz-Weiss-Design analog Mockup, Empfehlungs-Karte als zentrales
  Element (dunkel oder hell je Kontext), Sparklines aus dem Mockup übernommen, Chart.js-Verlaufschart
  auf der Detail-Page (Erweiterung gegenüber dem statischen SVG des Mockups).
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
    `models/`, `auth.ts`, `recommendation.ts`, `exercise-service.ts`, `dto.ts`
  - Globaler Toast-State über `src/lib/toast.svelte.ts` (Svelte 5 Rune)
- **Daten & Schnittstellen:** MongoDB mit drei Hauptcollections (Schema-Übersicht weiter unten).
  REST-artige API-Routes:
  - `POST /api/auth/{login,register,logout}`
  - `GET/POST /api/exercises` · `GET/PUT/DELETE /api/exercises/[id]`
  - `GET/POST /api/sessions` · `GET/DELETE /api/sessions/[id]`
- **Deployment:** _[Netlify-URL nach Deployment einfügen]_
- **Besondere Entscheidungen:**
  - Eigenes minimales Auth statt Lucia/Better-Auth, weil der Scope das nicht rechtfertigt.
  - Recommendation als reine Funktion (`buildRecommendation`) ohne eigene Collection – wird on-the-fly
    aus Sessions berechnet, damit keine inkonsistente Cache-Pflege nötig ist.

### 3.5 Validate

- **URL der getesteten Version:** _[wird im Rahmen der Evaluation noch ergänzt]_
- **Ziele der Prüfung:** Verstehen Nutzer:innen die Empfehlung intuitiv? Ist der Logger schnell genug
  für „mitten im Training"? Wird die RPE-Eingabe akzeptiert oder als Hürde empfunden?
- **Vorgehen, Stichprobe, Aufgaben:** _[noch ausstehend – wird in der Validierungs-Übung durchgeführt]_

## 4. Erweiterungen

> Über den Mindestumfang hinaus umgesetzt, klar abgrenzbar.

### 4.1 Authentifizierung mit User- und Admin-Rolle

- **Beschreibung & Nutzen:** Eigenes Konto mit Username/Passwort. Sessions werden pro User getrennt
  gespeichert. Admin-Rolle darf Übungen anlegen und löschen, normale User nicht.
- **Wo umgesetzt:**
  - **Backend:** `src/lib/server/auth.ts` (bcrypt-Hashing, Session-Cookies), `src/hooks.server.ts`
    (User aus Cookie pro Request), API-Endpoints `src/routes/api/auth/*`
  - **Frontend:** `src/routes/login/`, `src/routes/register/`, Admin-Guard in
    `src/routes/admin/+layout.server.ts`
  - **Datenbank:** Collections `users` und `sessiontokens`
- **Demo-Accounts:** `demo / demo1234` (User), `admin / admin1234` (Admin) – nach `npm run seed`.

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
  (Übungsname + Muskelgruppe) und eine Sortierung nach Name oder Trend. Damit findet man auch bei
  vielen Übungen schnell die gewünschte.
- **Wo umgesetzt:** `src/routes/+page.svelte` (`$derived` mit Filter-/Sortier-Pipeline)

### 4.4 Visualisierung mit Chart.js

- **Beschreibung & Nutzen:** Auf der Übungs-Detailseite zeigt ein Dual-Axis-Chart den Verlauf von
  Top-Gewicht (linke Y-Achse, schwarze Linie) und Ø RPE (rechte Y-Achse, gestrichelt rot). Damit ist
  auf einen Blick erkennbar, ob die Steigerung mit zumutbarer RPE läuft.
- **Wo umgesetzt:** `src/lib/components/ProgressChart.svelte` (Chart.js mit Custom-Config), genutzt in
  `src/routes/exercises/[id]/+page.svelte`

### 4.5 Coach-Empfehlung als eigene Engine

- **Beschreibung & Nutzen:** Die App tippt nicht nur Daten ein, sondern berechnet aus den letzten
  Sessions eine konkrete Handlungsempfehlung (Gewicht, Reps, Begründung, Trend, Deload-Flag) für die
  nächste Session. Das ist der eigentliche „Mehrwert" gegenüber bestehenden Logger-Apps.
- **Wo umgesetzt:** `src/lib/server/recommendation.ts` (reine Funktion, einheitenfest), eingebunden
  in Dashboard, Detail-Page und Set-Logger (vorbefüllte Werte).

### 4.6 Responsive Design

- **Beschreibung & Nutzen:** Das Layout funktioniert von schmaler Mobile-Ansicht (≤ 640 px, Tabs
  brechen um, FAB visible) bis Desktop. Container mit `max-width: 960px`, CSS-Grid für Tile-Layout.
- **Wo umgesetzt:** Globale CSS-Variablen in `src/app.css`, Media-Queries pro Komponente.

## 5. Projektorganisation

- **Repository & Struktur:**

  ```
  /                       SvelteKit-Projektroot
  ├── src/
  │   ├── routes/         Pages und API-Endpoints
  │   ├── lib/
  │   │   ├── components/ Wiederverwendbare Svelte-Komponenten
  │   │   ├── server/     Server-Only Logik (db, models, auth, recommendation)
  │   │   ├── format.ts   Formatierungs-Helpers (Datum, Empfehlung, Aggregate)
  │   │   ├── toast.svelte.ts  Globaler Toast-State (Svelte 5 Rune)
  │   │   └── types.ts    Geteilte DTO-Typen (Client + Server)
  │   ├── app.css         Globale Styles + Design-Tokens
  │   ├── app.html        HTML-Shell
  │   ├── app.d.ts        App.Locals (User-Typ)
  │   └── hooks.server.ts Setzt locals.user pro Request
  ├── scripts/seed.ts     Datenbank-Seed (Übungen + Demo-User + Demo-Sessions)
  ├── netlify.toml        Netlify-Build-Konfiguration
  ├── .env.example        Vorlage für Environment-Variablen
  └── package.json
  ```

- **Commit-Praxis:** Sprechende Commit-Messages, jeweils Mindestumfang oder Erweiterung erkennbar.

## 6. KI-Deklaration

### 6.1 KI-Tools

- **Eingesetzte Tools:** Claude (Anthropic, Modell Opus 4.7) für Codegenerierung und Architektur-Sparring.
- **Zweck & Umfang:** KI hat den Boilerplate der SvelteKit-Pages, Mongoose-Modelle, Komponenten und
  das Seed-Skript erstellt. Vorgegeben wurden die Anforderungen, das Mockup, die Tech-Stack-Wahl, die
  Datenmodell-Skizze und die Empfehlungs-Heuristik.
- **Eigene Leistung:** Anforderungsanalyse, Ableitung der Datenmodelle aus dem Mockup, Wahl der
  Empfehlungs-Logik, Auswahl der Erweiterungen, Verifikation der Funktion, Dokumentation.

### 6.2 Prompt-Vorgehen

Iterativ: Zuerst Plan einfordern (Routen, Komponenten, Datenmodell), Plan kontrollieren, dann
Implementierung in klar abgegrenzten Schritten (Setup → Modelle → API → Pages → Erweiterungen).
Nach jedem Schritt verifiziert (Build, svelte-check, Browser-Smoke-Test).

### 6.3 Reflexion

- **Nutzen:** Massive Beschleunigung bei Setup und Boilerplate; gute Vorschläge bei Mongoose-ESM-Quirks.
- **Grenzen:** Domänenwissen (RPE-Heuristik, sinnvolle Default-Werte) muss menschlich validiert werden.
- **Qualitätssicherung:** `npm run check` ohne Errors, `npm run build` erfolgreich, manuelle
  Browser-Verifikation der Hauptworkflows.

## 7. Anhang

- **Quellen:** Mockup `ProgressLab_Prototyp.html` und `Woche10_UI-Prototyping_Andi_Kadolli.pdf`
  (eigenständig erstellt). Empfehlungs-Heuristik basierend auf gängigen RPE-basierten
  Auto-Regulations-Schemata (z. B. Rippetoe, Helms).

## 8. Setup-Anleitung

### Voraussetzungen

- Node.js ≥ 20 (entwickelt mit 24)
- MongoDB Atlas Cluster (Free Tier reicht) oder lokale MongoDB

### Lokal starten

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. .env aus Vorlage anlegen und Connection-String eintragen
cp .env.example .env
# dann MONGODB_URI in .env setzen

# 3. Datenbank seeden (Übungen + 2 Demo-Accounts + Demo-Sessions)
npm run seed

# 4. Dev-Server starten
npm run dev
```

App läuft auf <http://localhost:5173>.

### Demo-Login

- **User:** `demo` / `demo1234`
- **Admin:** `admin` / `admin1234`

### Build & Deployment

```bash
npm run build      # Netlify-Build (adapter-netlify)
npm run preview    # lokale Vorschau des Production-Builds
```

Für Netlify: Repository verbinden, im Dashboard die folgenden Environment-Variablen setzen:

- `MONGODB_URI` – Atlas Connection-String mit Datenbank-Name `progresslab`
- `SESSION_SECRET` – beliebiger zufälliger String (≥ 32 Zeichen)

`netlify.toml` ist im Repo enthalten.

## 9. MongoDB-Schema

| Collection | Felder |
|---|---|
| **users** | `username` (uniq, lowercase, 3–32 Zeichen, regex), `passwordHash` (bcrypt), `role` (`user`\|`admin`), Timestamps |
| **sessiontokens** | `token` (32-byte hex), `userId`, `expiresAt` (30 Tage TTL) |
| **exercises** | `name` (uniq), `category` (`push`\|`pull`\|`legs`), `muscleGroup`, `isBodyweight`, `defaultRepTarget` (1–50), `defaultRpeTarget` (1–10), Timestamps |
| **sessions** | `userId`, `exerciseId`, `date`, `sets: [{weight, reps, rpe}]` (≥ 1 Satz), `note` (≤ 500 Zeichen), Timestamps. Index: `(userId, exerciseId, date desc)` |
