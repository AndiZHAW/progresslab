# ADR-0005: PWA mit Custom Service Worker statt vite-plugin-pwa

- **Status:** Accepted (Cache-Strategie für API/HTML revidiert — siehe
  [ADR-0007](0007-service-worker-network-only-fuer-api.md))
- **Datum:** 2026-05-02
- **Beteiligte:** Andi Kadolli

## Kontext

Die App soll als **Progressive Web App** installierbar sein und im Offline-
Fall sinnvoll reagieren (Erweiterung 4.15). SvelteKit unterstützt das
nativ über die `src/service-worker.ts`-Konvention. Die Alternative wäre
`@vite-pwa/sveltekit`, das auf `Workbox` aufbaut und eine deklarative
Konfigurations-Schicht bietet.

Anforderungen für den Prototyp:

- Statische Assets (HTML-Shell, JS-Bundles, CSS, Icons) sollen im
  Cache-First-Modus geliefert werden.
- API-Anfragen sollen **network-first mit Cache-Fallback** funktionieren —
  damit der User offline noch die zuletzt geladenen Daten sieht.
- Beim Wechsel der App-Version müssen alte Caches gelöscht werden.
- Service Worker und Manifest müssen mit `adapter-netlify` deployt werden
  (Pfad-Auflösung im Build).

## Entscheidung

**Custom `src/service-worker.ts` mit eigenem Cache-Layer + statisches
`static/manifest.webmanifest`.**

- Ursprüngliche Strategie (May 2026):
  - `/api/*` → `networkFirst` mit Fallback auf einen `RUNTIME_CACHE`, sonst 503-JSON.
  - `/_app/*` und vorgegebene Assets → `cacheFirst`.
  - Alle anderen GET-Requests (HTML-Pages) → `networkFirst`.
- **Aktualisierte Strategie (siehe ADR-0007):**
  - `/api/*` und HTML-Pages → `networkOnly` (kein Cache-Fallback, keine
    Mehr-User-Leaks).
  - `/_app/*` und vorgegebene Assets → `cacheFirst` (unverändert).
- Auf `install`: `caches.open(STATIC_CACHE).addAll([...build, ...files])`.
- Auf `activate`: alte Caches der Vor-Version löschen, `clients.claim()`.

## Begründung

**vite-plugin-pwa abgelehnt:**

- Bringt Workbox + Glob-Patterns + manifest-Generierung — alles Pakete, die
  ein einfacher Prototyp nicht braucht.
- Die deklarative Konfiguration ist mächtig, aber der Custom-Code ist mit
  ~80 Zeilen klein und im Code-Review vollständig nachvollziehbar.
- SvelteKit's eingebaute Auflösung von `$service-worker` (mit `build`,
  `files`, `version` aus `@sveltejs/kit`) ist ausreichend.

**Network-First für API:**

- API-Daten ändern sich häufig (jede neue Session ändert Empfehlungen).
- Cache-First mit kurzem TTL würde die Komplexität erhöhen, ohne im
  Prototyp-Use-Case einen klaren Gewinn zu liefern.
- Im Offline-Fall liefert der RUNTIME-Cache die letzte erfolgreiche Antwort,
  was für eine Trainings-App völlig ausreicht ("ich sehe meinen letzten
  bekannten Stand, kann aber nichts loggen, bis ich wieder online bin").

**Manifest hand-written:**

- Manifest ist ~30 Zeilen JSON — einmal schreiben, selten ändern.
- Theme-Color (`#0d9488` Teal) und Icons (192/512/maskable, generiert via
  `npm run icons` aus `static/icon.svg` mit `sharp`) sind explizit
  versioniert.

## Konsequenzen

**Positiv:**

- Kein zusätzliches Build-Tool oder Plugin → schnellere Builds.
- Service-Worker-Code ist im Repo direkt einsehbar; kein generierter Code.
- Cache-Versionierung über `version` aus `$service-worker` führt zu sauberer
  Invalidierung beim nächsten Deploy (jeder Build hat eine neue Version-Hash).
- Bei Bedarf kann später trotzdem auf `vite-plugin-pwa` migriert werden, da
  das Manifest-Schema W3C-Standard ist.

**Negativ / Trade-offs:**

- Kein Fallback-HTML für komplette Offline-Routen (z. B. eigene
  `offline.html`-Shell). Kommt zukünftig dazu, falls echter Offline-Use-Case.
- Background-Sync und Push-Notifications sind nicht implementiert — würden
  vom Plugin out-of-the-box mitkommen, sind aber nicht in Scope.
- Manuelle Wartung des Cache-Strategie-Codes; bei wachsendem Routenraum
  kann das aufwendiger werden.
