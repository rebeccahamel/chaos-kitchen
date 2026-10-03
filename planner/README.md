# Meal planner – how a week works

The planner is a conversation with a coding agent, not a program (built and tested with Claude
Code). The agent plans, writes the recipe files and the plan file, and keeps the history; the
website only shows the result (MEAL_PLANNER.md §11). This file is the operating manual: the
files, the weekly routine, the two prompts, the rules the agent follows while planning, and the
optional Todoist step.

**First time in a fresh clone?** There is no profile yet, and the recipes, plan and history
belong to the previous owner. Do the setup in `SETUP.md` first.

## Files

| File | In git | Purpose |
|---|---|---|
| `MEAL_PLANNER.md` | yes | General planning rules. Read every time. |
| `planner/private/profile.md` | **no** | Everything about the household: people, allergies, likes, week rhythm, stores, pantry, integrations. Read every time; it wins over the general rules. |
| `planner/private/plans/<year>-W<week>.md` | **no** | The private plan for the owner: offers, shopping strategy, cost, the full shopping list by section. |
| `planner/history/<year>-W<week>.md` | yes | One file per planned week: request, meals, ratings, verdicts. The planner's memory. |
| `src/data/plan.yaml` | yes | The public plan the homepage renders: this week and, once planned, the next. |
| `src/content/recipes/<slug>.yaml` | yes | Recipes. New ones of the week carry `trial: true`. |

Week numbers are ISO weeks (Monday first): `2026-W40` is 28 September – 4 October 2026.

The site, the recipes and the plan's note are German (SPEC.md); the conversation can be in any
language.

## The weekly routine

1. **The owner asks.** They open the agent on the `main` branch and paste prompt A with the
   request in their own words. No form, no restating the profile.
2. **The agent reads** (in this order): `MEAL_PLANNER.md`, `planner/private/profile.md`, the
   last four files in `planner/history/` (fewer or none in the first weeks), the titles and tags of all recipes in
   `src/content/recipes/`, and the current `src/data/plan.yaml` (a week already there that
   reaches into the new one, e.g. a Monday lunch of leftovers, stays where it is). If the
   profile is missing, it stops and points to `SETUP.md`.
3. **The agent fetches current context** with its web tools: this week's offers at the stores
   named in the profile and what is in season. Every offer is noted with its validity period and
   the date it was fetched. If an offer page cannot be read, say so and plan without it.
4. **The agent proposes the week in chat**: a table Monday to Sunday with lunch, dinner,
   minutes, which recipes are new and which come from the collection, and one line on the
   offers and seasonal produce used. Days the profile leaves free stay free unless the request
   plans them (MEAL_PLANNER.md §3). The owner adjusts or says GO.
5. **After GO, the agent writes**, in this order, and runs `npm test` and `npm run build`:
   - new recipe files with `trial: true` (rules below);
   - `src/data/plan.yaml`;
   - `planner/private/plans/<week>.md` (private plan, see below);
   - `planner/history/<week>.md` with the section "Plan" filled and "Feedback" left open;
   - `planner/private/profile.md` if the request contained a lasting preference (also note it
     in the chat so the owner sees it).
   Then it commits or hands over the commit commands, as CLAUDE.md says for this owner. Pushing
   `main` publishes the week. If the profile lists Todoist, the week's meals go there last (see
   "Todoist" below).
6. **The household cooks.** Everyone sees the week on the homepage and uses the Bring! button.
7. **After the week, the owner reviews** with prompt B: loved / liked / fine / disliked per meal,
   comments, and which recipes stay. The agent updates the history file, removes `trial: true`
   from kept recipes, deletes rejected recipe files, updates the profile for lasting changes,
   runs the build, and commits or gives the commit commands. The plan on the homepage stays
   until the next week replaces it.

## Prompt A – plan a week

