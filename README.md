# Chaos Kitchen – Wochenplaner und Familien-Rezeptseite

🇬🇧 [English version](README.en.md)

Ein Wochenplaner fürs Essen, der kein Programm ist, sondern ein Gespräch mit einem
Coding-Agenten (gebaut mit [Claude Code](https://claude.com/claude-code)). Du sagst, was die
Woche braucht. Der Agent plant Mittag- und Abendessen passend zu deinem Haushalt, schreibt die
Rezepte und die Einkaufsliste und merkt sich, was geschmeckt hat. Dazu gehört eine kleine
Rezeptseite, die den Plan und die Rezepte zeigt und die Einkaufsliste an die App Bring! schickt.

So sieht das bei uns aus: <https://chaos-kitchen.com/>

Das Repository ist dafür gedacht, dass du es für deinen eigenen Haushalt übernimmst.

## Was du bekommst

- **Einen Wochenplan nach deinen Regeln.** Allergien, Vorlieben, stressige Tage und Läden stehen
  in einem privaten Profil, das nie im Repository landet.
- **Rezepte, die bleiben.** Neue Rezepte laufen eine Woche auf Probe. Was schmeckt, kommt in die
  Sammlung, aus der der Planer künftig schöpft.
- **Eine Einkaufsliste für die ganze Woche,** über alle Rezepte zusammengefasst, mit einem Tipp
  in Bring!.
- **Eine Rezeptseite** mit Portionsrechner und Kochmodus fürs Handy, veröffentlicht über
  GitHub Pages.
- Wer mag: die Mahlzeiten als Aufgaben in Todoist.

## Was du brauchst

- [Git](https://git-scm.com/) und [Node.js](https://nodejs.org/) (LTS-Version)
- einen Coding-Agenten, der im Ordner Dateien lesen und schreiben kann. Gebaut und erprobt mit
  Claude Code; andere Agenten finden den Einstieg über [AGENTS.md](AGENTS.md).
- ein GitHub-Konto, wenn du die Seite veröffentlichen willst. Ohne veröffentlichte Seite
  funktioniert alles außer den Bring!-Knöpfen.

Seite und Rezepte sind auf Deutsch. Mit dem Agenten kannst du in jeder Sprache reden.

## Loslegen

1. Repository forken oder klonen, dann im Ordner:

   ```
   npm install
   ```

2. Den Agenten im Ordner öffnen und einfügen:

   ```
   Set up this repository for my household. Read SETUP.md and follow it.
   ```

   Der Agent fragt dich nach deinem Haushalt, legt dein Profil an, räumt unsere Wochen weg und
   ersetzt Adresse und Impressum durch deine. Unsere Rezepte kannst du als Startsammlung
   behalten oder leer anfangen. Die Einzelheiten stehen in [SETUP.md](SETUP.md).

3. Die erste Woche planen, siehe nächster Abschnitt.

## Jede Woche

**Planen.** Den ersten Satz übernehmen, darunter deine Wünsche in eigenen Worten:

```
Plan a week. Read planner/README.md and follow it.

Nächste Woche. Montag muss es schnell gehen, wir haben noch einen halben Kohl,
Donnerstag sind wir nicht da. Ein Abendessen darf ein Experiment sein.
```

Der Agent schlägt die Woche als Tabelle vor. Du änderst, bis es passt, und sagst GO. Dann
schreibt er Rezepte, Plan und Einkaufsliste.

**Kochen.** Der Plan steht auf der Startseite: lokal mit `npm run dev` unter
<http://localhost:4321/>, veröffentlicht nach dem nächsten `git push`.

**Bewerten.** Nach der Woche:

```
Review the week. Read planner/README.md and follow it.

Der Lachs war super, behalten. Die Linsen-Bowls waren okay, aber zu viel Arbeit, weg damit.
```

Was bleiben darf, kommt in die Sammlung, der Rest wird gelöscht, und der Planer richtet sich
künftig danach.

## Wo was liegt

| Ort | Inhalt |
|---|---|
| [planner/README.md](planner/README.md) | Ablauf einer Woche, die Prompts, Regeln für den Agenten |
| [MEAL_PLANNER.md](MEAL_PLANNER.md) | allgemeine Planungsregeln |
| [planner/profile.example.md](planner/profile.example.md) | Beispiel für ein Haushaltsprofil |
| `planner/private/` | dein Profil und deine privaten Wochenpläne, nicht in Git |
| [planner/history/](planner/history/) | eine Datei pro Woche: was geplant war und wie es ankam |
| [src/content/recipes/](src/content/recipes/) | die Rezepte, eine Datei pro Rezept; das Format erklärt [_vorlage.yaml](src/content/recipes/_vorlage.yaml) |
| [src/data/plan.yaml](src/data/plan.yaml) | der Plan, den die Startseite zeigt |
| [SPEC.md](SPEC.md) | was die Seite kann und wie die Daten aufgebaut sind |
| [CLAUDE.md](CLAUDE.md) | Arbeitsregeln für den Agenten |

## Weitergeben

Code und Rezepte dürfen übernommen, angepasst und weitergegeben werden.
