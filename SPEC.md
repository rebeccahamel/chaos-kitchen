# Familien-Rezeptseite – Specification

Status (2026-09-11): version 1 is built and live at https://rebeccahamel.github.io/chaos-kitchen/
(data layer, deploy workflow, design, overview, recipe page with yield control and Kochmodus).
What is still open and what comes next: §12.
Owner and only editor: Becci (via her GitHub account). Family members only read.

This file is the single source of truth for what the site does. If the implementation
and this file disagree, clarify with Becci and update this file.

---

## 1. Goal

A static website on GitHub Pages where the family stores and browses its favourite
recipes. It should feel like a modern recipe site: good photos, fast filtering,
portion scaling, and comfortable use on a phone while cooking.

Constraints:

- No server, no database, no logins.
- Recipes are plain, readable text files, one per recipe, easy to copy and edit by hand.
- The owner is not an experienced web developer. Simple, well-explained solutions beat clever ones.

---

## 2. Tech stack

| Part | Choice |
|---|---|
| Site generator | Astro (current stable release), static output only |
| Recipe data | One YAML file per recipe, validated at build time (Astro content collections + schema) |
| Interactivity | Plain TypeScript/JavaScript inside Astro components; no UI framework unless clearly needed |
| Images | Astro's built-in image optimization (resizing, modern formats) |
| Tests | Node's built-in test runner (`node --test`), no extra dependency; `npm test` |
| Hosting | GitHub Pages, deployed by GitHub Actions on every push to `main` |
| Repository | Public, free GitHub plan |
| Dev environment | Windows 11, VS Code with Claude Code extension, Node.js LTS, Git |

---

## 3. Repository layout

```
/
├─ CLAUDE.md                     working rules for Claude Code
├─ SPEC.md                       this file
├─ astro.config.mjs              site URL, base path (§8) and the data-checks integration (§7)
├─ package.json
├─ tsconfig.json
├─ .github/workflows/deploy.yml  build + deploy to GitHub Pages
├─ public/
│  └─ favicon.svg                static files copied as-is
└─ src/
   ├─ content/
   │  └─ recipes/
   │     ├─ _vorlage.yaml        template, excluded from the build
   │     └─ fischcurry-mit-reis.yaml
   ├─ data/
   │  ├─ people.yaml             authors and their avatars
   │  ├─ tags.yaml               allowed tags, grouped by category
   │  └─ units.yaml              allowed units, plurals, rounding category
   ├─ assets/
   │  ├─ recipes/                recipe photos, named <slug>.jpg|jpeg|png|webp
   │  ├─ avatars/                avatar illustrations, file name as in people.yaml
   │  ├─ fonts/                  self-hosted woff2 files and their OFL licences (§13.2)
   │  └─ placeholder-recipe.svg  shown when a recipe has no photo yet
   ├─ styles/
   │  └─ global.css              design tokens, font faces, base styles (§13)
   ├─ content.config.ts          collection definition, uses lib/recipe-schema.ts
   ├─ lib/
   │  ├─ types.ts                shared types
   │  ├─ lists.ts                reads and validates src/data/*.yaml (build time only)
   │  ├─ recipe-schema.ts        recipe schema and cross-checks (§7), build time only
   │  ├─ build-checks.ts         file names, photos, avatars (§7) as an Astro integration
   │  ├─ units.ts, scale.ts, format.ts, placeholders.ts, recipe.ts, search.ts, tags.ts
   │  │                          pure functions, also used in the browser: scaling, rounding,
   │  │                          display text, placeholders, search normalisation, tag labels
   │  ├─ site.ts                 site name and URL helper for the base path (§8)
   │  ├─ photos.ts               finds recipe photos and avatar files (Astro only)
   │  ├─ *.test.ts               unit tests, run with `npm test`
   │  └─ test-support.ts         test helpers (loads the real lists and recipe files)
   ├─ types/                     small type declarations for packages that ship none
   ├─ components/
   │  ├─ Avatar.astro            illustration or initial on the person's colour
   │  ├─ RecipeCard.astro        card on the overview, carries the data attributes for filtering
   │  └─ RecipePhoto.astro       4:3 photo in responsive sizes, or the placeholder
   ├─ layouts/
   │  └─ Base.astro              page frame: head (noindex, link preview), header, footer
   └─ pages/
      ├─ index.astro             overview with search, filters, sorting
      ├─ impressum.astro         Impressum (§6.7)
      └─ rezept/[slug].astro     one page per recipe
```

