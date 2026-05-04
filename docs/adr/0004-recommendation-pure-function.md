# ADR-0004: Recommendation-Engine als reine Funktion (kein Cache, keine Collection)

- **Status:** Accepted
- **Datum:** 2026-05-01
- **Beteiligte:** Andi Kadolli

## Kontext

Die **Coach-Empfehlung** (Erweiterung 4.5) ist die Differenzierungs-Funktion
gegenüber bestehenden Logger-Apps wie Strong oder Hevy. Pro Übung berechnet sie
für die nächste Session:

- Vorgeschlagenes Gewicht (oder +1 Rep bei Bodyweight)
- RPE-Zielwert
- Begründung als Text
- Trend (up / flat / down)
- Deload-Flag
- Geschätzten 1RM (Epley-Formel)

Mögliche Architekturen:

1. **Eigene Mongoose-Collection** `recommendations` mit Cache, erneuert nach
   jeder neuen Session (klassisches Materialized-View-Pattern).
2. **Reine Funktion** `buildRecommendation(sessions, opts)`, die bei jedem
   Server-Load on-the-fly aufgerufen wird.
3. **Client-side Berechnung** im Svelte-Component nach Daten-Fetch.

Performance-Realität:

- Demo-User hat 19 Sessions über 6 Wochen. Selbst bei "Power-User" mit
  3 Sessions/Woche × 50 Wochen × 8 Übungen = ~1200 Sessions, die aber pro
  Übung in mongo-indexierten Queries (`{userId, exerciseId}`-Index) selektiert
  werden.

## Entscheidung

**Reine Funktion, on-the-fly auf dem Server.**

- `src/lib/server/recommendation.ts` exportiert
  `buildRecommendation(sessions, { isBodyweight, defaultRepTarget,
  defaultRpeTarget })` als deterministische, side-effect-freie Funktion.
- Aufrufer:
  - `listExercisesWithRecommendation()` für das Dashboard (1× pro Übung)
  - `getExerciseDetail()` für die Detail-Page
  - Set-Logger zur Vorbefüllung der Inputs
  - Done-Page für die "aktualisierte Empfehlung"
- Keine Cache-Collection, kein Stale-State-Management.

## Begründung

**Cache-Collection abgelehnt:**

- Jeder neue Session-Insert müsste die Cache-Zeile invalidieren (zusätzlicher
  Schreibvorgang, zusätzliche Quelle für Inkonsistenz).
- Die Heuristik ist *trivial billig*: 1 Map über `sessions[0].sets`, 1 Trend-
  Vergleich über `sessions[0..2]`. CPU-Kosten <1 ms.
- Storage-Kosten für 8 Cache-Zeilen pro User sind irrelevant — aber die
  Komplexität des Invalidierungs-Codes ist es nicht.

**Client-side abgelehnt:**

- Empfehlung wird im **Done-Screen** als "neu berechnete" Empfehlung angezeigt.
  Hätte der Client die Logik, müsste sie auch dort vorhanden sein →
  Code-Duplikation und schlechte Trennung von Server- und Client-Wissen.
- Server-Berechnung erlaubt Tests gegen die Funktion (siehe Plan für
  zukünftige Unit-Tests).

**Reine Funktion, keine Klasse:**

- Funktionen sind in Tests trivial mockbar mit fixen Input-Daten.
- Klassen würden Mongoose-Model und Logik vermischen → Verstoß gegen "Pure
  Functions, Smart Edges".

## Konsequenzen

**Positiv:**

- `buildRecommendation` ist 100 % deterministisch und einfach unit-testbar
  (geplante Erweiterung).
- Wenn die Heuristik geändert wird (z. B. Feature: "individuelle
  Progression-Rate"), muss nur eine Funktion und keine Datenmigrations-Logik
  angepasst werden.
- Die `computePR(sessions)`- und `isPRSession(...)`-Funktionen folgen demselben
  Pattern → Konsistenz im Backend-Layer.

**Negativ / Trade-offs:**

- Bei zukünftigen Skalierungs-Szenarien (z. B. Empfehlung im
  Push-Notification-Worker) müsste die Berechnung trotzdem laufen — kein
  pre-computed Cache-Wert ist verfügbar. Falls relevant, kann später ein
  Materialized-View-Layer hinzugefügt werden, ohne den Funktions-Vertrag zu
  brechen.
- Multi-Übungen-Vergleiche (z. B. "alle Übungen sortiert nach Empfehlung")
  rufen die Funktion N-mal auf — bei sehr großen User-Datenmengen wäre eine
  Aggregation effizienter.
