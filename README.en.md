# Chaos Kitchen – our family recipes

🇩🇪 [Deutsche Version](README.md)

The site lives at <https://rebeccahamel.github.io/chaos-kitchen/>. Every recipe is a small
text file in this repository. Whoever changes or adds a file and saves it on `main` publishes
the change: GitHub rebuilds the site in about a minute.

This guide explains how to add a recipe without any programming knowledge. The technical
details are in [SPEC.md](SPEC.md). The site itself, and all recipe text, is in German.

## Contents

1. [Adding a recipe](#1-adding-a-recipe)
2. [Writing ingredients](#2-writing-ingredients)
3. [Writing steps](#3-writing-steps)
4. [Adding a photo](#4-adding-a-photo)
5. [Adding a tag, a person or a unit](#5-adding-a-tag-a-person-or-a-unit)
6. [On the go with a phone or tablet](#6-on-the-go-with-a-phone-or-tablet)
7. [When the build fails](#7-when-the-build-fails)
8. [Working on your own computer](#8-working-on-your-own-computer)
9. [The weekly plan](#9-the-weekly-plan)

## 1. Adding a recipe

Each recipe is one file in the folder [src/content/recipes/](src/content/recipes/). The file
[_vorlage.yaml](src/content/recipes/_vorlage.yaml) is a commented template.

**Step 1: Choose the file name.** The file name doubles as the recipe's web address. Rules:
lowercase letters, digits and hyphens only, no spaces, umlauts spelled out
(ä → ae, ö → oe, ü → ue, ß → ss).

| Recipe | File name | Address |
|---|---|---|
| Omas Quarkkuchen | `omas-quarkkuchen.yaml` | `/rezept/omas-quarkkuchen/` |
| Grüne Soße | `gruene-sosse.yaml` | `/rezept/gruene-sosse/` |

**Step 2: Copy the template.** Copy `_vorlage.yaml` and rename the copy. Files starting with
`_` are ignored by the site, which is why the template itself stays invisible.

**Step 3: Fill in the header.**

```yaml
title: Omas Quarkkuchen
description: Saftiger Quarkkuchen auf Mürbeteig – der Sonntagsklassiker.
author: oma                    # an id from src/data/people.yaml
added: 2026-09-12              # date in the format YYYY-MM-DD
yield: { amount: 12, unit: Stück, note: für eine 26er Springform }
time: { prep: 30, cook: 60, rest: 60 }
tags: [dessert, vegetarisch, herbst]
```

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | Name of the recipe |
| `description` | yes | One or two sentences for the overview |
| `author` | yes | Who contributed the recipe, as an id from `people.yaml` |
| `added` | yes | Date the recipe was added, used for "Neu hinzugefügt" |
| `yield` | yes | What the amounts are for: `amount` (a number) and `unit` (e.g. Portionen, Stück, Blech). `note` is optional |
| `time` | yes | Minutes. `prep` (active work) is required, `cook` (cooking/baking) and `rest` (resting, chilling, rising) are optional |
| `tags` | yes | List of tag ids from `tags.yaml`. An empty list `[]` is allowed |

**Step 4: Write ingredients and steps**, see sections 2 and 3.

**Step 5: Save and upload.** On a computer: save the file, commit and push (section 8). On a
phone: tap "Commit changes" in the GitHub editor (section 6). After about a minute the recipe
is online. If something in the file is wrong, the build fails, GitHub sends an e-mail and the
site stays online unchanged (section 7).

## 2. Writing ingredients

Each ingredient is one line in curly braces. The `id` is what you use to mention the
ingredient in the steps.

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

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Short name, only `a-z`, `0-9` and `-`. Must be unique within the recipe |
| `name` | yes | Singular ("Zwiebel", "Mehl") |
| `plural` | no | Plural, needed for counted ingredients without a unit ("Zwiebeln") |
| `amount` | no | Number or range `[from, to]`. Without it the ingredient is never scaled ("nach Geschmack") |
| `unit` | no | Unit from `units.yaml`. Without it the ingredient is counted (onions, eggs) |
| `note` | no | Hint after the name, in the ingredient list only ("kalt", "gehackt") |
| `optional` | no | `true` shows "(optional)" |
| `whole` | no | `true` always rounds to whole pieces, e.g. for eggs |

Typical cases:

- **Eggs:** `amount: 3, name: Ei, plural: Eier, whole: true`. Scaling never produces
  "1½ Eier", only whole eggs, rounded up.
- **A pinch:** `amount: 1, unit: Prise, name: Salz`. It scales along ("2 Prisen").
- **To taste:** leave out `amount`: `{ id: pfeffer, name: Pfeffer, note: nach Geschmack }`.
- **Range:** `amount: [1, 2]` shows as "1–2 Zehen".
- **The same ingredient twice** (sugar in the dough and in the filling): two lines with two
  different ids, e.g. `zucker-teig` and `zucker-fuellung`.
- **kg and l** may be used; the site converts to g and ml itself when scaling down.

**Groups.** Ingredients and steps can be organised in groups with a heading, independently of
each other. Steps are numbered continuously across all groups.

```yaml
ingredients:
  - group: Für den Teig
    items:
      - { id: mehl, amount: 250, unit: g, name: Mehl }
  - group: Für die Füllung
    items:
      - { id: quark, amount: 750, unit: g, name: Magerquark }
```

## 3. Writing steps

Steps are a list of sentences. **Every step goes in double quotes.** Without the quotes, a
step that starts with `{` is misread.

```yaml
steps:
  - "{mehl}, {zucker-teig} und {butter} rasch zu einem glatten Teig verkneten."
  - "Die {zitrone:name} heiß abwaschen und die Schale abreiben."
  - "Eiweiße mit {zucker-fuellung:1/3} steif schlagen."
```

Ingredients are mentioned with placeholders. On the page they are replaced by amount, unit
and name, and they adjust when someone changes the number of servings.

| Placeholder | Result | When |
|---|---|---|
| `{mehl}` | "250 g Mehl" | Normal case: amount, unit, name |
| `{zucker:1/3}` | "50 g Zucker" | Only part of the amount is used here (`{zucker:0.5}` also works) |
| `{zwiebel:name}` | "Zwiebeln" | Name only, singular or plural adjusts |
| `{rosinen}` with `optional: true` | "50 g Rosinen (optional)" | |
| `{salz}` without amount | "Salz" | |

A placeholder with an id that does not exist in the ingredients fails the build. Not
mentioning an ingredient in the steps at all only gives a warning; that is often fine
("Salz nach Geschmack").

## 4. Adding a photo

- The photo goes into [src/assets/recipes/](src/assets/recipes/) and is named like the
  recipe file, so `omas-quarkkuchen.jpg` for `omas-quarkkuchen.yaml`. Allowed are `.jpg`,
  `.jpeg`, `.png` and `.webp`; `.jpg` is best because the files stay small.
- Several pictures are numbered: `omas-quarkkuchen_1.jpg`, `omas-quarkkuchen_2.jpg` and so
  on. The first one appears in the overview; on the recipe page you can swipe through all of
  them or use the arrows, round and round.
- The recipe file says nothing about the photo; the site finds it by name.
- Illustrations are just as welcome as photos.
- The image is shown in a 4:3 frame, cropped centrally. Landscape orientation is ideal. About
  1600 pixels wide is plenty; the site generates smaller sizes itself.
- Only our own photos, no pictures from books or other websites.
- Without a photo a neutral placeholder appears and the build reports a warning.

## 5. Adding a tag, a person or a unit

All three lists live in [src/data/](src/data/). A recipe may only use what is listed there,
otherwise the build fails.

**Tag** in [tags.yaml](src/data/tags.yaml): one line in the matching category (Gang,
Ernährung, Saison & Anlass, Küche). The `id` follows the file name rules, the `label` is the
text shown on the site.

```yaml
    - { id: suppe, label: Suppe }
```

**Person** in [people.yaml](src/data/people.yaml): family role or first name only, no last
names. The colour is used for the initials as long as there is no avatar image.

```yaml
- id: tante-eva
  name: Tante Eva
  color: "#3f5b6b"
```

An avatar image comes later as a square picture in `src/assets/avatars/` and is registered
with `avatar: tante-eva.webp`.

**Unit** in [units.yaml](src/data/units.yaml): singular, plural and category. The category
decides how scaled amounts are rounded: `weight` and `volume` in steps of 1/5/10, `spoon` in
quarters, `count` in halves (eighths below 1).

```yaml
- { unit: Becher,   plural: Becher,    category: count }
```

## 6. On the go with a phone or tablet

No computer needed, a GitHub login is enough.

1. Open the repository: <https://github.com/rebeccahamel/chaos-kitchen>.
2. Go to the folder `src/content/recipes`.
3. **New recipe:** top right "Add file" → "Create new file". Enter the file name (section 1).
   Easiest is to open `_vorlage.yaml` first, copy its contents and paste them in.
   **Existing recipe:** tap the file, then the pencil icon.
4. Top right "Commit changes". Enter a short description, e.g. "Add Omas Quarkkuchen", and
   confirm directly on `main`.
5. After about a minute the change is online. The "Actions" tab shows whether it worked:
   green check = online, red cross = error in the file (section 7).

Photos can be uploaded in the web editor via "Add file" → "Upload files" in the folder
`src/assets/recipes`. Rename them first so the name matches the recipe.

## 7. When the build fails

After every save on `main`, GitHub rebuilds the site. If that goes wrong, the old site stays
online and GitHub sends an e-mail "Run failed".

**Finding the error message:** open the "Actions" tab in the repository, click the topmost run
with the red cross, then "build". The message is in German and names the file and the problem,
for example:

```
src/content/recipes/omas-quarkkuchen.yaml: Tag „kuchen“ steht nicht in tags.yaml
```

**Common causes:**

| The message says … | Cause | Fix |
|---|---|---|
| Tag / unit / person "steht nicht in …" (is not listed) | Typo, or not yet in the list | Check the spelling or add an entry in `src/data/` (section 5) |
| Unknown ingredient id ("unbekannte Zutaten-Id") | `{mehl}` in a step, but the ingredient is `id: weizenmehl` | Make the ids match |
| Required field missing or wrong type | e.g. `added` forgotten, `amount: 2 Stück` instead of number + unit | Add the field, or separate number and unit |
| Ingredient id occurs more than once ("kommt mehrfach vor") | Two ingredients with the same id | Rename the second one (`zucker-fuellung`) |
| File name has invalid characters | Capitals, spaces or umlauts in the file name | Rename (section 1) |
| Range: min is not smaller than max | `[3, 2]` | Swap the order |
| YAML error ("bad indentation", "unexpected …") | Missing quotes around a step, wrong indentation, missing bracket | Compare the line with the template. Steps always in `"…"` |

A colon or a `#` **inside** a text can also cause trouble. Then put the text in double quotes:
`description: "Schnell gemacht: unser Lieblingsessen."`

**Warnings** (yellow) do not stop the build: missing photo, missing avatar image, an
ingredient that appears in no step, a trial recipe (`trial: true`) that is not in the weekly plan.

After the correction just save again; the build runs again automatically.

## 8. Working on your own computer

Once: install [Node.js](https://nodejs.org/) (LTS version) and [Git](https://git-scm.com/),
clone the repository and open it in VS Code. Then in the terminal (PowerShell):

```powershell
npm install        # install dependencies, needed only once
npm run dev        # local preview at http://localhost:4321/chaos-kitchen/
npm run build      # checks all recipe files exactly like GitHub does
npm test           # tests for scaling and display
```

`npm run dev` reloads the preview on every saved change and shows errors right in the
terminal. Before uploading, `npm run build` is worth running; it shows errors before GitHub
reports them.

Publishing:

```powershell
git add .
git commit -m "Add Omas Quarkkuchen"
git push
```

Claude Code can help with transcribing: a photo of a handwritten card or a plain text is
enough to turn into a finished recipe file.

For everything else (data model, rounding rules, design) see [SPEC.md](SPEC.md); notes for
working with Claude Code are in [CLAUDE.md](CLAUDE.md).

## 9. The weekly plan

The homepage starts with "Diese Woche": the family's planned lunches and dinners with tick
boxes, a Bring! button for the ingredients of all ticked recipes, and a merged shopping list. The
plan lives in [src/data/plan.yaml](src/data/plan.yaml) and may hold two weeks, this one and the
next; the homepage swipes or clicks between them. The file explains its own format. With
`weeks: []` the section disappears.

The plan is not written by hand but in a session with Claude Code, which also writes the new
recipes. How that works is in [planner/README.md](planner/README.md). New recipes of a week carry
`trial: true` and stay off the overview until, after the week, they are kept (line removed) or
deleted.

When Bring! misreads an ingredient (it does not know "Kopfsalate", but it knows "Kopfsalat"), a
line goes into [src/data/bring.yaml](src/data/bring.yaml); the file explains the two options. When
Bring! does not know a unit (Zehen, Stangen), the unit gets a `bring:` in `units.yaml`: with
`compound` the list says "3 Knoblauchzehen", with `note` the amount follows the name as the
specification, "Porree, 2 Stangen".
