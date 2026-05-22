# Finale Abgabe-Checkliste

Stand: 22.05.2026. Diese Liste ist für den letzten Durchlauf vor GitHub-Push, Netlify-Deploy
und Videoaufnahme gedacht.

## Vor dem Push

- Aus Root-Repo arbeiten: `C:\Users\andik\OneDrive\ZHAW\4. Semester\Prototyping\Projekt`
- Nicht aus dem verschachtelten `ProgressLab/.git` pushen.
- Lokal prüfen:
  - `cd ProgressLab`
  - `npm run check`
  - `npm run lint`
  - `npm run test:unit`
  - `npm run build`
  - `npm run test:e2e`
- `git status --short --branch` im Root prüfen.
- Einmal kontrollieren, ob `.env` nicht gestaged ist.

## Gebündelter Push und Deploy

- Erst pushen, wenn Netlify-Credits dafür eingeplant sind.
- Genau einen gebündelten Push auf `main` machen.
- Netlify-Build abwarten.
- Keine weiteren kleinen Korrektur-Pushes, bevor die Live-Version geprüft ist.

## Nach dem Deploy live prüfen

- `https://progresslab.netlify.app/login` lädt.
- Login `demo / demo1234` funktioniert.
- Dashboard zeigt echte Daten.
- Bench Press Detail öffnet.
- Empfehlung akzeptieren oder manuell anpassen zeigt sichtbares Feedback.
- Logger übernimmt geplante Werte.
- Session speichern zeigt Confirmation.
- Dashboard/Detail zeigen danach aktualisierte Empfehlung.
- Routinen öffnen und Workout starten funktioniert.
- Coach-ID speichern und Plan generieren funktioniert.
- Stats, Records und Sessions laden.
- Admin `admin / admin1234` ist live read-only und zeigt verständliche Fehlermeldung.
- Mobile Ansicht bei ca. 390 px Breite prüfen.

## Videoaufnahme

- Video erst nach erfolgreichem Live-Deploy aufnehmen.
- Ablauf aus [`video-walkthrough-plan.md`](video-walkthrough-plan.md) verwenden.
- In der Aufnahme die Live-URL zeigen.
- Mindestens die zwei Hauptworkflows zeigen:
  - Empfehlung anschauen und planen.
  - Session loggen und neue Empfehlung sehen.

## Nicht vergessen

- README muss zur Live-Version passen.
- Screenshots in `docs/evaluation/screenshots-final-local/` belegen den finalen lokalen Stand.
- KI-Deklaration ist im README enthalten.
- Usability-Evaluation mit 2 Studierenden ist dokumentiert und entspricht der Übungsvorgabe.
