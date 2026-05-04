# ADR-0002: MongoDB Atlas + Mongoose statt relationaler Datenbank

- **Status:** Accepted
- **Datum:** 2026-05-01
- **Beteiligte:** Andi Kadolli

## Kontext

Die Aufgabenstellung (`Uebung 11 - Prototyping mit KI.pdf`) gibt **MongoDB**
als Persistenz-Layer vor. Offen war:

- **Hosting:** MongoDB Atlas (managed) vs. lokales Docker-Setup vs.
  `mongodb-memory-server` für Tests.
- **Driver:** nativer `mongodb`-Driver vs. ODM (Mongoose, Prisma).

Datenmodell-Anforderungen aus dem Mockup (Woche 10):

- 4 Hauptcollections (Users, Sessions, Exercises, Templates) mit klaren
  Schemas.
- Pro Session ein eingebettetes `sets`-Array mit fixer Struktur.
- Validierung der Eingaben (Gewicht 0–1000 kg, RPE 1–10) zentral, nicht in
  jedem Endpoint einzeln.

## Entscheidung

**MongoDB Atlas Free-Tier + Mongoose 9 als ODM.**

- Connection-String in `.env` (`MONGODB_URI`) — niemals committed.
- Connection-Singleton in `src/lib/server/db.ts` cacht die Promise und
  re-used die Connection über alle Requests.
- Schemas in `src/lib/server/models/{Exercise,Session,User,Template}.ts`
  mit `InferSchemaType` für TypeScript-Typen.

## Begründung

**Atlas Free-Tier statt Local:**

- Netlify-Functions können nicht auf `localhost:27017` zugreifen — eine cloud-
  hostete DB ist für Deployment ohnehin nötig.
- Atlas Free-Tier (M0, 512 MB) reicht für den Prototyp problemlos.
- Test-Workflow funktioniert mit derselben DB — kein doppeltes Setup.

**Mongoose statt nativer Driver:**

- Schema-Validierung zentral im Model statt verstreut in jeder API-Route
  (Beispiel: `min/max` für `weight`, `reps`, `rpe`).
- `InferSchemaType<typeof schema>` liefert TS-Typen direkt aus der Schema-
  Definition — keine doppelte Wahrheit.
- Indizes deklarativ (z. B. `sessionSchema.index({ userId: 1, exerciseId: 1, date: -1 })`).
- Trade-off: Mongoose hat eine Lernkurve und einen ESM-Import-Quirk
  (`models` ist nicht als named export verfügbar — siehe ADR-0001).

**Kein Prisma:**

- Prisma erzwingt einen separaten Build-Schritt (Migration), für einen
  Prototyp Overhead ohne Mehrwert.
- Im Prisma + MongoDB-Modus ist das Mongoose-Schema-Validierungs-System
  ohnehin nicht ersetzt, also kein netto-Gewinn.

## Konsequenzen

**Positiv:**

- Schema-Migrationen sind nicht nötig — neue Felder können einfach mit
  Default-Werten ergänzt werden.
- Eingebettete `sets`-Arrays in `Session` ergeben atomare Schreibvorgänge
  (eine Session = ein Document, keine Joins).
- Aggregations (z. B. `stats-service.ts`) laufen serverseitig in der
  MongoDB-Pipeline; im Prototyp aber bewusst noch in JS aggregiert für
  Lesbarkeit.

**Negativ / Trade-offs:**

- Foreign-Key-Integrität ist nicht garantiert — beim Löschen einer Übung
  blocken wir manuell wenn Sessions verknüpft sind (siehe
  `routes/api/exercises/[id]/+server.ts`).
- ESM-Import-Quirk (`mongoose.models.X` statt `models.X`) musste einmal
  überall durchgezogen werden.
- Atlas-Credential ist in `.env` und damit nicht ins Repo committed; bei
  Netlify-Deploy muss er separat im Dashboard gesetzt werden (dokumentiert
  im README, Abschnitt 8).
