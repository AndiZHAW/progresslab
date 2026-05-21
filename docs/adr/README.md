# Architecture Decision Records (ADR)

Dieses Verzeichnis dokumentiert die wichtigsten Architektur-Entscheide im Projekt
nach dem Format von **Michael Nygard** (Title · Status · Context · Decision ·
Consequences).

ADRs werden geschrieben, wenn eine Entscheidung Auswirkungen auf den Code-Aufbau,
die Datenstruktur oder spätere Entwicklung hat — und insbesondere dann, wenn
mehrere plausible Alternativen existieren. Jeder ADR hält Datum, Begründung und
die Konsequenzen fest, sodass spätere Reviewer (und das eigene Future-Self) den
Entscheid nachvollziehen können.

## Übersicht

| Nr. | Titel | Status |
|---|---|---|
| [0001](0001-sveltekit-typescript.md) | SvelteKit + TypeScript als Tech-Stack | Accepted |
| [0002](0002-mongodb-mongoose.md) | MongoDB Atlas + Mongoose statt relationaler DB | Accepted |
| [0003](0003-eigene-session-auth.md) | Eigene Session-Cookie-Auth statt Lucia/Better-Auth | Accepted |
| [0004](0004-recommendation-pure-function.md) | Recommendation-Engine als reine Funktion | Accepted |
| [0005](0005-pwa-custom-service-worker.md) | PWA mit Custom Service Worker statt Plugin | Accepted (Cache-Strategie revidiert in ADR-0007) |
| [0006](0006-repo-struktur-progresslab-subfolder.md) | Code im `ProgressLab/`-Subfolder, Doku am Root | Accepted |
| [0007](0007-service-worker-network-only-fuer-api.md) | Service Worker: `network-only` für API und HTML | Accepted |

## Vorlage

Neue ADRs können von [`0000-template.md`](0000-template.md) abgeleitet werden.