Files starting with `_` in `src/content/recipes/` are ignored by the build.

---

## 4. Data model

### 4.1 Naming

- Field names in all YAML files are English. All content and UI text is German.
- Recipe file name = slug = URL: lowercase, words joined by `-`, no spaces.
  Umlauts are transliterated: ä → ae, ö → oe, ü → ue, ß → ss.
  Example: `Omas Quarkkuchen` → `omas-quarkkuchen.yaml` → `/rezept/omas-quarkkuchen/`.
- The recipe photo has the same name as the recipe file: `src/assets/recipes/omas-quarkkuchen.jpg`.
  There is no image field; the build finds the photo by slug. No photo → placeholder.
- Step strings are always written in double quotes (a YAML string starting with `{`
  would otherwise be read as a data structure).

### 4.2 Complete example

```yaml
title: Omas Quarkkuchen
description: Saftiger Quarkkuchen auf Mürbeteig – der Sonntagsklassiker.
author: oma
added: 2026-09-11
yield: { amount: 12, unit: Stück, note: für eine 26er Springform }
time: { prep: 30, cook: 60, rest: 60 }
tags: [dessert, vegetarisch, herbst]

ingredients:
  - group: Für den Teig
    items:
      - { id: mehl, amount: 250, unit: g, name: Mehl }
      - { id: zucker-teig, amount: 80, unit: g, name: Zucker }
      - { id: butter, amount: 150, unit: g, name: Butter, note: kalt }
      - { id: ei-teig, amount: 1, name: Ei, plural: Eier, whole: true }
  - group: Für die Füllung
    items:
      - { id: quark, amount: 750, unit: g, name: Magerquark }
      - { id: zucker-fuellung, amount: 150, unit: g, name: Zucker }
      - { id: eier-fuellung, amount: 3, name: Ei, plural: Eier, whole: true }
      - { id: zitrone, amount: 1, name: Bio-Zitrone, plural: Bio-Zitronen }
      - { id: zitronensaft, amount: [1, 2], unit: EL, name: Zitronensaft }
      - { id: rosinen, amount: 50, unit: g, name: Rosinen, optional: true }
      - { id: salz, amount: 1, unit: Prise, name: Salz }

steps:
  - group: Teig
    items:
      - "{mehl}, {zucker-teig}, {butter} und {ei-teig} rasch zu einem glatten Teig verkneten."
      - "Den Teig 30 Minuten kalt stellen, dann in der Form ausrollen und einen Rand hochziehen."
  - group: Füllung
    items:
      - "{eier-fuellung} trennen."
      - "Eigelbe mit {quark}, {zucker-fuellung:2/3}, {zitronensaft} und {salz} glatt rühren."
      - "Die {zitrone:name} heiß abwaschen, die Schale abreiben und mit {rosinen} unterheben."
      - "Eiweiße mit dem restlichen Zucker ({zucker-fuellung:1/3}) steif schlagen und unterheben."
  - group: Backen
    items:
      - "Die Füllung auf den Teig geben und bei 175 °C Ober-/Unterhitze etwa 60 Minuten backen."
      - "Im ausgeschalteten Ofen bei leicht geöffneter Tür 1 Stunde abkühlen lassen."
```

### 4.3 Recipe fields

| Field | Required | Type | Meaning |
|---|---|---|---|
| `title` | yes | text | Recipe name as shown on the site |
| `description` | yes | text | One or two sentences for cards and the recipe page |
| `author` | yes | person id | Must exist in `people.yaml` |
| `added` | yes | date `YYYY-MM-DD` | Used for sorting "Neu hinzugefügt" |
| `yield.amount` | yes | number > 0 | Base yield the ingredient amounts refer to |
| `yield.unit` | yes | unit | Must exist in `units.yaml` (e.g. Portionen, Stück, Blech) |
| `yield.note` | no | text | Shown next to the yield, never scaled (e.g. "für eine 26er Springform") |
| `time.prep` | yes | minutes | Active preparation time |
| `time.cook` | no | minutes | Cooking or baking time |
| `time.rest` | no | minutes | Resting, chilling, rising |
| `tags` | yes (may be empty) | list of tag ids | Each must exist in `tags.yaml` |
| `ingredients` | yes | flat list or groups | See 4.4 and 4.5 |
| `steps` | yes | flat list or groups | See 4.5 and 4.6 |

