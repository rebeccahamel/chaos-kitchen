# Meal planner – general rules

The planner is a conversation with a coding agent (built with Claude Code), not a program: the
agent plans the week, writes the recipes and the plan file, and keeps the history; the website
only shows the result. The weekly routine and the prompts are in `planner/README.md`.

This file holds the rules that apply to any household. Everything about one particular household
(who eats, allergies, likes and dislikes, busy days, stores, pantry, equipment) lives in
`planner/private/profile.md`, which git ignores; `planner/profile.example.md` shows a complete
invented one. **Where the profile says something different from this file, the profile wins.**
A fresh clone gets its profile through `SETUP.md`.

---

## 1. Product idea

> Maintain a living household food-planning model that turns a casual weekly request into a
> coherent, enjoyable, low-waste meal plan and shopping list, while learning from what the
> household actually likes.

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

The profile answers who the planner cooks for. Its sections, with the kind of rule each holds:

- **People:** how many adults and children, ages, who eats what kind of portion.
- **Hard constraints:** allergies and strict exclusions. "One adult is allergic to peanuts:
  never used, in any form." Enforced on every ingredient of every recipe, never only by tag.
- **Not constraints:** things that sound like a restriction but are not. "Lactose intolerance,
  managed with tablets."
- **Direction:** where the household wants to go over time. "Less meat: about three meat dinners
  a week, reduced gradually."
- **Likes:** favourite meals, cuisines and how often.
- **Dislikes:** who dislikes what and how strictly ("no coriander for one adult, a ban";
  "mushrooms only finely chopped").
- **Week rhythm:** which days are planned, busy days, dinner time, time limits, how lunches work.
- **Stores and shopping, pantry, equipment:** see §4, §5, §7.
- **Integrations:** the website's address, the author id for new recipes, Bring!, Todoist.
- **Changes:** dated one-liners, so it stays visible when and why a rule appeared.

Without a profile the planner cannot plan; it asks for the setup (`SETUP.md`) instead of guessing.

---

## 3. Planning rules

These are defaults. The profile's week rhythm replaces any of them, and the weekly request
overrides both for that week.

### Week structure

- The plan covers Monday to Sunday. Default: lunch and dinner on the weekdays; Saturday and
  Sunday stay free unless the profile or the weekly request plans them.
- Days may stay intentionally unplanned (leftovers, eating out, guests, ordering).
- The only hard limit is the site's cap of 10 different recipes per week (§11, Bring!);
  leftovers and text meals do not count.

### Dinner

- The time limit per dinner comes from the profile ("normally 45 minutes, 60 at most"). Without
  one, stay under 45 minutes on weekdays. A more involved meal is flagged, and the plan says
  whether part of it can be prepared earlier.
- Busy days from the profile get especially practical dinners unless told otherwise.
- The request may name particularly busy days or "experiment" days, or a stricter limit for a day.

### Lunch

- How lunches work comes from the profile ("three from leftovers, two quick independent ones").
- Leftovers are strongly preferred where the dinner translates well, but never forced when it
  does not.

### Variety

- The same meal at most every 3–4 weeks; never twice in one week except as leftovers.
- The same main protein at most about twice a week.
- Vary the carb base from day to day where practical.
- Roughly 60 % familiar, 40 % new; always include something new.

---

## 4. Shopping context

- Town and stores come from the profile.
- **Promotions are inputs, not requirements.** Check the current offers of the profile's stores,
  but use one only when it fits the household and the week. When an offer shapes the plan, name
  the store, the product and in one line why it fits. Never recommend an extra purchase just
  because it is discounted. Offers expire; anything fetched needs a timestamp and a validity
  period, and stale offers must never silently count as current.
- Seasonal produce available in the household's country first, where practical; it need not be
  locally grown, and it is never forced into a meal where it does not fit.
- Budget stance comes from the profile. Without one: no hard budget, sensible value, low waste.

---

## 5. Pantry and shopping list

The profile lists what the household commonly stocks. It is **never assumed to be in stock**.

- **Every ingredient of every planned recipe goes on the shopping list, pantry staples included.**
  The household checks its own stock. A required ingredient missing from the list is a
  validation error.
- Pantry items may be bought in larger economical sizes; fresh ingredients are not overbought
  just to get a better unit price.
- Use opened ingredients before buying another package where practical.
- The list is organised by section, in this order: Produce, Meat/Fish, Dairy, Pantry, Frozen,
  Household, Other. Quantities are consolidated across all meals with realistic package sizes.
- An approximate weekly cost is given when enough current price information exists. It is
  informational, not a budget.

---

## 6. Waste and reuse

Medium priority; it must not make the menu repetitive.

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

From the profile: which appliances exist, how confident the cook is, techniques to avoid.
Without an entry, assume a stove, an oven and ordinary skill.

---

## 8. Recipe output

- Very concise. Metric. Weights over cups and spoons where practical.
- Per recipe: name, short description, prep and cook time, concise ingredient list, concise
  method, adjustment for small children where relevant.
- 4 servings by default, also for smaller households, because 4 gives leftovers.
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

Hard constraints are never traded against anything: every meal meets them. The order says
what shapes the choice among the meals that do.

> Do not let theoretical optimisation undermine enjoyable family meals.

