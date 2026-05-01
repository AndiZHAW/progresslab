# ProgressLab – Klickbarer Prototyp (Woche 10)

## So benutzt du den Prototyp

1. **Öffnen**: Doppelklick auf `ProgressLab_Prototyp.html` – öffnet sich im Browser (Chrome / Firefox / Safari, alles geht).
2. **Vollbild** (für Screen-Recording): Button oben rechts „⛶ Vollbild" oder `F11`.
3. **Reset**: Button oben rechts „↺ Reset" – bringt dich jederzeit zurück zum Start.

## Was funktioniert (echte Klick-Interaktionen)

| Aktion | Resultat |
|---|---|
| Tap auf eine Kachel | öffnet Detail-Screen mit dem korrekten Übungsnamen + Empfehlung |
| Tap „Empfehlung akzeptieren" | grüner Toast „✓ Geplant" + Button-State ändert sich |
| Tap Filter-Tabs (Alle / Push / Pull / Legs) | Grid wird live gefiltert |
| Tap FAB („+") | Modal mit Session-Picker schiebt von unten rein |
| Tap „+" neben einer Übung | Übung wird ausgewählt (✓), Counter unten zählt hoch |
| Tap „Weiter" | Wechsel zum Set-Logger mit vorbefüllten Empfehlungs-Werten |
| Tap auf Eingabefeld | Numerische Eingabe, Werte editierbar |
| Tap „+ Satz hinzufügen" / „×" | Sätze hinzufügen / entfernen |
| Tap „Session speichern" | Bestätigungs-Screen mit aktualisierter Coach-Empfehlung |
| Back-Pfeil im Header | zurück zum vorherigen Screen |

## Workflows zum Aufnehmen (für dein Video)

### Workflow A – Empfehlung akzeptieren (~ 15 Sek.)
1. Start auf Dashboard
2. Tap Filter „Push" – Grid filtert sich
3. Tap Filter „Alle" – Grid zeigt wieder alle
4. Tap auf Kachel „Back Squat"
5. Tap „Empfehlung akzeptieren" – Toast erscheint
6. Tap Back-Pfeil (‹) – zurück zum Dashboard

### Workflow B – Session loggen (~ 30 Sek.)
1. Start auf Dashboard
2. Tap FAB („+") – Session-Picker erscheint
3. Tap „Bench Press" – wird ausgewählt (✓)
4. Tap „Weiter ›"
5. Im Set-Logger: optional einen Satz-Wert ändern (z. B. RPE auf 8)
6. Tap „+ Satz hinzufügen" – 4. Satz erscheint
7. Tap „×" beim 4. Satz – wird wieder entfernt
8. Tap „Session speichern" – Bestätigungs-Screen mit aktualisierter Empfehlung
9. Tap „Zum Dashboard"

## Screen-Recording Tools

- **macOS**: `Shift + Cmd + 5` (eingebaut, kann mit Audio aufnehmen)
- **Windows**: `Win + Alt + R` (Game-Bar) oder OBS Studio (kostenlos)
- **Linux**: SimpleScreenRecorder, Kazam oder OBS

Empfohlene Auflösung: 1280 × 720 oder höher, Bildausschnitt nur auf das Phone-Frame in der Mitte.

## Abgabeformat auf Moodle

Lade hoch:
- **Doku-PDF** (`Woche10_UI-Prototyping_Andi_Kadolli.pdf`) mit allen Designentscheiden, Workflows und Screen-Specs
- **Video** des Prototyp-Durchlaufs (z. B. .mp4)
- Optional: das HTML-File selbst (`ProgressLab_Prototyp.html`) als Backup

In der Doku ist Kapitel 0 für den „Link zum Prototyp" reserviert – ersetze den Platzhalter durch einen Hinweis auf das beigelegte Video bzw. HTML-File.
