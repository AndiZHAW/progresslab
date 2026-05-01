# Ideenfindung – StudyFlow

**Projekttitel:** StudyFlow – Lern- & Prüfungsplaner für Teilzeitstudierende
**Autor:** Andi Bukoshi (ZHAW, Wirtschaftsinformatik, 4. Semester Teilzeit)
**Modul:** Prototyping (FS 2026)

---

## TEIL A – Moodle-Abgabe Ideenfindung

### Problemräume

Das Projekt bewegt sich primär im Problemraum **Bildung**, mit starken Bezügen zu **Digitalisierung** (digitale Selbstorganisation) und **Gesundheit** (Stress- und Workload-Management). Konkret geht es um die Selbstorganisation von Teilzeitstudierenden, die Studium, Erwerbstätigkeit und Privatleben parallel bewältigen müssen. Typische Symptome sind unklare Prüfungsvorbereitung, verpasste Abgaben, Last-Minute-Lernen, fehlende Übersicht über den Gesamtworkload und daraus resultierender Stress.

Weitere, angrenzende Problemräume, die bewusst nicht in den Mindestumfang aufgenommen werden: Gruppenlernen/Peer-Tutoring, institutionelle Stundenplanung (ZHAW), Mental-Health-Coaching.

### Nutzer / Bedürfnisse / Kontext & Herausforderungen

| Nutzer:innen | Bedürfnisse | Kontext / Herausforderungen |
|---|---|---|
| **Teilzeit-Studierende (Primär)** – z. B. WI im 3.–6. Semester, 50–80 % berufstätig | Überblick über alle Module, Prüfungen und Abgaben an einem Ort; realistische Lernplanung; Gefühl von Fortschritt und Kontrolle | Stark fragmentierte Zeitfenster (abends, Wochenende); parallele Deadlines aus mehreren Modulen; keine Zeit für aufwändige Tool-Konfiguration; Prüfungs­stoff ist nur schwer in konkrete Lerneinheiten herunterzubrechen |
| **Vollzeit-Studierende (Sekundär)** | Ähnliche Bedürfnisse, aber mit grösserem Zeitbudget und mehr Parallelmodulen | Tendenz zu „gefühlter Kontrolle" ohne echte Planung; Moodle-Ankündigungen werden leicht übersehen |
| **Dozierende (Stakeholder, indirekt)** | Besser vorbereitete Studierende, weniger Last-Minute-Fragen | Kein direkter Zugriff auf die App, profitieren nur mittelbar |
| **Familie / Arbeitgeber (Stakeholder, indirekt)** | Planbarkeit von gemeinsamer Zeit bzw. Arbeitsleistung | Stoßen auf kurzfristige Absagen rund um Prüfungsphasen |

### How Might We… (HMW)

1. Wie könnten wir Teilzeitstudierenden helfen, ihren Prüfungs- und Abgabedruck über mehrere Module hinweg auf einen Blick zu erfassen?
2. Wie könnten wir grössere Lernziele so in kleine, planbare Lerneinheiten übersetzen, dass sie in fragmentierte Zeitfenster passen?
3. Wie könnten wir ein Gefühl von Fortschritt und Kontrolle schaffen, ohne die App selbst zum zusätzlichen Zeitfresser werden zu lassen?

### Erkenntnisse aus der Recherche

**Wie funktioniert es heute?**
Studierende kombinieren meist mehrere Werkzeuge: den physischen Kalender / Google Calendar für Termine, Moodle für Abgaben, Notion oder OneNote für Notizen und eine To-Do-Liste (Apple Reminders, Todoist, ein Blatt Papier). Prüfungs­vorbereitung entsteht häufig spontan wenige Wochen vor der Prüfung.

**Was gibt es schon? (Bestehende Lösungsansätze)**
- **Notion / Obsidian / OneNote** – sehr flexibel, erfordern aber hohe Einrichtungs­zeit und liefern keine studienspezifische Struktur (Module, Prüfungsgewichtung, ECTS).
- **Todoist / TickTick / Apple Reminders** – gute Task-Verwaltung, aber ohne Konzept von Modulen, Prüfungen oder Lernfortschritt.
- **MyStudyLife, Egenda, Power Planner** – studentische Planer, oft Mobile-first, häufig mit veraltetem UI, begrenztem Web-Support und ohne echten Fortschritts­blick für Teilzeitstudierende.
- **Moodle-Kalender / ZHAW-Stundenplan** – liefern Termine, aber keine Planung von Lernzeit oder Teilaufgaben.

**Was kann verbessert werden?**
Es fehlt eine leichtgewichtige, webbasierte Lösung, die die spezifischen Entitäten eines Studiums (Module mit ECTS, Prüfungen mit Gewichtung, Abgaben, Lerneinheiten) erstklassig modelliert und daraus ein realistisches Dashboard erzeugt. Besonders für **Teilzeit-Studierende** fehlt die Abbildung fragmentierter Zeitfenster und der Bezug zwischen „Stoffumfang" und „noch verfügbaren Lernstunden bis zur Prüfung". Genau dort setzt StudyFlow an.

---

## TEIL B – README.md (Kapitel 1 bis 3.1)

## 1. Ausgangslage