**Small children.** Default: same meal. For spicy, very salty or otherwise unsuitable components
the recipe says explicitly: cook the common base, take the child's portion out, then finish the
adult portions. Meals should lend themselves to this naturally. No separate children's recipe
unless truly necessary, and their food is not made artificially bland.

**Weekly plan output** (the shape of the private plan): an at-a-glance table Monday to Sunday
with lunch, dinner and dinner time; the lunches (name, description, prep time, whether it uses
leftovers); the dinners (name, description, total time, key preparation note, adjustment for
children); a short shopping strategy (offers used, major ingredient reuse, seasonal produce,
good-value decisions); the consolidated shopping list by section (§5); the estimated cost with a
caveat if needed.

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
  the profile, not just to that week. Periodically revisit: foods becoming repetitive, foods newly
  enjoyed or consistently rejected, meat frequency, seasonal tastes, desired complexity, lunch
  and leftover patterns, new equipment or stores.
- Feedback is durable and append-only: meal, rating, comment, date. Current preferences are
  derived from profile plus history, never by overwriting history. That allows "disliked
  mushrooms three times when prominent, fine when finely chopped" instead of one bad meal
  becoming a permanent ban.

---

## 10. Weekly interaction

No rigid form. Requests like these must work and combine with the profile:

"Plan this week." · "Monday needs to be under 25 minutes and we have half a cabbage to use." ·
"No rice dishes this week, otherwise surprise me." · "We're away Friday, only plan four days." ·
"I want to experiment." · "We have guests Tuesday." · "Make this week cheaper." · "We have lots
of spinach and carrots, please prioritise those."

A request may carry any mix of: known offers, ingredients to use, time limits, busy days, meals,
cuisines or ingredients to avoid, number of days, a dietary focus. With no instructions at all,
the profile plus current season and offers are enough.

The profile is never restated week to week. Temporary wishes (like "lighter, less processed food
after a trip") change that week only, not the profile.

---

## 11. How the planner works

**The idea.** The owner comes to the agent with a weekly request in natural language. The agent
fills the gaps from the private profile, fetches current offers and seasonal produce during the
session, and produces two things: a private plan for the owner, and the public version on the
site. New meals become normal recipe files. After the week, the owner says which recipes join
the permanent collection and which are deleted. Over time the collection grows and the planner
draws from it more, relying on new recipes only when the household wants to experiment. The
site never runs an LLM; it only displays.

**Files.**

- `planner/private/` is gitignored. It holds `profile.md` and the private weekly plans (offers,
  shopping strategy, cost). The committed `planner/profile.example.md` shows a complete example.
- `planner/history/<year>-W<week>.md` is committed: the request in one line, the meals, the
  ratings and comments, and the keep/delete verdicts. This is the planner's memory; the agent
  reads it when planning (what was cooked when, what to avoid, what may return after 3–4 weeks).
- `planner/README.md` is committed: the weekly workflow and the prompts for planning a week and
  for reviewing it.
- `src/data/plan.yaml` is the public plan the site renders. Up to two weeks (this week and the
  next), each with dates, an optional sentence, and per day a lunch and a dinner. An entry is a
  recipe (slug), leftovers of another day of the same week, or free text. Validated at build
  time: every slug exists, days in order, weeks in order and not overlapping, at most **10**
  different recipes per week (Bring! below).

**Recipes.** New recipes of the week are written in the site's format and carry the optional
field `trial: true`. Trial recipes are **hidden from the overview** (cards and search) and reachable
only through the plan; a build warning names a trial recipe that is not in the current plan. When
the owner keeps a recipe, the field is removed; otherwise the file is deleted. No photo yet is fine.

**Homepage section "Diese Woche".** Above the search toolbar, hidden when there is no plan. One
slide per week, side by side in a strip that swipes on phones and has arrows; it opens on the
week that contains today and labels the slides "Diese Woche" and "Nächste Woche". A slide shows
the week's dates, the days with lunch and dinner as mini cards (photo, title, time) linking to
the recipe pages, a tick box per recipe-bearing meal (all ticked by default, "Alle" / "Keine"
buttons), a button „Zutaten der Woche an Bring! senden“, and a collapsible consolidated shopping
list for the ticked meals, computed in the browser. Each visitor's ticks are stored in their own
browser per week, so both weeks can be shopped independently. The section stays up until the
plan is replaced. Details: SPEC.md §6.9.

**Bring! for the whole week.** Bring! fetches the page behind the link and reads its JSON-LD, so
it cannot see what a visitor ticked. Therefore the build generates, per week, one hidden page per
possible selection under `/woche/<first day>/liste/<selection>/`, each carrying one JSON-LD
"recipe" named after the week with the consolidated ingredients of that selection. The homepage
script points each week's button at the page matching the ticks. With the cap of 10 recipes per
week and two weeks that is at most 2046 tiny pages, roughly 30 MB and a few seconds of build
time. Consolidation merges ingredients by normalised name and unit at each recipe's base yield;
imperfect merges ("Zwiebel" vs "rote Zwiebel") are accepted. Works only against the live site,
because Bring! has to reach the page.

**Todoist (optional).** A household that keeps its tasks in Todoist can have the week's meals
written there as one task per meal, through the official Todoist MCP server (`.mcp.json` holds
only its public address, the sign-in stays on the PC). Whether, into which project and at what
times is in the profile's "Integrations"; the rules are in `planner/README.md`.

**Not in this version.** Cost estimates on the site, per-person profiles, offer history, a
pantry inventory.
