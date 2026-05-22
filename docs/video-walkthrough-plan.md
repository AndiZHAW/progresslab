# Walkthrough-Video-Plan

Ziel: 7 bis 9 Minuten, ruhig demonstrieren, nicht jede Code-Entscheidung erklären.
Das Video soll beweisen, dass ProgressLab live funktioniert und die wichtigsten Workflows
zusammenhängend nutzbar sind.

## Ablauf

1. **Kurzstart (30 s)**
   - App-URL zeigen.
   - In einem Satz erklären: ProgressLab loggt Training und berechnet nachvollziehbare Empfehlungen.

2. **Login und Dashboard (60 s)**
   - Mit `demo / demo1234` einloggen.
   - Dashboard, Push/Pull/Legs-Filter, Suche/Sortierung, Why-Zeilen und Sparklines zeigen.
   - Kurz sagen, dass die Daten aus MongoDB geladen werden.

3. **Workflow A: Empfehlung verstehen und planen (90 s)**
   - Bench Press öffnen.
   - Detailseite zeigen: Empfehlung, Warum-Abschnitt, Chart, letzte Sessions, Records.
   - Empfehlung akzeptieren oder manuell anpassen.
   - Sichtbares Feedback zeigen: Plan-Banner für die nächste Session.

4. **Workflow B: Session loggen (90 s)**
   - Über “Jetzt loggen” in den Logger wechseln.
   - Zeigen, dass geplante Werte übernommen wurden.
   - Satz hinzufügen/löschen oder Werte ändern.
   - Ungültigen Wert kurz zeigen, Fehlermeldung sichtbar machen, dann korrigieren.
   - Session speichern und Confirmation-Screen mit aktualisierter Empfehlung zeigen.

5. **Routinen und Workout-Modus (75 s)**
   - Routinen-Übersicht zeigen.
   - Eine Routine starten.
   - Geführten Workout-Modus mit Fortschritt und “Nächste Übung” zeigen.
   - Routine bearbeiten kurz zeigen, aber nicht zwingend speichern.

6. **Coach-ID und generierte Pläne (75 s)**
   - Coach-ID öffnen.
   - Ziel/Erfahrung/Trainingstage zeigen.
   - Plan generieren, Erfolgsmeldung zeigen.
   - Auf Routinen wechseln und generierte Coach-Routinen zeigen.

7. **Stats, Records, Export (60 s)**
   - Statistikseite mit Heatmap und Volumen-Chart zeigen.
   - Records-Seite mit e1RM zeigen.
   - CSV-Export erwähnen und Button zeigen.

8. **Admin und Qualität (60 s)**
   - Kurz mit Admin lokal zeigen oder erklären: Übungen anlegen/bearbeiten/löschen.
   - Read-only-Schutz auf Live-App erwähnen.
   - Tests nennen: `check`, `lint`, `unit`, `build`, `27 E2E`, A11y mit 0 kritischen Violations.

## Nicht unnötig erklären

- Keine lange Code-Tour.
- Keine KI-Story im Detail; nur KI-Deklaration in README erwähnen.
- Keine alten Mockups vollständig durchgehen.
- Keine Netlify-Credit-Diskussion im Video.

## Stolperfallen

- Vor Aufnahme final deployen und einmal live testen.
- Demo-Daten nicht während der Aufnahme kaputt machen; bei Bedarf vorher seeden.
- Beim Admin-Teil beachten: Live-Demo-Admin ist read-only, lokaler Admin ist voll nutzbar.
- Nicht zu lange auf Charts verweilen; Hauptworkflow ist wichtiger.
