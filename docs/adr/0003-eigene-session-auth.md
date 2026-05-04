# ADR-0003: Eigene Session-Cookie-Auth statt Lucia oder Better-Auth

- **Status:** Accepted
- **Datum:** 2026-05-01
- **Beteiligte:** Andi Kadolli

## Kontext

Die App soll **User-Konten mit Rollen-Trennung (User / Admin)** unterstützen
(Erweiterung 4.1). Optionen:

1. **Lucia** — populäre Auth-Lib für SvelteKit, sehr expressiv.
2. **Better-Auth** — neuer Standard, integriert in `sv create --add better-auth`.
3. **Eigene minimale Implementierung** mit `bcryptjs` und HTTP-Only-Cookies.

Constraints:

- Single-User-Prototyp, keine OAuth- oder Email-Verifikation gefordert.
- Bewertungs-Rubrik gewichtet "nachvollziehbare Code-Struktur" — externe
  Auth-Libs ziehen Lerngebiete und teils mehrere Tabellen mit.
- Demo-Accounts (`demo`, `admin`) müssen einfach reproduzierbar sein
  (Seed-Skript).

## Entscheidung

**Eigene Cookie-Session-Auth in <120 Zeilen Code:**

- `bcryptjs` für Passwort-Hashes (kein Native-Build, läuft auf Netlify-Functions).
- 32-Byte-Hex-Token in einer `SessionToken`-Collection mit `expiresAt` (30 Tage TTL).
- HTTP-Only-Cookie `pl_session`, in Production `Secure`-Flag.
- Hooks in `src/hooks.server.ts` setzen `event.locals.user` pro Request.
- Admin-Guard in `routes/admin/+layout.server.ts` (eine Zeile: `throw error(403)`).

## Begründung

**Lucia ausgeschlossen, weil:**

- Lucia v3 hat in 2024 ein Major-Refactor durchgemacht; Doku und Tutorials
  sind teils veraltet.
- Lucia-Adapter für Mongoose existiert nur als Community-Paket — zusätzliche
  Abhängigkeit ohne LTS-Garantie.
- Lucia bringt Account-Linking, OAuth, Email-Verifikation mit — alles
  Features, die hier nicht gebraucht werden.

**Better-Auth ausgeschlossen, weil:**

- Setup zwingt zu einer separaten DB-Schema-Verwaltung.
- Demo-Accounts vorzubefüllen ist umständlicher als mit eigener `User`-Mongoose-Collection.

**Eigene Lösung gewählt, weil:**

- Implementierung ist transparent, voll im Code-Review sichtbar (4 Dateien,
  zusammen <200 Zeilen).
- Schema-Hoheit bleibt beim Mongoose-Model (`src/lib/server/models/User.ts`).
- Zu Demo-Zwecken: Seed-Skript hashtag User direkt mit bcrypt — einfacher
  Reset.

**Sicherheitseinschätzung (transparent):**

- HTTP-Only-Cookie schützt vor XSS-getriggertem Token-Diebstahl.
- `SameSite: Lax` schützt vor klassischem CSRF auf Logout/Delete.
- bcrypt-Cost 10 ist ausreichend (~80 ms pro Hash auf Atlas-M0).
- **Nicht enthalten:** Rate-Limiting auf `/api/auth/login` → für Production
  zwingend nötig, im Prototyp dokumentiert (siehe ADR-Liste, möglicher
  Folge-ADR).

## Konsequenzen

**Positiv:**

- Auth-Code ist im Code-Review nachvollziehbar — keine Magic.
- Wenn die App eines Tages erweitert wird (OAuth, Magic-Links), kann auf
  Lucia migriert werden, ohne dass die jetzige Implementierung "im Weg ist".
- E2E-Tests können `login()`-Helper direkt schreiben, ohne Auth-Lib-Internals
  zu kennen.

**Negativ / Trade-offs:**

- Kein Brute-Force-Schutz out of the box — geplant als zukünftige Erweiterung.
- Token-Rotation, Refresh-Tokens und Multi-Device-Logout sind nicht implementiert
  (würde Lucia liefern).
- Bei einer Skalierung auf produktive Lasten wäre eine bewährte Auth-Lib
  zwingend.