Total time = `prep + cook + rest`. It is shown on cards and used by the time filter.
The recipe page shows the breakdown.

### 4.4 Ingredient fields

| Field | Required | Type | Meaning |
|---|---|---|---|
| `id` | yes | `a-z`, `0-9`, `-` | Unique within the recipe; used by step placeholders |
| `name` | yes | text | Singular form ("Zwiebel", "Mehl") |
| `plural` | no | text | Plural form, needed for counted items without a unit ("Zwiebeln") |
| `amount` | no | number or `[min, max]` | Missing → never scaled, shown as name + note |
| `unit` | no | unit | Must exist in `units.yaml`; missing → counted item |
| `note` | no | text | Shown after the name in the ingredient list only, never in steps; never scaled ("kalt", "nach Geschmack") |
| `optional` | no | true/false | Adds "(optional)" in list and steps |
| `whole` | no | true/false | Always round to whole numbers (eggs) |

### 4.5 Groups

- `ingredients` and `steps` each accept either a flat list or a list of groups
  (`group:` heading + `items:` list). A recipe may group one and not the other.
- Step numbering is continuous across all step groups (1, 2, 3 … not restarting per group).
- Ingredient ids are unique across all groups of a recipe. The same ingredient used for
  two components gets two ids (`zucker-teig`, `zucker-fuellung`).

### 4.6 Step placeholders

| Syntax | Renders (at base yield) | Notes |
|---|---|---|
| `{id}` | "250 g Mehl" | Amount, unit and name, scaled |
| `{id:2/3}` | "100 g Zucker" | Fraction of the listed amount, scaled; decimals (`{id:0.5}`) also allowed |
| `{id:name}` | "Bio-Zitrone" / "Bio-Zitronen" | Name only; singular or plural matching the current amount. If the ingredient has a unit, the name is used unchanged |
| `{id}` on a range | "1–2 EL Zitronensaft" | Both ends scaled and rounded |
| `{id}` without amount | "Salz" | Name only, never scaled |
| `{id}` on optional | "50 g Rosinen (optional)" | |

Notes (`note`) are never rendered in steps, only in the ingredient list.
The "(optional)" marker is the one addition that appears in both places.

A placeholder with an unknown id or invalid syntax is a build error.

### 4.7 Central lists

`src/data/people.yaml`

```yaml
- id: oma
  name: Oma                # family role or first name only
  avatar: oma.webp          # file in src/assets/avatars/; optional
  color: "#8a5a44"          # background colour for the initials fallback
```

Decided 2026-09-11: authors are Mama, Papa, Aleksi, Becci, Oma and Omale. No avatar files yet;
the initials fallback is used until illustrations exist.

`src/data/tags.yaml` – four categories for version 1: Gang, Ernährung, Saison & Anlass, Küche.
Content decided 2026-09-11 (Becci adds tags as they come along):

```yaml
- category: Gang
  tags:
    - { id: fruehstueck, label: Frühstück }
    - { id: schnelles-abendessen, label: schnelles Abendessen }
    - { id: dessert, label: Dessert }
    - { id: heissgetraenk, label: Heißgetränk }
- category: Ernährung
  tags:
    - { id: vegetarisch, label: vegetarisch }
    - { id: vegan, label: vegan }
    - { id: fisch, label: Fisch }
- category: Saison & Anlass
  tags:
    - { id: fruehling, label: Frühling }
    - { id: sommer, label: Sommer }
    - { id: herbst, label: Herbst }
    - { id: winter, label: Winter }
- category: Küche
  tags:
    - { id: asiatisch, label: asiatisch }
    - { id: italienisch, label: italienisch }
```

`src/data/units.yaml` – every unit has a singular, a plural and a rounding category.

```yaml
- { unit: g,        plural: g,        category: weight }
- { unit: kg,       plural: kg,       category: weight }
- { unit: ml,       plural: ml,       category: volume }
- { unit: l,        plural: l,        category: volume }
- { unit: EL,       plural: EL,       category: spoon }
- { unit: TL,       plural: TL,       category: spoon }
- { unit: Tasse,    plural: Tassen,   category: spoon }
- { unit: Prise,    plural: Prisen,   category: count }
- { unit: Dose,     plural: Dosen,    category: count }
- { unit: Päckchen, plural: Päckchen, category: count }
- { unit: Bund,     plural: Bund,     category: count }
- { unit: Zehe,     plural: Zehen,    category: count }
- { unit: Scheibe,  plural: Scheiben, category: count }
- { unit: Stange,   plural: Stangen,  category: count }
- { unit: Stück,    plural: Stück,    category: count }
- { unit: Portion,  plural: Portionen, category: count }
- { unit: Blech,    plural: Bleche,   category: count }
```

