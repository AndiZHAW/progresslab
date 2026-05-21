# ADR-0007: Service Worker — `network-only` für API und HTML, kein Runtime-Cache

- **Status:** Accepted
- **Datum:** 2026-05-20
- **Beteiligte:** Andi Kadolli
- **Bezug:** Verfeinert die Strategie aus [ADR-0005](0005-pwa-custom-service-worker.md);
  ersetzt dort ausschliesslich die Behandlung von `/api/*` und HTML-Routen.

## Kontext

ADR-0005 hatte für `/api/*` und HTML-Pages eine `networkFirst`-Strategie vorgesehen, die
bei Offline-Situation auf einen separaten `RUNTIME_CACHE` mit der letzten erfolgreichen
Antwort zurückgreift. Während der Code-Review der Sicherheits- und UX-Härtungen
(siehe Commit-Reihe `76801b5`, `ebeb668`) fielen zwei Probleme auf:

1. **Multi-User-Leak auf geteiltem Gerät:** Wenn User A im selben Browser arbeitet, sich
   abmeldet und User B sich anmeldet, würde der RUNTIME-Cache von User A weiterhin
   User-spezifische Antworten ausliefern, bis B eigene Requests gemacht hat. Im
   Trainings-Kontext heisst das: B sieht im Worst Case A's Routinen oder Sessions, bevor
   das Backend übersteuert.
2. **Stale-Empfehlungen nach Logout/Login derselben Person:** Beim Logout wird zwar das
   Session-Cookie gelöscht, der Service-Worker-Cache aber nicht. Beim erneuten Login
   konnte für einen kurzen Moment der alte JSON-Stand erscheinen, was die Empfehlungs-
   Engine durcheinanderbringt (die immer auf der jüngsten Session basieren soll).
3. **DSGVO-Vorsicht:** User-Daten in einem Browser-Cache zu halten ist für einen Prototyp
   noch unproblematisch, aber bei der Bewertung wird auf saubere Trennung von Identitäten
   geachtet — und für die finale Abgabe wollen wir ein einfaches, defensives Modell.

Alternativen, die geprüft wurden:

- **Cache pro User** (Key = `pl-runtime-${userId}-${version}`): zu komplex, Worker hat
  keinen direkten Zugang zur Session-ID.
- **Cache bei Logout invalidieren**: erfordert eine Worker-Message vom Logout-Handler;
  zusätzlicher Code, der bei Fehler stille User-Leaks erlaubt.
- **Network-Only**: einfachste, defensivste Lösung. Trade-off: keine offline-lesbaren
  Trainings-Daten mehr.

## Entscheidung

`/api/*` und HTML-Pages werden **immer aus dem Netz** geladen.

```ts
// ProgressLab/src/service-worker.ts
sw.addEventListener('fetch', (event) => {
  ...
  if (isApi(url)) { event.respondWith(networkOnly(req, true)); return; }
  if (isAsset(url)) { event.respondWith(cacheFirst(req)); return; }
  event.respondWith(networkOnly(req, false)); // HTML-Pages
});
```

`networkOnly(req, apiRequest)` versucht `fetch`; bei Failure liefert es eine 503-Antwort
(JSON bei API, Plain-Text bei HTML).

`/_app/*` und in `[...build, ...files]` aufgeführte Assets bleiben `cacheFirst` —
das sind versionierte, immutable Bundles, die kein User-Leak-Risiko haben.

## Begründung

- **Sicherheit > Offline-Komfort** für diesen Prototyp. Ein Trainings-Logger ohne Netz
  ist eine Komfort-Verbesserung, aber ohne Netz kann man eh keine neuen Sessions
  speichern — der Cache-Fallback liefert also nur ein nicht-veränderbares Bild.
- **Einfacheres Modell** ist im Code-Review schneller nachzuvollziehen und schwerer
  falsch zu bedienen.
- **Konsistenz mit dem RPE-Coach-Konzept:** die Empfehlung muss immer auf der jüngsten
  Session basieren, ein stale Cache würde die Engine sabotieren.

## Konsequenzen

**Positiv:**

- Kein Multi-User-Leak möglich.
- Kein „Stale Empfehlung"-Phänomen nach Logout/Login.
- Service-Worker-Code wird kleiner (kein RUNTIME-Cache mehr zu warten).
- Aktiver Logout reicht — keine extra Cache-Invalidation nötig.

**Negativ / Trade-offs:**

- Offline-Lesen von Trainings-Daten nicht mehr möglich (war im Prototyp ohnehin
  nicht produktiv nutzbar).
- Falls die App in Zukunft echten Offline-First-Use-Case bekommt (z. B. „im Studio
  ohne 5G Sätze loggen, später syncen"), müsste die Strategie revidiert werden —
  dann mit User-spezifischem Cache und einer Sync-Queue.
- Bei Netz-Aussetzern ist die App komplett unbenutzbar (statt nur lesbar). Für den
  Use-Case (Krafttraining-Logger meist im WLAN-fähigen Studio oder zu Hause) akzeptabel.

## Verifikation

- `ProgressLab/src/service-worker.ts:47–48,57` — `networkOnly(req, true)` für `/api/*`,
  `networkOnly(req, false)` für sonstige HTML-Routen.
- `README.md §4.15` — bereits konsistent: „API- und HTML-Requests bleiben `network-only`".
- Live-Test: nach Logout liefert `/api/sessions` einen 401 statt eines stale-Cache-Eintrags.