```
Plan a week. Read planner/README.md and follow it.

<what you want this week, freely worded, for example:>
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

Items Bring! misread go into `src/data/bring.yaml` as a rule (`singular: true` or `as: <text>`).
Units never need a rule: every Bring! line is "Name, amount unit" ("Porree, 2 Stangen"), so only
the name itself can be misread. Bring! is not consistent about names, so the rules are learned
case by case (SPEC.md §6.4).

## What the agent does while planning

**Constraints first.** Every hard constraint in the profile (allergies, strict exclusions) is
checked on every ingredient of every recipe, new or old. Then the week's logistics: time limits
per day, busy days, days that are out. Then the household's own rules in the profile (direction,
likes, week rhythm) and the general rules in MEAL_PLANNER.md §3–§9: leftovers, variety, protein
and carb variation, the priority order in §8.

**Use the collection.** Recipes without `trial: true` are the proven collection. The history says
when each was last cooked and how it was rated. Aim for the 60/40 familiar/new balance from §3,
and bring a loved recipe back after 3–4 weeks. With an empty or small collection the balance
cannot be met: the first weeks are mostly new recipes, and that is fine. A recipe rated "disliked" without a reason is not
suggested again; one disliked with a reason shapes future choices as §9 describes.

**Offers are inputs, not requirements.** Use one only when it fits; name it in the private plan
with store, product, price, validity and fetch date.

**Recipe files.** Written in the site's format (`SPEC.md` §4, `_vorlage.yaml`), in German, with:

- `trial: true` and the `author` id the profile names, unless the owner names someone else;
- a slug per SPEC.md §4.1; the title is the dish, not the day;
- `yield` of 4 Portionen unless the profile or the dish dictates otherwise;
- ingredient ids, units from `units.yaml` (add a unit in `units.yaml` only when none fits), and
  step placeholders for every ingredient that has an amount;
- tags from `tags.yaml`: course, diet, season and cuisine where they apply; add a tag there only
  when the household needs one to filter by ("glutenfrei");
- where the profile lists small children: a step for them when a meal is spicy or very salty
  ("Portion für die Kleine vorher abnehmen, dann …"), never a separate recipe;
- concise steps, weights over spoons where practical;
- ingredient names as Bring! and German shops know them ("Mungobohnensprossen", not
  "Mungbohnensprossen"); one name per thing across the collection, so that lines merge and
  Bring! sees one item: "Möhre" (not Karotte), "Sahne" (not Kochsahne), "Porree" (not Lauch);
- Möhren are always counted ("5 Möhren"), never weighed, so that they merge into one Bring!
  line across the week (decided 2026-10-03);
- the `note` says what to buy and travels to Bring! with the item, also on the week list:
  "festkochend" for Kartoffeln, the variety, the size of a tin. When the zest of a lemon, lime
  or orange is used, the note is "Bio" (decided 2026-10-03);
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
`note` is one sentence for the household, no personal details. The homepage shows both weeks as
a swipeable strip and opens on the one that contains today.

**The private plan** (`planner/private/plans/<week>.md`) follows the output shape in
MEAL_PLANNER.md §8: the at-a-glance table, the dinners with their key preparation note, the
shopping strategy (offers, reuse, seasonal produce), the shopping list by section, an
approximate cost when prices are known. This is where store names, prices and anything
personal go; nothing of it is needed on the site.

**Nothing personal in git.** Recipe files, `plan.yaml` and the history never mention ages,
allergies as such, store branches or addresses. "Portion für die Kleine" is fine.

## Todoist (optional)

Only when the profile's "Integrations" lists Todoist. The household's meals then live as tasks
in the Todoist project named there, so the day's meal shows up in the task list. The agent
writes them through the official Todoist MCP server. Its public address is declared in
`.mcp.json` at the repository root; the sign-in happens once per PC (in Claude Code with `/mcp`)
and is stored outside the repository. This step is the last one after GO in prompt A; if the
plan changes later, run it again with:

```
Send the week to Todoist. Read planner/README.md and follow it.
```

Rules:

- **One task per meal** of the week just planned in `src/data/plan.yaml` (the other week is
  already in Todoist), days before today skipped. Lunch and dinner are due on their day at the
  times the profile gives.
- **The title is the dish only**, no "Mittagessen:" prefix: for a recipe its title, for
  leftovers "Reste: <title of that dinner>", for a text meal the text as written.
- **The description holds the link** to the recipe page on the live site: the site's address
  (`site` plus `base`, if any, in `astro.config.mjs`) followed by `rezept/<slug>/`; for
  leftovers the link of the original recipe; text meals get no description. Without a live site,
  no description.
- **No duplicates.** Before creating, list the open tasks of that project due on the plan's
  dates and delete them; never touch tasks outside that project or on other dates, and never
  undated tasks.
- No labels, priorities, sections or reminders; Todoist's own defaults apply.
- Finish with a short table in the chat: date, time, title, so the owner can compare it with the
  plan. If the Todoist server is not connected, say so and point to the sign-in.

## Known quirks

Learned in real weeks; they save the agent a detour.

- **chefkoch.de** refuses the usual web fetch but answers `curl` with a browser user agent. The
  recipe sits in the page's JSON-LD (`recipeIngredient`, `recipeInstructions` as HowToSection /
  HowToStep).
- **Store offer pages** (Edeka, REWE) often answer automated access with 403. A flyer portal
  such as kaufda at least shows the validity period. Plan without offers and say so, unless the
  owner pastes offers into the request.
- **What Bring! will read** can be checked without a phone, for any page that is already live:
  the parser address in SPEC.md §6.8. It does not see local changes; push first.
- **Bring! scales only the amount** directly behind the name. A number inside a note
  ("2 Packungen") stays as written when someone changes the portions.
- **Todoist deletes** may be refused by the agent's permission settings. Then create the new
  tasks, list the old duplicates, and let the owner remove them.

## History file format

`planner/history/<year>-W<week>.md`:

```markdown
# Woche 2026-W40 (28. September – 2. Oktober)

## Request
One or two lines: what the owner asked for, including temporary wishes.

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

Ratings: loved / liked / fine / disliked. Comment: the owner's words, short.

## Verdicts
Kept: ingwer-soja-haehnchen. Deleted: linsen-bowl (too much work for a weekday).
Lasting preferences noted in the profile: none.
```

"Feedback" and "Verdicts" stay as "(open)" until the review. The review fills them in and adds
nothing else; a correction to an earlier week is a new dated line, not a rewrite.