Recipes may use either the singular or plural form of a unit; both resolve to the same entry.

---

## 5. Scaling and display rules

Scale factor = chosen yield ÷ `yield.amount`. Amounts are scaled first, then rounded for display.

### 5.1 Rounding by unit category

| Category | Range | Rounding | Example |
|---|---|---|---|
| weight / volume | under 10 | whole numbers (minimum 1) | 7 g |
| weight / volume | 10 to under 100 | steps of 5 | 45 g |
| weight / volume | 100 to under 1000 | steps of 10 | 270 g |
| weight / volume | 1000 and more | converted to kg / l, steps of 0,05 | 1,25 kg |
| spoon | any | quarters, shown as fractions (minimum ¼) | 1½ EL |
| count (and ingredients without unit) | any | halves, shown as fractions (minimum ½) | 1½ Zwiebeln |
| count with `whole: true` | any | whole numbers, halves round up (minimum 1) | 5 Eier |

- Amounts written in kg or l are converted to g or ml internally, so scaling down
  shows "500 g" rather than "0,5 kg".
- Numbers use a decimal comma. Trailing zeros are dropped ("1,5 kg", "2 kg").
- Fractions use the characters ¼ ½ ¾ ("1½", "¾").
- Ranges use an en dash without spaces ("4–6 EL").

### 5.2 Singular and plural

- The plural form is used when the displayed amount is greater than 1
  ("½ Zwiebel", "1 Zwiebel", "1½ Zwiebeln").
- For ingredients with a unit, the unit takes singular or plural ("1 Dose" / "2 Dosen");
  the ingredient name stays unchanged.
- The yield label follows the same rule ("1 Blech", "2 Bleche").

### 5.3 Yield control

- Shown above the ingredient list: minus button, editable number, plus button, unit label.
- Plus and minus change the yield by 1. Minimum 1.
- A "Zurücksetzen" link restores the base yield when it has been changed.
- Changing the yield instantly updates the ingredient list and all step placeholders.
- The number field accepts whole numbers. An empty or invalid entry falls back to the last
  valid yield when the field loses focus.
- Without JavaScript the page shows the base yield; the control simply does nothing.
- The chosen yield is kept for the browser session per recipe, so a reload while cooking
  keeps it (same lifetime as the Kochmodus ticks in §6.3).

---

## 6. Pages and features (version 1)

### 6.1 Overview page (`/`)

- Recipe cards: photo (or placeholder), title, author avatar and name, total time, up to three tags.
- Search field: matches recipe title and ingredient names.
  Case-insensitive; umlauts and their transliterations match each other (ä = ae, ß = ss).
  No typo tolerance in version 1.
- Filters:
  - one group per tag category; OR within a category, AND across categories
  - people (avatars): OR among selected people, AND with the other filters
  - time: single choice – Alle / bis 30 min / bis 60 min / länger (based on total time)
- Sorting: Neu hinzugefügt (default; `added` descending, then title), Alphabetisch
  (German collation, Ä sorted with A), Zubereitungszeit (total time ascending).
- Result count, a "Filter zurücksetzen" action, and a helpful empty state when nothing matches.
- Search, filter and sort state is kept in the URL query, so the back button works
  and a filtered view can be shared as a link.
- Implementation: all recipe cards are rendered in the HTML with data attributes;
  filtering happens in the browser. No separate search service.

### 6.2 Recipe page (`/rezept/<slug>/`)

- Photo (or placeholder), title, description, author avatar and name, date added.
- Times: total plus breakdown (Zubereitung, Kochen/Backen, Ruhezeit – only those present).
- Tags, linking back to the overview filtered by that tag.
- Yield control (§5.3), yield note if present.
- Ingredient list, grouped if the recipe uses groups.
- Steps, numbered continuously, grouped under headings if the recipe uses groups,
  with live placeholder amounts.
- Back link to the overview that preserves the previous search and filters.

### 6.3 Kochmodus

