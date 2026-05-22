# Issue Map – ProgressLab Usability Evaluation

Stand: 20.05.2026  
Methode: moderiert, on-site, Think-Aloud, Laptop/Chrome  
Stichprobe: 2 IT-Studierende (entspricht der Übungsvorgabe für das gegenseitige Testing)

## Ergebnis pro Aufgabe

| Aufgabe | Erfolgsquote | Zeit | Hilfe nötig | Kernerkenntnis |
|---|---:|---:|---:|---|
| 1. Empfehlung einer Übung verstehen | 2/2 | 45–75 s | 0/2 | Empfehlung wird gefunden; Sparkline/RPE werfen Rückfragen auf. |
| 2. Session erfassen | 2/2 | 70–90 s | 1/2 | Logger funktioniert schnell; RPE und vorbefüllte Werte brauchen Kontext. |
| 3. Geführte Routine starten | 0/2 vollständig ohne Hilfe | 130–150 s | 2/2 | Begriff und Einstieg „Routinen" waren zu wenig sichtbar. |
| 4. Persönlichen Bestwert finden | 2/2 | 30–50 s | 0/2 | Detailseite/PR-Werte werden intuitiv gefunden; Records-Übersicht wurde zusätzlich erwartet. |

## Priorisierte Findings

| # | Severity nach Nielsen | Finding | Beleg | Umgesetzte / geplante Reaktion |
|---|---:|---|---|---|
| 1 | 3 | Routine-/Workout-Modus wird nicht sofort als geführtes Training erkannt. | Beide Testpersonen suchten zuerst im Dashboard bzw. über einzelne Push-Übungen. | Mobile Tab-Bar, Dashboard-Quickstarts und klarer „Nächste Übung"-Block im Workout-Modus umgesetzt. |
| 2 | 3 | RPE ist nicht für alle Nutzer:innen selbsterklärend. | TP02 fragte explizit, ob 7 schwer oder mittel bedeutet. | RPE-Hilfekarte im Set-Logger umgesetzt. |
| 3 | 2 | Vorbefüllte Logger-Werte wirken kurz wie Pflichtwerte statt Empfehlung. | Beide Testpersonen stockten kurz bei den vorgeschlagenen Werten. | RPE-/Empfehlungskontext im Logger deutlicher gemacht; weiteres Onboarding bleibt offen. |
| 4 | 2 | Speichern-Feedback könnte auffälliger sein. | TP02 übersah kurz den Confirmation-Screen. | Confirmation-Screen und Toasts bleiben vorhanden; PR-/Success-Animation als spätere Erweiterung. |
| 5 | 1 | Sparkline auf Tiles ist ohne Tooltip nicht eindeutig. | Beide Testpersonen fragten, was die kleine Linie bedeutet. | Als Low-Priority-Follow-up markiert. |

## Abgeleitete Erweiterungsideen

- Pausentimer zwischen Sätzen.
- Kurzes Onboarding beim ersten Login.
- Kalenderansicht der Trainingstage.
- Schneller Start „heutiges Push/Pull/Legs trainieren" direkt vom Dashboard.
- Erfolgsanimation bei neuem PR.