- **Problem:** Teilzeitstudierende verlieren zwischen Beruf, Studium und Privatleben den Überblick über Prüfungen, Abgaben und die effektiv noch verfügbare Lernzeit. Bestehende Tools sind entweder zu generisch (Kalender, Notizen-Apps) oder zu administrativ (Moodle-Kalender) und bilden weder Module mit Prüfungs­gewichtung noch den Bezug zwischen Lernzielen und konkret planbaren Lerneinheiten ab. Die Folge sind verpasste Abgaben, Last-Minute-Lernen und vermeidbarer Stress.
- **Ziele:**
  - Eine webbasierte App (SvelteKit), die Module, Prüfungen, Abgaben und Lerneinheiten in einer studienspezifischen Datenstruktur vereint.
  - Ein Dashboard, das auf einen Blick zeigt, was als Nächstes ansteht und wie viel Lernzeit pro Prüfung noch fehlt.
  - Vollständige CRUD-Workflows auf Modulen, Prüfungen und Lerneinheiten mit persistenter Speicherung in einer Datenbank.
  - Eine Usability, die die App nicht selbst zum Zeitfresser macht: Eintrag einer neuen Prüfung in unter einer Minute.
- **Primäre Zielgruppe:** Teilzeit-Studierende im Bachelor Wirtschaftsinformatik (oder vergleichbaren Studiengängen) an der ZHAW, ca. 3.–6. Semester, mit paralleler Erwerbstätigkeit von 50–80 %.
- **Weitere Stakeholder:**
  - Vollzeit-Studierende als Sekundär­zielgruppe.
  - Dozierende, die von besser vorbereiteten Studierenden profitieren.
  - Familie und Arbeitgeber der Studierenden, die von besserer Planbarkeit profitieren.
  - Dozierende des Moduls Prototyping als Bewertende des Prototyps.

## 2. Lösungsidee

- **Kernfunktionalität:**
  - **Module verwalten** (anlegen, umbenennen, archivieren, löschen) inklusive ECTS und Semester.
  - **Prüfungen & Abgaben** je Modul erfassen (Titel, Typ, Datum, Gewichtung in %, geschätzter Lernaufwand in Stunden).
  - **Lerneinheiten** (z. B. „Kapitel 3 durchlesen", „Übung 5 lösen") einer Prüfung zuordnen; Status offen / in Arbeit / erledigt.
  - **Dashboard / Home** mit den nächsten 7 Tagen: anstehende Prüfungen, fällige Abgaben, geplante Lerneinheiten sowie ein Fortschrittsbalken pro Prüfung (geplante vs. erledigte Lernstunden).
  - **Wochen­ansicht** zur Planung der Lerneinheiten in konkrete Zeitfenster.
  - Alle Daten persistent in einer Datenbank; sämtliche Entitäten sind vollständig **CRUD**-fähig.
- **Annahmen:**
  - Teilzeitstudierende planen bereitwillig, sobald der Einstieg sehr niederschwellig ist.
  - Eine tabellarische Erfassung der Prüfungs­gewichtung erhöht das Gefühl von Kontrolle.
  - Ein Fortschrittsbalken auf Basis „geplante vs. erledigte Lernstunden" ist motivierender als eine reine Aufgabenliste.
  - Single-User reicht als Scope; echte Authentifizierung und Multi-User sind für den Mindestumfang nicht erforderlich.
- **Abgrenzung:**
  - Keine Integration in Moodle, Outlook oder den ZHAW-Stundenplan (ggf. als Erweiterung).
  - Keine Gruppenfunktion, kein Peer-Tutoring, kein Chat.
  - Keine Mobile-App; die Web-App ist responsive, aber primär für Desktop gedacht.
  - Keine automatische Notenprognose auf Basis der Gewichtungen (bewusst als potenzielle Erweiterung offengelassen).

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define

- **Zielgruppenverständnis:**
  - **Problemraumanalyse:** Bildung / digitale Selbstorganisation. Kernkonflikt zwischen fragmentierter Zeit (Teilzeitstudium + Beruf) und der Notwendigkeit, größere Lernziele langfristig zu planen.
  - **Recherche:** Sichtung bestehender Lösungen (Notion, Todoist, MyStudyLife, Moodle-Kalender). Ergebnis: keine Lösung modelliert studienspezifische Entitäten (Module, Prüfungen mit Gewichtung, Lerneinheiten) mit niedriger Einstiegshürde.
  - **(Proto-)Persona „Laura, 24, WI-Studentin Teilzeit 80 %":** Arbeitet 4 Tage/Woche in der IT, studiert an 1–2 Abenden + Samstag. Nutzt Apple Reminders + Google Calendar + Notion, verliert aber in der Prüfungsphase regelmäßig den Überblick, welches Modul wie viel Lernzeit braucht. Wünscht sich eine einzige Ansicht „Was muss ich diese Woche realistisch schaffen?".
- **Wesentliche Erkenntnisse:**
  - Nutzer:innen wollen auf einen Blick wissen, *wie viel* noch zu lernen ist – nicht nur *was*.
  - Prüfungs­gewichtung beeinflusst, wie viel Lernzeit investiert wird, wird aber in keiner bekannten App strukturiert erfasst.
  - Die Einstiegshürde muss sehr niedrig sein: Ein neues Modul oder eine neue Prüfung muss in unter einer Minute eintragbar sein, sonst wird die App nicht genutzt.
  - Ein „Dashboard der nächsten 7 Tage" hat höhere Priorität als eine vollständige Monatsansicht.
  - Single-User-Scope ist für den Prototyp ausreichend und schützt vor Scope-Creep.