- A toggle on the recipe page.
- While on: the screen stays awake (Screen Wake Lock API). If the browser does not
  support it, the toggle still enables the other features and a short note says the
  screen may turn off. If the browser refuses or drops the wake lock (some do so when it is
  requested without a tap, e.g. right after a reload), it is requested again on the next tap
  or key press and when the tab becomes visible again.
- Ingredients and steps can be ticked off by tapping. Ticked items are visually muted.
- Ticked state is kept for the browser session and cleared when the Kochmodus is
  turned off or the yield is reset.
- Implementation: a floating bar at the bottom of the recipe page (§13.3); mode and ticks
  are stored in the browser's session storage per recipe, like the chosen yield (§5.3).

### 6.4 Link previews

Each recipe page provides Open Graph metadata (title, description, photo with absolute
URL), so a link shared in a messenger shows a preview card.

### 6.5 Images

- Recipe photos: displayed in a 4:3 frame (cropped centrally), delivered in responsive sizes.
- Missing photo: a neutral placeholder image, no broken-image icon.
- Avatars: square source images, displayed as circles. Missing avatar: initials on the
  person's `color`.

### 6.6 General

- Site name: **CHAOS KITCHEN**, shown in the header and in every page title.
- Mobile first; comfortable on a phone held in one hand in the kitchen.
- All UI text in German.
- Accessibility baseline: visible keyboard focus, sufficient contrast, reduced motion respected,
  images with alt text (recipe title / person name).

### 6.7 Impressum

- Own page at `/impressum/`, linked as "Impressum" from the footer of every page.
- Content: Impressum (§ 5 DDG, § 18 MStV: name, postal address, e-mail) and a short
  Datenschutzerklärung (Art. 13 DSGVO: hosting on GitHub Pages with server logs, no cookies,
  no analytics, no third-party content, self-hosted fonts, rights of data subjects).
- Stored as plain text in `src/pages/impressum.astro` (decided 2026-09-11); the real details
  were filled in on 2026-09-12.
- Like every other page it carries the `noindex, nofollow` meta tag (§8).
- This is the only place on the site that shows personal data; see §9.
- Consequence for the design: fonts are served from the site itself, never from Google Fonts,
  so the Datenschutzerklärung stays true.

---

## 7. Build validation

The build fails with a clear message naming the file and the problem when:

- a required field is missing or has the wrong type
- `author` is not in `people.yaml`
- a tag is not in `tags.yaml`
- a unit is not in `units.yaml`
- an ingredient id is duplicated within a recipe
- a step placeholder references an unknown id or has invalid syntax
- a range has `min >= max`
- two recipe files produce the same slug

The build shows a warning (but continues) when:

- a recipe has no photo
- a person has no avatar file
- an ingredient is never referenced in the steps (often fine, e.g. "Salz nach Geschmack")

Validation is never weakened to make a build pass; the data gets fixed instead.

Implementation: field checks and cross-checks live in `src/lib/recipe-schema.ts` and run
through Astro's content collection; file-level checks (file names, duplicate slugs, photos,
avatars) live in `src/lib/build-checks.ts` and run as a small Astro integration at the start
of every `dev` and `build`. Messages are in German, because they are read by the person
editing a recipe file. Flat ingredient and step lists are turned into one group without a
heading after validation, so page code always works with groups. Amounts in kg or l are
converted to g or ml at the same point (§5.1).

---

## 8. Hosting and deployment

- GitHub Pages with source "GitHub Actions". The workflow builds the site on every push
  to `main` and deploys it. A failed build leaves the previous version online.
- The site is a project site at `https://<username>.github.io/<repo-name>/`.
  `astro.config.mjs` sets `site` and `base` accordingly, and every internal link and
  asset path must respect the base path.
- Search engines: every page carries `<meta name="robots" content="noindex, nofollow">`.
  (A `robots.txt` would not work for a project site, because it must sit at the domain root.)
  No sitemap.

---

## 9. Privacy

- Repository and website are public. Anyone with the link can read everything.
- People appear with family roles or first names only, and with illustrated avatars, not photos.
- The one exception is the Impressum page (§6.7): it contains exactly the legally required
  contact details and nothing else. No other page or file contains personal data.
- Commits use the GitHub no-reply e-mail address, so no private address becomes public.
- Recipe photos are the family's own, not scans from cookbooks or images from other websites.

---

## 10. Editing workflow

- **At home:** VS Code, with `npm run dev` for a live local preview. New recipes start as a
  copy of `_vorlage.yaml`. Claude Code can help transcribe recipes (e.g. from a photo of a
  handwritten card) into the file format.
