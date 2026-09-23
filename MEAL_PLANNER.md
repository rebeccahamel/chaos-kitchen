# Meal planner – working notes

Branch `meal_planner`. Status (2026-09-23): requirements gathered, nothing designed or built yet.
Sources: Becci's standing profile `master_meal_planning.md` and an engineering handoff, both
written with ChatGPT on 2026-09-22. This file is the condensed, repo-friendly version of both and
replaces them for this project. When we make decisions they go here first and into SPEC.md once
they are firm.

Privacy: the repository is public (SPEC.md §9). Everything personal (who is allergic to what,
ages, store addresses, person-specific dislikes, the weekly schedule) lives in the gitignored
file `planner/private/profile.md`; `planner/profile.example.md` shows its shape. This file only
says where such a rule applies.

---

## 1. Product idea

> Maintain a living household food-planning model that turns a casual weekly request into a
> coherent, enjoyable, low-waste meal plan and shopping list, while learning from what the
> family actually likes.

It is not "generate recipes". The planner should:

- keep a household food-preference profile
- produce weekly lunch and dinner plans
- use current grocery promotions and seasonal produce as inputs
- reduce waste through ingredient and package reuse across the week
- adapt to feedback after each week
- output practical recipes and one consolidated shopping list
- accept flexible natural-language requests, never a rigid form

---

## 2. Household

- Two adults and one toddler. The toddler eats the adult food in a much smaller portion; no
  separate toddler meals by default, and nobody normally needs a completely separate meal.
  Ages: private profile.
- Omnivorous.
- **One hard ingredient exclusion from an allergy** (which one: private profile). It must be
  enforced on ingredients, not only on tags.
- One intolerance that is managed with enzyme tablets and is therefore **not** a planning
  constraint (private profile).
- Direction of travel: more fibre, less meat, fewer heavy cream-plus-carb meals. Start at about
  3 meat dinners a week (so about 3 meat-free) and reduce over time, gradually, never abruptly.
  Food stays enjoyable and food-positive; nothing should feel like "health food", no calorie or
  macro tracking, and not every meal is a meat substitute.

**Likes.** Favourite meals: spaghetti carbonara, salmon with orange and fennel over rice, potato
soup with sausage, risotto, homemade pizza and homemade gyoza (both rare, time), oven-roasted
root vegetables. Cuisines: Italian and Japanese especially, broad variety otherwise; roughly one
Asian meal a week, at most about two Italian. All proteins and all carbs welcome. Vegetables:
carrots, broccoli, peppers, leek, broadly anything. Fruit: peaches, apples, bananas, berries,
kiwi, nectarines. Most dairy is fine; no strong cheeses such as blue cheese.

**Dislikes.** Mushrooms, for one adult: small amounts are fine when finely chopped into a strong
sauce or easy to pick out, so not a ban. Overcooked pasta. No other "tired of" foods at the moment.

---

## 3. Planning rules

### Week structure

- Default: 5 lunches and 5 dinners, weekdays only. Weekends are normally not planned.
- Two weekdays may stay intentionally unplanned (leftovers, eating out, guests, ordering).
  Currently Monday and Thursday are sports or busy days.
- Any of this can be overridden in the weekly request.

### Dinner

- Normal maximum 45 minutes, occasional absolute maximum 60 when the request allows it or the
  meal is worth it. Target 30–45 most days. A more involved meal is flagged, and the plan says
  whether part of it can be prepared earlier.
- Dinner around 18:30; the toddler may eat earlier.
- Monday and Thursday are sports days and get especially practical dinners unless told otherwise.
- About 2–3 oven, air-fryer or other "hands-off equipment" meals a week is a good default.
- The request may name particularly busy days or "experiment" days, or a stricter limit for a day.

### Lunch

- About 3 lunches from dinner leftovers and about 2 independent quick lunches: salads, grain
  bowls, sandwiches, wraps and the like. Cold or reheated both fine (microwave available).
- About 15 minutes of active preparation.
- Leftovers are strongly preferred where the dinner translates well, but never forced when it
  does not. Never default to instant ramen.
- No packed lunches at the moment.

### Variety

- The same meal at most every 3–4 weeks; never twice in one week except as leftovers.
- The same main protein at most about twice a week.
- Vary the carb base from day to day where practical.
- Roughly 60 % familiar, 40 % new; always include something new.

---

