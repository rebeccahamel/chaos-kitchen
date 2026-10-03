# Household profile (example)

The real file is `planner/private/profile.md`. Git ignores it, so nothing in it becomes public.
This example shows its shape with an invented household; `SETUP.md` describes how a new owner
gets their own, written by the agent from a short interview. The general rules live in
MEAL_PLANNER.md; where the profile says something different, the profile wins.

Write rules the way you would say them. Say how strict each one is: "never", "sparingly",
"not a ban".

## People

- Two adults (38 and 41) and one child, 6 years old. The child eats the same food in a smaller
  portion.
- Omnivorous; one adult eats no pork.

## Hard constraints

- **One adult is allergic to peanuts. Peanuts are never used, in any form** (peanut butter,
  peanut oil, satay sauce). Enforced on the ingredient level, never only by tag.

## Not constraints

- The child is said to dislike everything green. Not a planning constraint; serve it anyway.

## Direction

- More vegetables and pulses, meat at most three dinners a week. Change gradually.
- No calorie counting; food should stay fun.

## Likes

- Favourite meals: lasagne, chicken curry, Flammkuchen, pancakes on Saturdays.
- Cuisines: Mediterranean and Indian; at most one very spicy meal a week.
- Vegetables everyone eats: carrots, peas, sweetcorn, peppers.

## Dislikes

- One adult: no coriander leaves, ever. A ban.
- The child: no visible onions. Finely chopped and cooked into a sauce is fine.
- Nobody likes fennel much; small amounts roasted are fine.

## Week rhythm

- Plan Monday to Friday, dinners only; lunch is eaten at work and at school.
- Tuesday is football practice: dinner in 20 minutes or from the day before.
- Friday is pizza or eating out: leave it unplanned.
- Dinner at 18:00. Normally at most 40 minutes, on Sunday up to 90 for something special.
- Sunday dinner is planned and cooked double; the second half is Monday's dinner.
- 4 servings per recipe.

## Stores and shopping

- Town: Münster, Germany.
- Weekly shop at a large supermarket (Rewe), top-ups at Lidl, the Saturday market for vegetables.
- Offers to check: Rewe and Lidl.
- Budget: about 120 € a week for dinners; say so when a plan is clearly above it.

## Pantry

Commonly stocked but never assumed to be in stock: pasta, rice, couscous, canned tomatoes,
chickpeas, red lentils, olive oil, soy sauce, curry paste, frozen peas, frozen spinach.

## Equipment and skill

Stove, oven, microwave, hand blender, rice cooker. Comfortable with everyday cooking; no deep
frying.

## Integrations

- Website: none yet (the plan is viewed with `npm run dev`). Or: `https://example.org/`.
- Recipes are written with `author: alex` (an id from `src/data/people.yaml`).
- Bring!: yes. Needs the live website, because Bring! fetches the shopping list from it.
- Todoist: yes, project "Essen", lunch due 12:00, dinner 18:00. Or: no.

## Changes

- Dated one-liners: what changed and when, newest last.
- 2026-01-12: no visible onions for the child (review of week 2).
