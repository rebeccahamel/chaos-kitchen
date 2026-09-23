# Household profile (example)

The real file is `planner/private/profile.md`. It is ignored by git because the repository is
public (SPEC.md §9). This example shows its shape. Everything that is not personal lives in
MEAL_PLANNER.md, so the private file stays short.

## People

- Number of adults and their ages.
- Children, their ages and how they eat (same food, smaller portion, own meals).

## Hard constraints

- Allergies: which person, which ingredient, in any form. Enforced on the ingredient level.

## Not constraints

- Intolerances that are managed and therefore do not restrict planning.

## Dislikes tied to a person

- Who dislikes what, and how strict it is (ban, "not dominant", "easy to pick out").

## Stores

- Town. Primary store with address, secondary store, fish source, discounter for offers.

## Schedule

- Recurring busy days, usual dinner time, who eats earlier.

## Changes

- Dated one-liners: what changed and when, newest last.