## 4. Shopping context

- Location: Aachen, Germany. A primary supermarket (Edeka), a secondary one (REWE), a preferred
  fishmonger, and an Aldi for worthwhile offers; which branches: private profile. Shopping at
  several stores is fine when there is a meaningful benefit.
- **Promotions are inputs, not requirements.** Check current Edeka, REWE and relevant Aldi offers,
  but use one only when it fits the family and the week. When an offer shapes the plan, name the
  store, the product and in one line why it fits. Never recommend an extra purchase just because
  it is discounted. Offers expire; anything fetched needs a timestamp and a validity period, and
  stale offers must never silently count as current.
- Seasonal produce available in Germany first, where practical; it need not be locally grown, and
  it is never forced into a meal where it does not fit. Seasonality should influence the choice
  more over time. Known favourites: kale, pumpkin, tomatoes, berries. Nothing seasonal is banned.
- No hard weekly budget. Sensible value and low waste matter. Good meat on offer beats the
  cheapest meat; quality versus price is judged case by case.

---

## 5. Pantry and shopping list

Commonly stocked but **never assumed to be in stock**: rice, pasta, flour, canned tomatoes, beans,
lentils, chickpeas, stock, spices, oils, vinegar, soy sauce, coconut milk, tomato paste, mustard,
honey, frozen spinach, frozen peas, frozen shrimp, Japanese noodles, rice paper, sushi rice.
Possibly in the freezer: mango, mixed berries, piccolini.

Rules:

- **Every ingredient of every planned recipe goes on the shopping list, pantry staples included.**
  Becci checks her own stock. A required ingredient missing from the list is a validation error.
- Pantry items may be bought in larger economical sizes; fresh ingredients are not overbought
  just to get a better unit price.
- Use opened ingredients before buying another package where practical.
- The list is organised by section, in this order: Produce, Meat/Fish, Dairy, Pantry, Frozen,
  Household, Other. Quantities are consolidated across all meals with realistic package sizes.
- An approximate weekly cost is given when enough current price information exists. It is
  informational, not a budget.

---

## 6. Waste and reuse

Medium priority; it must not make the menu repetitive. The biggest known waste source is buying
things without a concrete plan for them.

- Reuse opened ingredients; account for realistic package sizes. When designing the week, look
  at half-used vegetables, herbs, dairy and sauces in particular.
- Never buy an ingredient without a concrete use. Avoid a shopping list full of small quantities
  that will likely become waste.
- Consolidate quantities across the week's recipes.
- Reusing an ingredient in different meals is encouraged; reusing a protein is fine within the
  twice-a-week limit; the same meal twice is not (except leftovers).
- No automatic "use these first" section unless it is genuinely useful.

---

## 7. Equipment and skill

Oven, induction stove, microwave, air fryer, pressure cooker, blender, stand mixer (KitchenAid),
grill/BBQ, kettle, iSi Gourmet Whip. Confident cook who enjoys equipment; no techniques to avoid.
Recipes may be somewhat ambitious as long as time limits hold.

---

## 8. Recipe output

- Very concise. Metric. Weights over cups and spoons where practical.
- Per recipe: name, short description, prep and cook time, concise ingredient list, concise
  method, toddler adjustment where relevant.
- 4 servings by default (the household is smaller, but 4 gives leftovers).
- No calorie or macro information unless asked.
- Own recipes, links to external recipes, or a mix are all acceptable.

Priority order when recipes and plans are designed:

1. enjoyable food
2. hard dietary constraints
3. weekly logistics (time, busy days)
4. ingredients already opened or needing use
5. seasonality
6. worthwhile promotions
7. variety
8. waste reduction
9. gradual nutritional improvement

> Do not let theoretical optimisation undermine enjoyable family meals.

**Toddler adaptation.** Default: same meal. For spicy, very salty or otherwise unsuitable
components the recipe says explicitly: cook the common base, take the toddler portion out, then
finish the adult portions. Meals should lend themselves to this naturally. No separate toddler
recipe unless truly necessary, and toddler food is not made artificially bland.

**Weekly plan output** (the master spec's default shape, useful as the model for whatever the
site renders): an at-a-glance table Monday to Friday with lunch, dinner and dinner time; the
lunches (name, description, prep time, whether it uses leftovers); the dinners (name, description,
total time, key preparation note, toddler adjustment); a short shopping strategy (offers used,
major ingredient reuse, seasonal produce, good-value decisions); the consolidated shopping list by
section (§5); the estimated cost with a caveat if needed.

