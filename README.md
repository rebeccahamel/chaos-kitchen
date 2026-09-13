# Chaos Kitchen – unsere Familien-Rezepte

🇬🇧 [English version](README.en.md)

Die Seite ist unter <https://rebeccahamel.github.io/chaos-kitchen/> erreichbar. Alle Rezepte
liegen als kleine Textdateien in diesem Repository. Wer eine Datei ändert oder hinzufügt und
auf `main` speichert, veröffentlicht die Änderung: GitHub baut die Seite in etwa einer Minute
neu.

Diese Anleitung erklärt, wie man ein Rezept hinzufügt, ohne Programmierkenntnisse. Die
technischen Details stehen in [SPEC.md](SPEC.md).

## Inhalt

1. [Ein Rezept hinzufügen](#1-ein-rezept-hinzufügen)
2. [Zutaten schreiben](#2-zutaten-schreiben)
3. [Schritte schreiben](#3-schritte-schreiben)
4. [Ein Foto hinzufügen](#4-ein-foto-hinzufügen)
5. [Einen Tag, eine Person oder eine Einheit hinzufügen](#5-einen-tag-eine-person-oder-eine-einheit-hinzufügen)
6. [Unterwegs am Handy oder Tablet](#6-unterwegs-am-handy-oder-tablet)
7. [Wenn der Build fehlschlägt](#7-wenn-der-build-fehlschlägt)
8. [Am eigenen Rechner arbeiten](#8-am-eigenen-rechner-arbeiten)

## 1. Ein Rezept hinzufügen

Jedes Rezept ist eine Datei im Ordner [src/content/recipes/](src/content/recipes/). Die
Datei [_vorlage.yaml](src/content/recipes/_vorlage.yaml) ist eine kommentierte Vorlage.

**Schritt 1: Dateinamen wählen.** Der Dateiname ist gleichzeitig die Adresse des Rezepts.
Regeln: nur Kleinbuchstaben, Ziffern und Bindestriche, keine Leerzeichen, Umlaute umschreiben
(ä → ae, ö → oe, ü → ue, ß → ss).

| Rezept | Dateiname | Adresse |
|---|---|---|
| Omas Quarkkuchen | `omas-quarkkuchen.yaml` | `/rezept/omas-quarkkuchen/` |
| Grüne Soße | `gruene-sosse.yaml` | `/rezept/gruene-sosse/` |

**Schritt 2: Vorlage kopieren.** Kopiere `_vorlage.yaml` und benenne die Kopie um. Dateien,
die mit `_` beginnen, ignoriert die Seite, deshalb bleibt die Vorlage selbst unsichtbar.

**Schritt 3: Kopf ausfüllen.**

```yaml
title: Omas Quarkkuchen
description: Saftiger Quarkkuchen auf Mürbeteig – der Sonntagsklassiker.
author: oma                    # eine id aus src/data/people.yaml
added: 2026-09-12              # Datum im Format JJJJ-MM-TT
yield: { amount: 12, unit: Stück, note: für eine 26er Springform }
time: { prep: 30, cook: 60, rest: 60 }
tags: [dessert, vegetarisch, herbst]
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `title` | ja | Name des Rezepts |
| `description` | ja | Ein oder zwei Sätze für die Übersicht |
| `author` | ja | Wer das Rezept beigesteuert hat, als id aus `people.yaml` |
| `added` | ja | Datum, an dem das Rezept hinzugefügt wurde, für „Neu hinzugefügt“ |
| `yield` | ja | Wofür die Mengen gelten: `amount` (Zahl) und `unit` (z. B. Portionen, Stück, Blech). `note` ist freiwillig |
| `time` | ja | Minuten. `prep` (aktive Arbeit) ist Pflicht, `cook` (Kochen/Backen) und `rest` (Ruhen, Kühlen, Gehen) sind freiwillig |
| `tags` | ja | Liste von Tag-ids aus `tags.yaml`. Leere Liste `[]` ist erlaubt |

**Schritt 4: Zutaten und Schritte** schreiben, siehe Abschnitte 2 und 3.

**Schritt 5: Speichern und hochladen.** Am Rechner: Datei speichern, committen und pushen
(Abschnitt 8). Am Handy: im GitHub-Editor auf „Commit changes“ (Abschnitt 6). Nach etwa einer
Minute ist das Rezept online. Wenn etwas an der Datei nicht stimmt, schlägt der Build fehl,
GitHub schickt eine E-Mail und die Seite bleibt unverändert online (Abschnitt 7).

## 2. Zutaten schreiben

Jede Zutat ist eine Zeile in geschweiften Klammern. Die `id` braucht man, um die Zutat in den
Schritten zu erwähnen.

```yaml
ingredients:
  - { id: mehl, amount: 250, unit: g, name: Mehl }
  - { id: zwiebel, amount: 2, name: Zwiebel, plural: Zwiebeln }
  - { id: ei, amount: 3, name: Ei, plural: Eier, whole: true }
  - { id: knoblauch, amount: [1, 2], unit: Zehe, name: Knoblauch }
  - { id: rosinen, amount: 50, unit: g, name: Rosinen, optional: true }
  - { id: butter, amount: 150, unit: g, name: Butter, note: kalt }
  - { id: salz, amount: 1, unit: Prise, name: Salz }
  - { id: pfeffer, name: Pfeffer, note: nach Geschmack }
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `id` | ja | Kurzname, nur `a-z`, `0-9` und `-`. Muss im Rezept einmalig sein |
| `name` | ja | Einzahl („Zwiebel“, „Mehl“) |
| `plural` | nein | Mehrzahl, nötig bei gezählten Zutaten ohne Einheit („Zwiebeln“) |
| `amount` | nein | Zahl oder Bereich `[von, bis]`. Fehlt sie, wird die Zutat nie umgerechnet („nach Geschmack“) |
| `unit` | nein | Einheit aus `units.yaml`. Fehlt sie, wird die Zutat gezählt (Zwiebeln, Eier) |
| `note` | nein | Hinweis hinter dem Namen, nur in der Zutatenliste („kalt“, „gehackt“) |
| `optional` | nein | `true` zeigt „(optional)“ an |
| `whole` | nein | `true` rundet immer auf ganze Stücke, z. B. bei Eiern |

Typische Fälle:

- **Eier:** `amount: 3, name: Ei, plural: Eier, whole: true`. Beim Umrechnen gibt es nie
  „1½ Eier“, sondern ganze Eier, aufgerundet.
- **Eine Prise:** `amount: 1, unit: Prise, name: Salz`. Wird mitskaliert („2 Prisen“).
- **Nach Geschmack:** `amount` weglassen: `{ id: pfeffer, name: Pfeffer, note: nach Geschmack }`.
- **Bereich:** `amount: [1, 2]` erscheint als „1–2 Zehen“.
- **Gleiche Zutat zweimal** (Zucker im Teig und in der Füllung): zwei Zeilen mit zwei
  verschiedenen ids, z. B. `zucker-teig` und `zucker-fuellung`.
- **kg und l** dürfen benutzt werden; die Seite rechnet beim Verkleinern selbst in g und ml um.

**Gruppen.** Zutaten und Schritte können in Gruppen mit Überschrift stehen, unabhängig
voneinander. Die Schritte werden über alle Gruppen durchnummeriert.

```yaml
ingredients:
  - group: Für den Teig
    items:
      - { id: mehl, amount: 250, unit: g, name: Mehl }
  - group: Für die Füllung
    items:
      - { id: quark, amount: 750, unit: g, name: Magerquark }
```

## 3. Schritte schreiben

Schritte sind eine Liste von Sätzen. **Jeder Schritt steht in doppelten Anführungszeichen.**
Ohne die Anführungszeichen versteht die Datei einen Schritt, der mit `{` beginnt, falsch.

```yaml
steps:
  - "{mehl}, {zucker-teig} und {butter} rasch zu einem glatten Teig verkneten."
  - "Die {zitrone:name} heiß abwaschen und die Schale abreiben."
  - "Eiweiße mit {zucker-fuellung:1/3} steif schlagen."
```

Zutaten werden mit Platzhaltern erwähnt. Sie werden auf der Seite durch Menge, Einheit und
Namen ersetzt und passen sich an, wenn jemand die Portionen ändert.

| Platzhalter | Ergebnis | Wann |
|---|---|---|
| `{mehl}` | „250 g Mehl“ | Normalfall: Menge, Einheit, Name |
| `{zucker:1/3}` | „50 g Zucker“ | Nur ein Teil der Menge wird hier gebraucht (auch `{zucker:0.5}`) |
| `{zwiebel:name}` | „Zwiebeln“ | Nur der Name, Ein- oder Mehrzahl passt sich an |
| `{rosinen}` bei `optional: true` | „50 g Rosinen (optional)“ | |
| `{salz}` ohne Menge | „Salz“ | |

Ein Platzhalter mit einer id, die es in den Zutaten nicht gibt, lässt den Build fehlschlagen.
Schreibt man eine Zutat gar nicht in den Schritten, gibt es nur eine Warnung; das ist oft in
Ordnung („Salz nach Geschmack“).

## 4. Ein Foto hinzufügen

- Das Foto kommt nach [src/assets/recipes/](src/assets/recipes/) und heißt wie die
  Rezeptdatei, also `omas-quarkkuchen.jpg` zu `omas-quarkkuchen.yaml`. Erlaubt sind
  `.jpg`, `.jpeg`, `.png` und `.webp`; am besten `.jpg`, weil die Dateien dann klein bleiben.
- Mehrere Bilder werden durchnummeriert: `omas-quarkkuchen_1.jpg`, `omas-quarkkuchen_2.jpg`
  und so weiter. Das erste Bild erscheint in der Übersicht, auf der Rezeptseite kann man
  durch alle wischen oder mit den Pfeilen blättern, endlos im Kreis.
- In der Rezeptdatei steht nichts vom Foto; die Seite findet es über den Namen.
- Gezeichnete Bilder sind genauso willkommen wie Fotos.
- Das Bild wird im Format 4:3 gezeigt und mittig zugeschnitten. Querformat ist ideal.
  Etwa 1600 Pixel Breite reichen völlig; die Seite erzeugt kleinere Größen selbst.
- Nur eigene Fotos, keine Bilder aus Büchern oder von anderen Webseiten.
- Ohne Foto erscheint ein neutrales Platzhalterbild, und der Build meldet eine Warnung.

## 5. Einen Tag, eine Person oder eine Einheit hinzufügen

Alle drei Listen liegen in [src/data/](src/data/). Ein Rezept darf nur benutzen, was dort
steht. Sonst schlägt der Build fehl.

**Tag** in [tags.yaml](src/data/tags.yaml): eine Zeile in die passende Kategorie (Gang,
Ernährung, Saison & Anlass, Küche). Die `id` folgt den Regeln für Dateinamen, das `label`
ist der angezeigte Text.

```yaml
    - { id: suppe, label: Suppe }
```

**Person** in [people.yaml](src/data/people.yaml): Nur Familienrolle oder Vorname, keine
Nachnamen. Die Farbe wird für die Initialen benutzt, solange es kein Avatar-Bild gibt.

```yaml
- id: tante-eva
  name: Tante Eva
  color: "#3f5b6b"
```

Ein Avatar-Bild kommt später als quadratisches Bild nach `src/assets/avatars/` und wird mit
`avatar: tante-eva.webp` eingetragen.

**Einheit** in [units.yaml](src/data/units.yaml): Einzahl, Mehrzahl und Kategorie. Die
Kategorie bestimmt, wie beim Umrechnen gerundet wird: `weight` und `volume` in Schritten
von 1/5/10, `spoon` in Vierteln, `count` in Halben (unter 1 in Achteln).

```yaml
- { unit: Becher,   plural: Becher,    category: count }
```

## 6. Unterwegs am Handy oder Tablet

Man braucht keinen Rechner, ein GitHub-Login reicht.

1. Repository öffnen: <https://github.com/rebeccahamel/chaos-kitchen>.
2. In den Ordner `src/content/recipes` gehen.
3. **Neues Rezept:** oben rechts „Add file“ → „Create new file“. Als Namen den Dateinamen
   eingeben (Abschnitt 1). Am einfachsten öffnet man vorher `_vorlage.yaml`, kopiert den
   Inhalt und fügt ihn ein.
   **Bestehendes Rezept:** Datei antippen, dann das Stift-Symbol.
4. Oben rechts „Commit changes“. Eine kurze Beschreibung eingeben, z. B.
   „Add Omas Quarkkuchen“, und direkt auf `main` bestätigen.
5. Nach etwa einer Minute ist die Änderung online. Ob es geklappt hat, zeigt der Reiter
   „Actions“: grüner Haken = online, rotes Kreuz = Fehler in der Datei (Abschnitt 7).

Fotos kann man im Web-Editor über „Add file“ → „Upload files“ im Ordner
`src/assets/recipes` hochladen. Vorher umbenennen, damit der Name zum Rezept passt.

## 7. Wenn der Build fehlschlägt

Nach jedem Speichern auf `main` baut GitHub die Seite neu. Geht das schief, bleibt die alte
Seite online, und GitHub schickt eine E-Mail „Run failed“.

**Fehlermeldung finden:** Im Repository den Reiter „Actions“ öffnen, den obersten Lauf mit
dem roten Kreuz anklicken, dann „build“. Die Meldung ist auf Deutsch und nennt die Datei und
das Problem, zum Beispiel:

```
src/content/recipes/omas-quarkkuchen.yaml: Tag „kuchen“ steht nicht in tags.yaml
```

**Häufige Ursachen:**

| Meldung sagt … | Ursache | Lösung |
|---|---|---|
| Tag / Einheit / Person „steht nicht in …“ | Tippfehler oder noch nicht in der Liste | Schreibweise prüfen oder Eintrag in `src/data/` ergänzen (Abschnitt 5) |
| unbekannte Zutaten-Id | `{mehl}` im Schritt, aber die Zutat heißt `id: weizenmehl` | id angleichen |
| Pflichtfeld fehlt oder falscher Typ | z. B. `added` vergessen, `amount: 2 Stück` statt Zahl + Einheit | Feld ergänzen bzw. Zahl und Einheit trennen |
| Zutaten-Id kommt mehrfach vor | Zwei Zutaten mit derselben id | Zweite id umbenennen (`zucker-fuellung`) |
| Dateiname enthält unerlaubte Zeichen | Großbuchstaben, Leerzeichen oder Umlaute im Dateinamen | Umbenennen (Abschnitt 1) |
| Bereich: min ist nicht kleiner als max | `[3, 2]` | Reihenfolge tauschen |
| YAML-Fehler („bad indentation“, „unexpected …“) | Fehlende Anführungszeichen um einen Schritt, falsche Einrückung, fehlende Klammer | Zeile mit der Vorlage vergleichen. Schritte immer in `"…"` |

Ein Doppelpunkt oder ein `#` **innerhalb** eines Textes kann ebenfalls stören. Dann den Text in
doppelte Anführungszeichen setzen: `description: "Schnell gemacht: unser Lieblingsessen."`

**Warnungen** (gelb) stoppen den Build nicht: fehlendes Foto, fehlendes Avatar-Bild, eine Zutat,
die in keinem Schritt vorkommt.

Nach der Korrektur einfach erneut speichern; der Build läuft automatisch wieder.

## 8. Am eigenen Rechner arbeiten

Einmalig: [Node.js](https://nodejs.org/) (LTS-Version) und [Git](https://git-scm.com/)
installieren, das Repository klonen und in VS Code öffnen. Dann im Terminal (PowerShell):

```powershell
npm install        # Abhängigkeiten installieren, nur einmal nötig
npm run dev        # lokale Vorschau unter http://localhost:4321/chaos-kitchen/
npm run build      # prüft alle Rezeptdateien so wie GitHub es tut
npm test           # Tests für Umrechnung und Anzeige
```

`npm run dev` lädt die Vorschau bei jeder gespeicherten Änderung neu und zeigt Fehler direkt
im Terminal. Vor dem Hochladen lohnt sich `npm run build`; dann sieht man Fehler, bevor
GitHub sie meldet.

Veröffentlichen:

```powershell
git add .
git commit -m "Add Omas Quarkkuchen"
git push
```

Claude Code kann beim Abtippen helfen: ein Foto einer handgeschriebenen Karte oder ein Text
reicht, um daraus eine fertige Rezeptdatei zu machen.

Für alles Weitere (Datenmodell, Rundungsregeln, Design) siehe [SPEC.md](SPEC.md); Hinweise für
die Arbeit mit Claude Code stehen in [CLAUDE.md](CLAUDE.md).
