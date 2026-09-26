# Meal planner – how a week works

The planner is a conversation with Claude Code, not a program. Claude Code plans, writes the
recipe files and the plan file, and keeps the history; the website only shows the result
(MEAL_PLANNER.md §14). This file is the operating manual: the files, the weekly routine, the two
prompts, the rules Claude Code follows while planning, and the Todoist step.

## Files

| File | In git | Purpose |
|---|---|---|
| `MEAL_PLANNER.md` | yes | Standing rules and decisions. Read every time. |
| `planner/private/profile.md` | **no** | Everything personal: allergy, ages, stores, schedule. Read every time. |
| `planner/private/plans/<year>-W<week>.md` | **no** | The private plan for Becci: offers, shopping strategy, cost, the full shopping list by section. |
| `planner/history/<year>-W<week>.md` | yes | One file per planned week: request, meals, ratings, verdicts. The planner's memory. |
| `src/data/plan.yaml` | yes | The public plan the homepage renders: this week and, once planned, the next. |
| `src/content/recipes/<slug>.yaml` | yes | Recipes. New ones of the week carry `trial: true`. |

Week numbers are ISO weeks (Monday first): `2026-W40` is 28 September – 4 October 2026.

## The weekly routine

1. **Becci asks.** She opens Claude Code on the `main` branch and pastes prompt A with her
   request in her own words. No form, no restating the profile.
2. **Claude Code reads** (in this order): `MEAL_PLANNER.md`, `planner/private/profile.md`, the
   last four files in `planner/history/`, the titles and tags of all recipes in
   `src/content/recipes/`, and the current `src/data/plan.yaml` (a week already there that
   reaches into the new one, e.g. a Monday lunch of leftovers, stays where it is).
3. **Claude Code fetches current context** with its web tools: this week's offers at the stores
   in the profile (Edeka, REWE, Aldi) and what is in season. Every offer is noted with its
   validity period and the date it was fetched. If an offer page cannot be read, say so and
   plan without it.
4. **Claude Code proposes the week in chat**: a table Monday to Sunday with lunch, dinner,
   minutes, which recipes are new and which come from the collection, and one line on the
   offers and seasonal produce used. Saturday and Sunday stay free unless the request plans
   them (MEAL_PLANNER.md §3). Becci adjusts or says GO.
5. **After GO, Claude Code writes**, in this order, and runs `npm test` and `npm run build`:
   - new recipe files with `trial: true` (rules below);
   - `src/data/plan.yaml`;
   - `planner/private/plans/<week>.md` (private plan, see below);
   - `planner/history/<week>.md` with the section "Plan" filled and "Feedback" left open;
   - `planner/private/profile.md` if the request contained a lasting preference (also note it
     in the chat so Becci sees it).
   Then it ends with the commit and push commands. Pushing `main` publishes the week.
   Finally it puts the week's meals into Todoist (see "Todoist" below).
6. **Becci cooks.** The family sees the week on the homepage and uses the Bring! button.
7. **After the week, Becci reviews** with prompt B: loved / liked / fine / disliked per meal,
   comments, and which recipes stay. Claude Code updates the history file, removes `trial: true`
   from kept recipes, deletes rejected recipe files, updates the profile for lasting changes,
   runs the build, and gives the commit commands. The plan on the homepage stays until the next
   week replaces it.

## Prompt A – plan a week

```
Plan a week. Read planner/README.md and follow it.

<what Becci wants this week, freely worded, for example:>
Plan next week. Monday needs to be under 25 minutes, we have half a cabbage to use,
and Thursday we are out. I want one experimental dinner.
```

## Prompt B – review a week

```
Review the week. Read planner/README.md and follow it.

<ratings and verdicts, freely worded, for example:>
Loved the salmon, keep it. Lentil bowls were fine but too much work, don't keep.
Ginger chicken: liked, keep. The grain bowl lunch was boring, no reason really.
Bring! misread "Kopfsalate" and "Reispapierblätter".
```