- **On the go:** GitHub's web editor. If a file has an error, the build fails, GitHub sends an
  e-mail, and the live site keeps its previous version.
- `README.md` (German) and `README.en.md` (English) explain how to add a recipe step by
  step, where photos go, how to add a tag, a person or a unit, how to edit from a phone, and
  what to do when the build fails. Both files have the same structure; change them together.

---

## 11. Not in version 1 (later)

Typo-tolerant search, print view, favorites, shopping list, offline use / installable app,
dark mode, own domain, form-based recipe editor, "Was koche ich heute?" random recipe,
baking-form conversion, attribution fields (`adaptedBy`, `source`).

Optional fields added later must not require changes to existing recipe files.

---

## 12. Open points and next steps

Done (2026-09-11): data layer and validation (§4, §5, §7), deploy workflow (§8), design (§13),
overview (§6.1), recipe page with yield control (§6.2, §5.3), Kochmodus (§6.3), link previews
(§6.4), images (§6.5), Impressum page with dummy data (§6.7).
Done (2026-09-12): README in German and English (§10); wake lock recovers after a reload (§6.3);
Impressum filled in with the real details (§6.7).

Next, in the suggested order:

1. **Real recipes and photos:** 5–10 recipes from the family, including awkward ones (eggs in
   baking, a two-part recipe, "eine Prise", ranges). Claude Code transcribes from text or
   photos of handwritten cards. Photos go to `src/assets/recipes/<slug>.jpg`.
2. **Avatars:** illustrations for `src/assets/avatars/` when they exist; until then initials.
3. **Defaults to confirm after some use:** total time includes rest time; yield changes in
   steps of 1; times shown as "30 min" / "1 h 30 min" (alternative: "Min." / "Std.").

Known small things:

- The "Von" filter on the overview shows only people who have at least one recipe.
- `@types/node` is pinned to major version 22 while Node 24 is used; harmless, editor types only.

---

## 13. Visual design (confirmed 2026-09-11)

Direction: warm tones, off-whites, rich burnt orange for titles, cosy autumn colours.
Tokens live as CSS custom properties in `src/styles/global.css`.

### 13.1 Palette

| Name | Hex | Use |
|---|---|---|
| Leinen | `#F7F0E6` | page background |
| Papier | `#FFFAF2` | cards, boxes |
| Kürbis | `#C2551F` | titles, wordmark, step numbers, yield number – large text only |
| Rost | `#9A3B12` | links, buttons, small accents (enough contrast on Leinen for small text) |
| Tinte | `#2E1F17` | text |
| Kastanie | `#7A6353` | secondary text, notes |
| Karamell | `#E4D2BC` | lines, borders |
| Senf | `#D9A441`, light `#F3E2B5` | active filter chips, ingredient mentions in steps |
| Olive | `#5E6B3A` | Kochmodus on |

Author initials use the `color` from `people.yaml`; Oma and Omale both show "O".

### 13.2 Typefaces

- **Young Serif** (regular): wordmark, recipe titles, step numbers, yield number.
- **Alegreya Sans** (400, 500, 700, 400 italic): everything else.
- Both SIL Open Font License, self-hosted from `src/assets/fonts/` with the licence texts
  next to them. Never loaded from Google Fonts (§6.7).

### 13.3 Layout

- Mobile first, content width up to 1080 px, side gutter at least 16 px.
- Thin header band with the wordmark "CHAOS KITCHEN" linking to the overview;
  footer with the "Impressum" link.
- Cards: 4:3 photo, title in Kürbis, author initial and name, total time, up to three tags.
  One column on phones, two from about 600 px, three from about 900 px.
- Recipe page: one column at every width (decided). Ingredient list with a bold, right-aligned
  amount column on the left and name plus note on the right. Step numbers in Kürbis.
  Ingredients mentioned in a step are marked in light Senf. Kochmodus toggle floats at the
  bottom of the screen.
- Missing photo: striped Papier placeholder reading "noch kein Foto".
- Rounded corners 12 px, hairline borders in Karamell, almost no shadows, no icon set.
- Times are shown as "30 min", "1 h 30 min", "2 h".
- Overview URL query: `q` (search), `tag` (repeatable), `von` (author id, repeatable),
  `zeit` (`30`, `60` or `mehr`), `sort` (`neu`, `alpha`, `zeit`). Absent means default.