---

## 9. Feedback loop

After each week ask for: loved / liked / fine / disliked, plus a free comment per meal.

- Reason given for a dislike → infer the underlying ingredient, technique or preference and use it.
  Examples: "too creamy" → fewer heavy-cream dishes; "too much work for a weekday" → simpler
  preparation; "didn't like the texture of the beans" → avoid that preparation; "too spicy" →
  adjust spice; "mushrooms were annoying" → less mushroom, not a ban.
- No reason given → avoid that specific recipe; do **not** infer a broad ingredient dislike.
- Positive feedback also steers future suggestions.
- A lasting preference stated at any time ("we like X now", "no more Y") is a candidate change to
  the standing profile, not just to that week. Periodically revisit: foods becoming repetitive,
  foods newly enjoyed or consistently rejected, meat frequency, seasonal tastes, desired
  complexity, lunch and leftover patterns, new equipment or stores.
- Feedback is durable and append-only: meal, rating, comment, inferred preference, confidence,
  timestamp. Current preferences are derived from profile plus history, never by overwriting
  history. That allows "disliked mushrooms three times when prominent, fine when finely chopped"
  instead of one bad meal becoming a permanent ban.

---

## 10. Weekly interaction

No rigid form. Requests like these must work and combine with the standing profile:

"Plan this week." · "Monday needs to be under 25 minutes and we have half a cabbage to use." ·
"No rice dishes this week, otherwise surprise me." · "We're away Friday, only plan four days." ·
"I want to experiment." · "We have guests Tuesday." · "Make this week cheaper." · "We have lots
of spinach and carrots, please prioritise those."

A request may carry any mix of: known offers, ingredients to use, time limits, busy days, meals,
cuisines or ingredients to avoid, number of days, a dietary focus. With no instructions at all,
the standing profile plus current season and offers are enough.