Items Bring! misread go into `src/data/bring.yaml` as a rule (`singular: true` or `as: <text>`),
or, for a unit that Bring! does not know, as `bring: note` on the unit in `units.yaml` (amount
and unit become the item's specification, "Porree, 2 Stangen"; `bring: compound` only when the
glued word is in Bring!'s catalogue, like "Knoblauchzehen"). Bring!
is not consistent about this, so the rules are learned case by case (SPEC.md §6.4).

## What Claude Code does while planning

**Constraints first.** The allergy exclusion from the profile is checked on every ingredient of
every recipe, new or old. Then the week's logistics: time limits per day, busy days, days that
are out. Then the standing rules in MEAL_PLANNER.md §3–§9: meat dinners, leftovers, variety,
cuisine limits, protein and carb variation, the priority order in §8.

**Use the collection.** Recipes without `trial: true` are the proven collection. The history says
when each was last cooked and how it was rated. Aim for the 60/40 familiar/new balance from §3,
and bring a loved recipe back after 3–4 weeks. A recipe rated "disliked" without a reason is not
suggested again; one disliked with a reason shapes future choices as §9 describes.

**Offers are inputs, not requirements.** Use one only when it fits; name it in the private plan
with store, product, price, validity and fetch date.

**Recipe files.** Written in the site's format (`SPEC.md` §4, `_vorlage.yaml`), in German, with:

- `trial: true` and `author: becci` unless Becci names someone else;
- a slug per SPEC.md §4.1; the title is the dish, not the day;
- `yield` of 4 Portionen unless the dish dictates otherwise;
- ingredient ids, units from `units.yaml` (add a unit in `units.yaml` only when none fits), and
  step placeholders for every ingredient that has an amount;
- tags from `tags.yaml`: course, diet, season and cuisine where they apply;
- a step for the toddler where a meal is spicy or very salty ("Portion für die Kleine vorher
  abnehmen, dann …"), never a separate recipe;
- concise steps, weights over spoons where practical;
- ingredient names as Bring! and German shops know them ("Mungobohnensprossen", not
  "Mungbohnensprossen"); one name per thing across the collection, so that lines merge and
  Bring! sees one item: "Möhre" (not Karotte), "Sahne" (not Kochsahne), "Porree" (not Lauch);
- every ingredient gets an amount and a unit where one exists, herbs in Bund or Zweige, so that
  the same ingredient merges across the week's recipes on the shopping list ("Minze" without
  unit and "1 Bund Minze" stay two lines; the build warns about such pairs);
- an amount placeholder is the object of its sentence ("{ei} verquirlen"), never behind "von",
  "mit" or "aus", because a scaled plural would need the dative ("mit 3 Eiern"); use `{id:name}`
  there instead ("mit den Eiern").

At most 10 different recipes in the plan (`MAX_PLAN_RECIPES`); a normal week has 5–7, a full
seven-day week with cooked lunches comes close to the cap, so use leftovers and text meals there.

**plan.yaml.** The file holds `weeks`, at most two in date order. The new week is added at the
end; a week whose last day is before today is removed; the weeks must not overlap, so the new
week starts after the last day already in the file. Within a week, one entry per planned meal:
`{ recipe: <slug> }`, `{ leftovers: <date> }` for a lunch from an earlier dinner of the same
week, `{ text: "…" }` for anything else. Days that are out get no lunch and no dinner. The
`note` is one sentence for the family, no personal details. The homepage shows both weeks as a
swipeable strip and opens on the one that contains today.

**The private plan** (`planner/private/plans/<week>.md`) follows the output shape in
MEAL_PLANNER.md §8: the at-a-glance table, the dinners with their key preparation note, the
shopping strategy (offers, reuse, seasonal produce), the shopping list by section, an
approximate cost when prices are known. This is where store names, prices and anything
personal go; nothing of it is needed on the site.

## Todoist

The family's meals live as tasks in Becci's Todoist project **Speiseplan**, so the day's meal
shows up in her task list. Claude Code writes them through the official Todoist MCP server.
Its public address is declared in `.mcp.json` at the repository root; the sign-in happens once
per PC with `/mcp` in Claude Code and is stored outside the repository. This step is the last
one after GO in prompt A; if the plan changes later, run it again with:

```
Send the week to Todoist. Read planner/README.md and follow it.
```

Rules:

- **One task per meal** of the week just planned in `src/data/plan.yaml` (the other week is
  already in Todoist), days before today skipped. Lunch is due on its day at 12:00, dinner at
  18:30.
- **The title is the dish only**, no "Mittagessen:" prefix: for a recipe its title, for
  leftovers "Reste: <title of that dinner>", for a text meal the text as written.
- **The description holds the link** to the recipe page on the live site,
  `https://rebeccahamel.github.io/chaos-kitchen/rezept/<slug>/`; for leftovers the link of the
  original recipe; text meals get no description.
- **No duplicates.** Before creating, list the open tasks of the project Speiseplan due on the
  plan's dates and delete them; never touch tasks outside that project or on other dates.
- No labels, priorities, sections or reminders; Todoist's own defaults apply.
- Finish with a short table in the chat: date, time, title, so Becci can compare it with the
  plan. If the Todoist server is not connected, say so and point to `/mcp`.

**Nothing personal in git.** Recipe files, `plan.yaml` and the history never mention ages,
allergies as such, store branches or addresses. "Toddler portion" and "Portion für die Kleine"
are fine.

## History file format

`planner/history/<year>-W<week>.md`:

```markdown
# Woche 2026-W40 (28. September – 2. Oktober)

## Request
One or two lines: what Becci asked for, including temporary wishes.

## Plan
| Day | Lunch | Dinner | Recipe | New? |
|---|---|---|---|---|
| Mo | Brot mit Salat | Fischcurry mit Reis | fischcurry-mit-reis | known |
| Di | Reste Mo | Ingwer-Soja-Hähnchen | ingwer-soja-haehnchen | new |
| … | | | | |

Context used: season (September: fennel, pumpkin, …), offers (none used / "Edeka: Lachs,
valid 28.9.–3.10., fetched 26.9.").

## Feedback
| Recipe | Rating | Comment |
|---|---|---|
| ingwer-soja-haehnchen | loved | – |
| … | | |

Ratings: loved / liked / fine / disliked. Comment: Becci's words, short.

## Verdicts
Kept: ingwer-soja-haehnchen. Deleted: linsen-bowl (too much work for a weekday).
Lasting preferences noted in the profile: none.
```

"Feedback" and "Verdicts" stay as "(open)" until the review. The review fills them in and adds
nothing else; a correction to an earlier week is a new dated line, not a rewrite.
