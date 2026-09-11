# CLAUDE.md – Familien-Rezeptseite

Static family recipe website built with Astro and hosted on GitHub Pages.
`SPEC.md` is the single source of truth for features, data model and rules. Read it before
making changes, and keep it up to date when decisions change.

## About the owner

Becci owns and maintains this project. She is new to web development.

- Explain what you are about to do before each step, and what you changed and why after it,
  in plain language and briefly.
- Becci commits and pushes herself. End a task with the PowerShell commands for that.
  Every push to `main` deploys the live site through GitHub Actions.
- Current status and next steps live in SPEC.md §12. Start a session by reading it.
- Prefer simple, readable solutions over clever ones. Avoid unnecessary abstraction.
- Ask before architectural changes, before adding any dependency, and before changing the
  data model. Give a one-line reason for each proposed dependency.
- When something needs doing outside the code (GitHub settings, installing tools), give exact
  step-by-step instructions.

## Environment

- Windows 11, PowerShell, VS Code. Give commands for PowerShell, not bash.
- Node.js LTS, npm, Git.

## Commands

```powershell
npm install        # install dependencies
npm run dev        # local preview with live reload
npm run build      # production build, runs all data validation
npm run preview    # serve the production build locally
npm test           # unit tests for src/lib (Node's built-in test runner)
```

Run `npm run build` before declaring a task done. It must pass without errors.

## Conventions

- UI text: German. Code, comments, identifiers, YAML field names, commit messages: English.
- Recipe files: `src/content/recipes/<slug>.yaml`; slug is lowercase kebab-case, umlauts
  transliterated (ä→ae, ö→oe, ü→ue, ß→ss). The recipe photo uses the same slug in
  `src/assets/recipes/`. Files starting with `_` are not recipes.
- Step strings in YAML are always double-quoted.
- The site is served under a base path (`/<repo-name>/`). Never hardcode root-relative
  links; always build URLs with the base path.
- Scaling, rounding and placeholder rendering live in `src/lib/` as small, pure functions with
  unit tests covering the rules in SPEC.md §4.6 and §5. These modules also run in the browser,
  so they must not import Node modules; only `lists.ts`, `build-checks.ts`, `recipe-schema.ts`
  and `photos.ts` are build-time only.
- Relative imports inside `src/lib` keep the `.ts` extension; the tests run on Node's own
  TypeScript support without a build step.
- Build validation messages are German, because Becci reads them when a recipe file is wrong.
- Fonts are self-hosted from `src/assets/fonts/`; never load fonts or anything else from a
  third-party server (SPEC.md §6.7).

## Data model changes

A change to the recipe format touches several places at once. Change them together:
schema in `src/content.config.ts`, `SPEC.md`, `src/content/recipes/_vorlage.yaml`, and any
existing recipe files. New fields must be optional so existing recipes stay valid.

Never weaken validation to make a build pass. Fix the data or ask.

## Design

The design plan is confirmed and recorded in SPEC.md §13 (palette, typefaces, layout rules).
Follow it. Propose and confirm with Becci before deviating from it or restyling.

## Privacy

Repository and site are public. Only family roles or first names for people, illustrated
avatars, no personal data (addresses, phone numbers, full names) anywhere in the repository.
The single exception is the Impressum page (SPEC.md §6.7), which holds exactly the legally
required contact details. Every page needs a footer link to it.
