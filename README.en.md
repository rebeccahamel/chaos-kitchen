# Chaos Kitchen – weekly meal planner and family recipe site

🇩🇪 [Deutsche Version](README.md)

A weekly meal planner that is not a program but a conversation with a coding agent (built with
[Claude Code](https://claude.com/claude-code)). You say what the week needs. The agent plans
lunches and dinners to fit your household, writes the recipes and the shopping list, and
remembers what everyone liked. It comes with a small recipe website that shows the plan and the
recipes and sends the shopping list to the Bring! app.

This is what ours looks like: <https://chaos-kitchen.com/>

The repository is meant to be taken over for your own household.

## What you get

- **A weekly plan by your rules.** Allergies, preferences, busy days and stores live in a
  private profile that never ends up in the repository.
- **Recipes that stay.** New recipes are on trial for a week. What the household likes joins the
  collection the planner draws from in future.
- **One shopping list for the whole week,** merged across all recipes, one tap away from Bring!.
- **A recipe website** with portion scaling and a cooking mode for the phone, published through
  GitHub Pages.
- If you like: the meals as tasks in Todoist.

## What you need

- [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/), version 24 or newer
- a coding agent that can read and write files in the folder. Built and tested with Claude Code;
  other agents find their way in through [AGENTS.md](AGENTS.md).
- a GitHub account if you want to publish the site. Without a published site everything works
  except the Bring! buttons.

The site and the recipes are in German. You can talk to the agent in any language.

## Getting started

1. Fork or clone the repository, then in its folder:

   ```
   npm install
   ```

2. Open the agent in the folder and paste:

   ```
   Set up this repository for my household. Read SETUP.md and follow it.
   ```

   The agent asks about your household, creates your profile, clears the previous owner's
   weeks and replaces the site address and legal notice with yours. You can keep the recipes
   that come along as a starter collection or start empty. The details are in [SETUP.md](SETUP.md).

3. Plan your first week, see the next section.

## Every week

**Plan.** Keep the first sentence and add your wishes in your own words:

```
Plan a week. Read planner/README.md and follow it.

Next week. Monday has to be quick, we still have half a cabbage,
Thursday we are out. One dinner may be an experiment.
```

The agent proposes the week as a table. You adjust until it fits and say GO. Then it writes the
recipes, the plan and the shopping list.

**Cook.** The plan is on the homepage: locally with `npm run dev` (it prints the address),
published after the next `git push`.

**Review.** After the week:

```
Review the week. Read planner/README.md and follow it.

Loved the salmon, keep it. The lentil bowls were fine but too much work, drop them.
```

What may stay joins the collection, the rest is deleted, and the planner takes it into account
from then on.

## Where things live

| Place | Content |
|---|---|
| [planner/README.md](planner/README.md) | how a week works, the prompts, rules for the agent |
| [MEAL_PLANNER.md](MEAL_PLANNER.md) | general planning rules |
| [planner/profile.example.md](planner/profile.example.md) | an example household profile |
| `planner/private/` | your profile and your private weekly plans, not in Git |
| [planner/history/](planner/history/) | one file per week: what was planned and how it went |
| [src/content/recipes/](src/content/recipes/) | the recipes, one file each; [_vorlage.yaml](src/content/recipes/_vorlage.yaml) explains the format |
| [src/data/plan.yaml](src/data/plan.yaml) | the plan the homepage shows |
| [SPEC.md](SPEC.md) | what the site does and how its data is shaped |
| [CLAUDE.md](CLAUDE.md) | working rules for the agent |

## Reuse

Code and recipes may be taken over, adapted and passed on.
