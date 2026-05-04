# ADR-0006: Code im `ProgressLab/`-Subfolder, Doku am Repo-Root

- **Status:** Accepted
- **Datum:** 2026-05-02
- **Beteiligte:** Andi Kadolli

## Kontext

Im ZHAW-Projekt entstehen **zwei Klassen von Artefakten**, die beide ins Repo
gehören:

1. **Methodische Artefakte** (PDF-Dokumente, Mockup-HTML, Sketches, Personas)
   aus den Wochen 8–10 — sind Teil der Bewertung und müssen mit dem Code
   versionskontrolliert sein.
2. **SvelteKit-Code** mit eigener `package.json`, `node_modules`,
   `.svelte-kit/`, `static/` etc.

Initial lag beides am Repo-Root (`Projekt/`). Das war für ~10 Commits
funktional, hatte aber zwei Probleme:

- `ls` im Repo-Root zeigte ~25 Items gemischt aus Code und Doku.
- Bei Netlify musste der Build-Pfad genau auf den Root gesetzt werden, was
  Reviewer verwirrte.

Die Frage: sauber trennen oder so lassen?

## Entscheidung

**Code in `ProgressLab/`-Subfolder verschoben, Doku am Repo-Root.**

```
Projekt/                          (Repo-Root)
├── README.md                     Hauptdoku, Bewertungsrelevant
├── docs/adr/                     Architecture Decision Records
├── *.pdf, *.docx, *.png          Mockup, Sketches, Aufgabenstellungen
├── ProgressLab_Prototyp.html     Klickbarer Prototyp (Woche 10)
├── netlify.toml                  Build-Config mit base="ProgressLab"
└── ProgressLab/                  SvelteKit-Code
    ├── package.json
    ├── src/
    ├── static/
    ├── tests/
    └── ...
```

Konkrete Schritte (Commit `bbb0a2d` und Folgende):

- `git mv` für alle SvelteKit-Files in den Subfolder (Git-History bleibt erhalten).
- `netlify.toml` am Root mit `[build] base = "ProgressLab"` — Netlify
  erkennt das automatisch und führt `npm install` und `npm run build` im
  Subfolder aus.
- README am Root verweist auf `ProgressLab/`-Setup-Anleitung.
- `.gitignore` am Root, deckt sowohl Root-Doku als auch Subfolder-Code ab.

## Begründung

**Trennung gewählt, weil:**

- Reviewer sehen am Root sofort die Methodik-Artefakte (PDFs, Mockup) ohne
  durch `node_modules`-Konfigurationsdateien scrollen zu müssen.
- Die Kapitel der README können auf konkrete Code-Pfade
  (`ProgressLab/src/...`) verweisen, ohne dass diese Pfade lang werden
  müssten.
- Future-Proofing: falls eine Companion-App (z. B. mobile React-Native-App)
  dazu kommt, hat sie ihren eigenen Subfolder neben `ProgressLab/`.
- Die Aufgabenstellung verlangt ausdrücklich, dass beides im selben Repo
  ist — Mono-Repo-artige Struktur ist hierfür der Standardansatz.

**Alternativen verworfen:**

- **Zwei separate Repos** (Code + Doku) — verletzt die Anforderung, alles
  in einem Repo zu haben.
- **Doku in `ProgressLab/docs/`** — würde Code-Reviewer zu Mockup-PDFs
  schicken, schlechte Information-Hierarchie.
- **Status quo (alles am Root)** — dokumentationstechnisch unsauber,
  hohe kognitive Last für Reviewer.

## Konsequenzen

**Positiv:**

- Klare Trennung von Konzern-Doku und Implementierung.
- Netlify-Setup ist ein Einzeiler in `netlify.toml` und unter `Site
  configuration → Build & deploy → Base directory` ohnehin sichtbar.
- E2E-Tests, Playwright-Reports und sonstige Build-Artefakte landen alle
  innerhalb von `ProgressLab/` und sind über die `.gitignore` einheitlich
  ausgeschlossen.

**Negativ / Trade-offs:**

- Alle Coding-Befehle müssen ein `cd ProgressLab` voranstellen oder die
  npm-Skripte in der README erläutern das. Im README ist das im
  Setup-Kapitel explizit dokumentiert.
- Beim Klonen müssen die Reviewer den Subfolder als Working-Directory in
  ihrem IDE öffnen — kleines Detail, kein Showstopper.
