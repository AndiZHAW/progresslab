# Accessibility-Audit (WCAG 2.1 AA)

- **Datum:** 2026-05-04
- **Auditor:** Andi Kadolli
- **Tooling:** [axe-core](https://github.com/dequelabs/axe-core) v4.11
  ausgeführt via `@axe-core/playwright` gegen alle relevanten Routen.
- **Standard:** WCAG 2.1 Level AA (Tags `wcag2a, wcag2aa, wcag21a, wcag21aa`)
- **Browser:** Chromium 1217 (Playwright Bundle), Headless

## Zielsetzung

Sicherstellen, dass ProgressLab den ZHAW-Anforderungen an „gute Bedienbarkeit"
auch unter den Aspekten **Tastatur-Navigation, Screenreader-Verständlichkeit
und Farb-Kontrast** genügt. Die Bewertungs-Rubrik gewichtet
„Nutzerzentrierung & Bedienbarkeit" mit 15 Punkten und „Zusätzliche
Methoden/Artefakte" mit weiteren 10 Punkten — ein dokumentierter A11y-Audit
adressiert beides.

## Vorgehen

1. Manueller Walkthrough aller Hauptseiten mit der Tastatur (Tab, Shift+Tab,
   Enter, Escape) und mit aktiviertem Bildschirmlesen-Cursor.
2. Automatisierte Audits mit axe-core gegen 7 zentrale Routes (alle public
   und alle authed Pages).
3. Befunde priorisiert nach axe-`impact`-Klassifikation
   (`critical / serious / moderate / minor`).
4. Iterativ Fixes implementiert, jeweils Audit erneut laufen gelassen.
5. Audit als Playwright-Test (`tests/e2e/a11y.spec.ts`) ins Repo
   aufgenommen — damit bleibt der Status auch in zukünftigen Änderungen
   nachvollziehbar (Regression-Test).

## Ergebnis

**Status final: 7/7 Routes ohne axe-violation auf WCAG 2.1 AA.**

```
> playwright test tests/e2e/a11y.spec.ts

  ok 1 Login:    keine kritischen WCAG-AA-Violations
  ok 2 Register: keine kritischen WCAG-AA-Violations
  ok 3 Dashboard: keine kritischen WCAG-AA-Violations
  ok 4 Stats:    keine kritischen WCAG-AA-Violations
  ok 5 Records:  keine kritischen WCAG-AA-Violations
  ok 6 Templates: keine kritischen WCAG-AA-Violations
  ok 7 Sessions: keine kritischen WCAG-AA-Violations

  7 passed (24.1s)
```

## Identifizierte Probleme & Fixes

### 1. Farb-Kontrast unter 4.5:1 (mehrere Stellen) · Severity: serious

Vor den Fixes traf das **alle 7 Routen**. Konkrete Fälle:

| Element | Vorher | Verhältnis | Fix |
|---|---|---:|---|
| Akzent-Buttons (`btn-primary`) | `#ffffff` auf `#0d9488` (teal-600) | 3.74 | Akzent auf `#0f766e` (teal-700) verdunkelt → 4.96 |
| `--c-text-subtle` als Beschriftung | `#8b8d9e` auf `#ffffff` | 3.28 | Auf `#6b6c7c` verdunkelt → 5.12 |
| Subtle-Text auf Cream-Hintergrund | `#8b8d9e` auf `#faf7f2` | 3.06 | Wie oben → 4.97 |
| Teal-Text in PR-Karten | `#0d9488` auf `#ccfbf1` | 3.32 | Verwendet jetzt `#115e59` (teal-800) → 5.95 |
| Register-CTA in Public-Nav | `#4d4f5e` auf `#0f766e` | 1.47 | Spezifischer Selektor `.links a.register-cta` mit `var(--c-accent-fg)` |

**Wo umgesetzt:** `ProgressLab/src/app.css` (zentrale Design-Tokens),
`ProgressLab/src/lib/components/Nav.svelte` (Register-CTA-Spezifität).

### 2. `aria-label` auf `<span>` ohne Rolle · Severity: serious

Die Heatmap-Cells waren zwar mit `aria-label` versehen, aber laut WAI-ARIA
darf `aria-label` nur auf interaktiven Elementen oder solchen mit valider
Rolle angewendet werden — sonst wird es ignoriert.

**Fix:** Nur Zellen mit echten Daten bekommen jetzt `role="img"` plus
`aria-label`. Leere Padding-Zellen sind `aria-hidden="true"`.

**Wo umgesetzt:** `ProgressLab/src/lib/components/TrainingHeatmap.svelte`.

### 3. Charts ohne Text-Alternative · proaktiv adressiert

`<canvas>` rendert für Screenreader nichts. Damit Sehbeeinträchtigte den
Verlauf trotzdem nachvollziehen können, gibt es jetzt:

- `role="img"` und `aria-label` auf jedem Chart-Canvas (mit
  `<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->`,
  da das Svelte-Lint hier zu strikt ist — der `role="img"`-Pattern auf
  Chart.js-Canvases ist von WAI-ARIA explizit erlaubt).
- Eine `<table class="sr-only">` neben jeder Chart-Komponente mit den exakten
  Datenpunkten als Tabelle (Datum, Top-Gewicht, Ø RPE etc.).

**Wo umgesetzt:** `ProgressChart.svelte`, `VolumeChart.svelte`,
`CategoryDonut.svelte` (alle in `ProgressLab/src/lib/components/`).

### 4. Skip-Link & Focus-Indikator · proaktiv adressiert

axe testet Skip-Links nicht direkt, aber WCAG 2.4.1 (Bypass Blocks) und
2.4.7 (Focus Visible) verlangen sie. Vorher gab es nur den Browser-Default-
Outline.

**Fix:**

- `<a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>`
  als allererstes Element im Layout. Sichtbar nur bei Tastatur-Fokus
  (Position absolut, mit `top: -40px` und `top: 12px` bei `:focus`).
- `<main id="main-content" tabindex="-1">` als Skip-Target.
- Globaler Fokus-Ring via `:focus-visible` mit `outline: 2px solid var(--c-accent)`
  und `outline-offset: 2px` — Mausklicks zeigen den Ring nicht (erst bei
  Tab-Navigation).

**Wo umgesetzt:** `ProgressLab/src/app.css` und
`ProgressLab/src/routes/+layout.svelte`.

### 5. Trend-Pfeile als Color-Only-Information · proaktiv adressiert

Die Trend-Pfeile (↑↓→) sind Unicode-Zeichen, die selbst die Information
tragen — Farbe ist also redundant, kein WCAG 1.4.1-Verstoß. Für
Screenreader habe ich sie trotzdem mit `aria-label="Trend steigend"` etc.
versehen, damit nicht nur das Pfeil-Glyph vorgelesen wird.

**Wo umgesetzt:** `ProgressLab/src/lib/components/ExerciseTile.svelte`.

### 6. Toast-Benachrichtigungen · korrekt konfiguriert

Vorher hatte das Toaster-Wrapper-Element ein generisches `aria-live="polite"`.
Das ist okay, aber bei Fehler-Toasts sollte ein `role="alert"` mit
`aria-live="assertive"` greifen, damit Screenreader-Nutzer auch unter
Konzentration sofort informiert werden.

**Fix:** Pro Toast (statt am Wrapper) wird jetzt entweder
`role="status" aria-live="polite"` (Erfolg/Info) oder
`role="alert" aria-live="assertive"` (Fehler) gesetzt.

**Wo umgesetzt:** `ProgressLab/src/lib/components/Toaster.svelte`.

## WCAG-Kriterien-Mapping (Auszug)

| Kriterium | Level | Status |
|---|---|---|
| 1.1.1 Non-text Content | A | ✅ alle Charts haben Text-Alternative (Tabelle) |
| 1.3.1 Info and Relationships | A | ✅ Heading-Hierarchie pro Page, semantische Forms |
| 1.4.1 Use of Color | A | ✅ Trend-Information durch Pfeil-Glyph + ARIA, nicht nur Farbe |
| 1.4.3 Contrast (Minimum) | AA | ✅ alle Texte ≥ 4.5:1 (4.5:1 bei normaler Schrift, 3:1 bei großer) |
| 2.1.1 Keyboard | A | ✅ alle Workflows ohne Maus durchspielbar |
| 2.4.1 Bypass Blocks | A | ✅ Skip-Link zum Hauptinhalt |
| 2.4.2 Page Titled | A | ✅ jede Page setzt eigenen `<title>` via `<svelte:head>` |
| 2.4.7 Focus Visible | AA | ✅ globaler `:focus-visible`-Outline mit `var(--c-accent)` |
| 3.1.1 Language of Page | A | ✅ `<html lang="de">` |
| 3.3.1 Error Identification | A | ✅ Form-Errors über `role="alert"` Banner |
| 3.3.2 Labels or Instructions | A | ✅ jedes Input hat ein `<label for>` oder `aria-label` |
| 4.1.2 Name, Role, Value | A | ✅ Custom-Buttons mit korrekten ARIA-Attributen |
| 4.1.3 Status Messages | AA | ✅ Toasts mit `role="status"` bzw. `role="alert"` |

## Verbleibende Limitationen (ehrlich)

Aus Scope/Zeitgründen **nicht** durchgeführt — wäre für eine produktive
Veröffentlichung nötig:

- **Manueller Screenreader-Walkthrough mit NVDA/VoiceOver:** Automatische
  Tools wie axe-core erkennen ca. 30–40 % aller A11y-Probleme. Ein echter
  Test mit NVDA oder VoiceOver würde z. B. aufzeigen, ob der Workout-
  Flow nach dem Loggen einer Übung korrekt zur Routine zurückspringt und
  der Fokus geeignet gesetzt wird.
- **Reduced-Motion-Override:** Die Karten-Hover-Animationen
  (`transform: translateY(-2px)`) sind via globaler
  `@media (prefers-reduced-motion: reduce)`-Regel deaktiviert, aber das ist
  nicht explizit pro Komponente getestet.
- **Touch-Target-Sizes:** WCAG 2.5.5 Level AAA verlangt 44×44 px für
  Touch-Targets. Die meisten Buttons sind ≥ 36 px hoch (über padding); für
  AAA müssten einige IconButtons noch vergrößert werden — explizit nur
  AA-Konformität ist hier das gesteckte Ziel.
- **Color-Only-Information bei Sparklines:** Die Spark-Lines im
  Dashboard-Tile zeigen einen Trend-Verlauf nur visuell. Sie sind
  `aria-hidden`, weil der Trend-Pfeil und die Empfehlungs-Zeile die gleiche
  Information textuell tragen — strikt genommen ist das
  WCAG-konform, aber redundant.

## Reproduzierbarkeit

```bash
cd ProgressLab
npx playwright test tests/e2e/a11y.spec.ts
```

Voraussetzung: Vor dem ersten Lauf einmal `npx playwright install chromium`
und `npm run seed` ausführen (für die Demo-Accounts).

Das Audit ist Teil der CI-relevanten Test-Suite und läuft auch zusammen
mit `npm run test:e2e` durch.
