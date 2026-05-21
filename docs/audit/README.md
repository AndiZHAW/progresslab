# Audit-Artefakte

Dieses Verzeichnis dokumentiert die KI-gestützten Self-Audits, die während der
Projektarbeit durchgeführt wurden. Sie sind Teil der KI-Deklaration im
[Haupt-README §6](../../README.md#6-ki-deklaration) und belegen die
methodische Hartung der App vor der finalen Abgabe.

## Berichte

| Datei | Datum | Zweck |
|---|---|---|
| [`audit-2026-05-21.md`](audit-2026-05-21.md) | 2026-05-21 | Voll-Audit nach `prompts/ULTIMATE_AUDIT_PROMPT.md`, lieferte 12 Findings + Roadmap zur Note 6 |
| [`audit-codex-2026-05-21.md`](audit-codex-2026-05-21.md) | 2026-05-21 | Ergänzungs-Audit durch Codex nach den Vor-Audit-Fixes; prüft lokalen Stand vs. GitHub/Netlify und neue Rest-Risiken |

## Prompts

Die genau verwendeten KI-Prompts liegen unter [`prompts/`](prompts/) als
Markdown-Files. Damit ist nachvollziehbar, mit welchen Regeln (z. B. „Kein
Netlify-Deploy ohne explizites Go", „Belege mit Datei+Zeile") die Audits
durchgeführt wurden.

| Prompt | Verwendung |
|---|---|
| [`CODEX_REVIEW_PROMPT.md`](prompts/CODEX_REVIEW_PROMPT.md) | Ursprünglicher Review-Prompt für Codex; lieferte die UX-/Security-Härtungs-Runde (Commits `76801b5`, `ebeb668`, `0fda8fb`) |
| [`ULTIMATE_AUDIT_PROMPT.md`](prompts/ULTIMATE_AUDIT_PROMPT.md) | Voll-Audit-Prompt für Claude; lieferte den Bericht `audit-2026-05-21.md`. Enthält in §0.5 den **Stand der Vor-Audits**, damit ein nachfolgender Agent (Codex) nicht doppelt zählt. |