The profile is never restated week to week. Temporary wishes (like "lighter, less processed food
after a trip") change that week only, not the profile.

---

## 11. Test run of 2026-09-22 (reference)

Request: dinner tonight, lunch and dinner tomorrow and Friday, Thursday unplanned, temporary wish
for real ingredients, vegetables, grains, leaner protein.

Result: Tue dinner orange salmon, fennel and roasted carrots with barley (35 min) → Wed lunch
leftover salmon-barley bowl; Wed dinner warm lentil, roasted pepper and feta bowls with crispy
potatoes (40 min); Fri lunch Mediterranean chickpea grain salad; Fri dinner ginger-soy chicken,
broccoli and peppers with brown rice (35 min). Two meat-free dinners, one lean meat, one fish, no
cream, seasonal September produce, leftovers used on purpose. The shopping list covered produce,
protein, feta and every grain and pulse, pantry items included.

Context checked at the time: Edeka offers valid 21–26 September, REWE 21–27 September. REWE's
detailed prospect could not be extracted automatically. An Edeka pork promotion was deliberately
not used because it clashed with the week's "lighter" wish. September seasonal list: broccoli,
cauliflower, cabbages, beans, fennel, potatoes, pumpkin, carrots, peppers, parsnips, leek, beetroot,
spinach, tomatoes, zucchini, celery, apples, pears, plums.

---

## 12. Ideas from the handoff (not decisions)

**Conceptual pipeline.** Household profile → weekly request → current context (season, offers) →
candidate meals → hard filter → scoring → whole-week assembly → recipes → consolidated shopping
list → brief rationale → feedback → preference updates.

**Separate profile from planning state.** Human-readable master profile that Becci can edit,
machine-readable structured state next to it, append-only feedback history.

**Meal metadata** worth having: cuisine, prep/cook/total minutes, servings, protein and protein
category (meat, fish, shellfish, egg, dairy, legume, tofu/soy, vegetarian/other), carb base,
vegetables, ingredients, dietary tags, equipment, leftover quality, toddler adaptation,
seasonality, difficulty, processedness, source. The allergy exclusion is enforced on ingredients,
never only on tags.

**Ingredient model** for the shopping side: canonical name, category, unit, package size,
perishability, pantry-eligible, seasonal period. Recipes reference canonical ingredients so
quantities can be consolidated and package sizes reasoned about.

**Offers layer.** Never hard-code prices into recipes. Offers carry store, product, price, package
size, valid-from/to, source URL, confidence, and a fetch timestamp.

**Planning algorithm.** Parse request → load profile → fetch context → generate more candidates
than needed (20–40 dinners, 15–30 lunches) → hard-filter (allergy, exclusions, time, equipment,
date rules) → score (enjoyment, preference, season, promotion, reuse, leftover use, variety,
novelty, value; minus waste risk, repetition, complexity; nutrition never dominates) → choose the
week jointly, not meal by meal → write recipes → consolidate the shopping list → explain a few
notable choices in one line each.

**Engineering principles.** Hard constraints in deterministic code, never left to an LLM's memory.
Soft preferences scored. Feedback durable. State human-readable and exportable. Becci can
override or lock any meal and mark ingredients she already has. Smallest useful MVP first.

**Suggested MVP.** Inputs: profile, natural-language weekly request, optional "ingredients to use"
and busy days. Data: curated recipe set, structured profile, simple seasonal calendar, offers
fetched by hand or externally. Output: lunches, dinners, recipes, leftover mapping, shopping list,
rough cost, short rationale. Feedback: four buttons plus comment. First automation: store offers.

**Later features** (compatible, not needed now): fridge/freezer inventory, barcode or receipt
import, retailer APIs and carts, price history, per-person profiles, weather-aware planning, modes
(use-up, cheap week, foodie week, 15-minute week, guests, BBQ, meal prep), substitutions, nutrition
on demand, calendar integration, recurring planning, reminders.

**Open questions the handoff left** (recommended default: start simple, local-first, deterministic
where constraints matter, LLM-assisted where judgement matters): stack; local vs hosted; recipe
source; reliable offer sourcing; price history; manual pantry confirmation; UI vs natural-language
editing of the profile; deterministic, LLM or hybrid scoring; licensing of external recipes;
retailer integration; multiple households; whether feedback changes preferences automatically.

---

## 13. Fit with CHAOS KITCHEN – what to decide first

What the site already has that the planner can build on:

- A validated recipe format with ids per ingredient, units with rounding categories, scaling to
  any yield, and grouped steps (SPEC.md §4, §5). Recipes are the natural "curated recipe set".
- Tags by category (course, diet, season, cuisine) that already cover several planner dimensions.
- A shopping-list path via Bring! with schema.org ingredient lines (SPEC.md §6.8).
- Pure, tested library functions that run in the browser.

Where the handoff's assumptions collide with this project's constraints (SPEC.md §1, §2):

- **No server, no database, no logins.** Persistent profile, feedback history and week-to-week
  learning need a home. Options: browser storage on one device; the plan encoded in a shareable
  URL; YAML files in the repo that Becci edits like recipes; or the planner living outside the
  site entirely (a local tool or a Claude Code workflow) with only its output published.
- **No LLM at runtime.** The natural-language weekly request, candidate generation and recipe
  writing are LLM jobs in the handoff. On a static site they either become deterministic
  (structured choices instead of free text) or happen offline, e.g. in a Claude Code session that
  writes a plan file which the site then renders.
- **No third-party loads, public repo.** Live promotion scraping from the site is out. Offers and
  seasonal data would be fetched outside the site, timestamped, and committed or pasted in.
- **Privacy.** The profile must stay out of the public repository; see §14.

All four questions this section used to raise are answered in §14.

---

## 14. Decisions (2026-09-23)

**How the planner works.** Becci comes to Claude Code with a weekly request in natural language.
Claude Code fills the gaps from the private profile, fetches current offers and seasonal produce
during the session, and produces two things: a private plan for Becci, and the public version on
the site. New meals become normal recipe files. After the week, Becci tells Claude Code which
recipes join the permanent collection and which are deleted. Over time the collection grows and
the planner draws from it more, relying on new recipes only when the family wants to experiment.
The site never runs an LLM; it only displays.

**Files.**

- `planner/private/` is gitignored. It holds `profile.md` (allergy, ages, addresses, everything
  personal) and the private weekly plans (offers, shopping strategy, cost). The committed
  `planner/profile.example.md` shows the shape with placeholders.
- `planner/history/<year>-W<week>.md` is committed: the request in one line, the meals, the
  ratings and comments, and the keep/delete verdicts. This is the planner's memory; Claude Code
  reads it when planning (what was cooked when, what to avoid, what may return after 3–4 weeks).
- `planner/README.md` is committed: the weekly workflow and the prompt templates for planning a
  week and for reviewing it.
- `src/data/plan.yaml` is the public plan the site renders. One week: dates, an optional
  sentence, and per day a lunch and a dinner. An entry is a recipe (slug), leftovers of another
  day, or free text. Validated at build time: every slug exists, days in order, at most **10**
  recipe-bearing entries (§ Bring! below).

**Recipes.** New recipes of the week are written in the site's format and carry the optional
field `trial: true`. Trial recipes are **hidden from the overview** (cards and search) and reachable
only through the plan; a build warning names a trial recipe that is not in the current plan. When
Becci keeps a recipe, the field is removed; otherwise the file is deleted. No photo yet is fine.

**Homepage section "Diese Woche".** Above the search toolbar, hidden when there is no plan. Shows
the week's dates, the days with lunch and dinner as mini cards (photo, title, time) linking to the
recipe pages, a tick box per recipe-bearing meal (all ticked by default, "Alle" / "Keine"
buttons), a button „Zutaten der Woche an Bring! senden“, and a collapsible consolidated shopping
list for the ticked meals, computed in the browser. Each visitor's ticks are stored in their own
browser for the week. The section stays up until Becci replaces the plan.

**Bring! for the whole week.** Bring! fetches the page behind the link and reads its JSON-LD, so
it cannot see what a visitor ticked. Therefore the build generates one hidden page per possible
selection under `/woche/liste/<selection>/`, each carrying one JSON-LD "recipe" named after the
week with the consolidated ingredients of that selection. The homepage script points the button
at the page matching the ticks. With the cap of 10 recipe-bearing entries that is at most 1023
tiny pages, roughly 5 MB and a few seconds of build time. Consolidation merges ingredients by
normalised name and unit at each recipe's base yield; imperfect merges ("Zwiebel" vs "rote
Zwiebel") are accepted and tuned after a few weeks of use. Works only against the live site.

**Not in the first version.** Cost estimates on the site, per-person profiles, offer history,
anything from the handoff's "later features" list.

---

## 15. Plan of action

Estimates are working time in Claude Code sessions plus Becci's review. Each step ends with
`npm test` and `npm run build` green and one local commit; Becci pushes.

**Session A – data and logic (about 3 h, no design decisions)**

1. Housekeeping (30 min): `planner/private/` in `.gitignore`, `profile.md` written from §2 and §4,
   `profile.example.md` with placeholders, the personal details removed from this file.
2. Data model (1 h): optional recipe field `trial`; plan schema, loader and validation in
   `src/lib/plan.ts` with German messages; `_vorlage.yaml` and SPEC.md §4 updated; unit tests.
3. Shopping consolidation (1 h): `src/lib/shopping.ts`, pure and browser-safe, merges the
   ingredients of several recipes into one list of schema.org lines; unit tests for the merge rules
   (same name and unit add up, ranges add both ends, no-amount items appear once, optional only
   when optional everywhere).
4. Hidden week pages (30 min): `src/pages/woche/liste/[selection].astro` with the JSON-LD, a
   one-line German note and the list as plain text; the overview hides trial recipes.

**Session B – the visible part (about 3 h, Becci's eyes needed)**

5. Section design (1 h): the "Diese Woche" component following SPEC.md §13, screenshots in
   headless Chrome at phone and desktop width, confirmed with Becci before styling is final.
6. Section script (1 h): ticks, "Alle" / "Keine", storage per week, Bring! link, visible list.
7. Planner workflow (1 h): `planner/README.md` with the two prompt templates, the history format
   with a worked example, SPEC.md (§3, §4, §6.9 Wochenplan, §7, §12), README DE and EN, one
   sentence in the Datenschutzerklärung about the week button.

**Session C – first real week (about 1 h plus the week itself)**

8. Merge into `main` and push. Until `plan.yaml` holds a week the site does not change, so the
   merge is safe. Becci tests the week button in the Bring! app on the phone against the live site.
9. First planning session with a real request: profile, offers, recipes, plan, history entry.
10. After the week: first review session, keep/delete verdicts, fixes to the templates and the
    consolidation from what came up.

Total: about 7 to 8 hours of working time across three sessions, spread over at least a week
because step 10 needs a cooked week.
