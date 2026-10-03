# Setup – make this repository yours

This repository arrives with another household inside it: their recipes, their weeks, their
website address and their legal notice. The setup turns it into yours. Your coding agent does the
work; you answer its questions. It takes about fifteen minutes.

## For you

1. Fork or clone the repository and run `npm install` in it (Node.js LTS and Git needed).
2. Open your coding agent in the folder and paste:

```
Set up this repository for my household. Read SETUP.md and follow it.
```

3. Afterwards, plan your first week with prompt A from `planner/README.md`.

Everything below is written for the agent.

---

## For the agent

Read `CLAUDE.md`, `planner/README.md`, `MEAL_PLANNER.md` and `planner/profile.example.md` first.
Then work through the steps in order. Change nothing before the interview is done and the owner
has confirmed your summary of it.

### 1. Who is this?

If `planner/private/profile.md` exists, the setup has been done: say so and stop. Otherwise ask
whether this is a new household, or the existing owner on another computer. The existing owner
only needs to copy `planner/private/` over from the old computer; then stop.

### 2. Interview

Ask in conversation, a few questions at a time, never as one long form. Accept loose answers and
ask back only where a rule would be unclear. You need:

- **People:** adults, children and their ages, who eats what kind of portion.
- **Hard constraints:** allergies and strict exclusions, per person. Also what sounds like a
  restriction but is not.
- **Likes and dislikes:** favourite meals, cuisines, who dislikes what and how strictly.
- **Direction:** anything the household wants more or less of over time.
- **Week rhythm:** which days and which meals to plan, busy days, dinner time, how long cooking
  may take, how lunches work, how many servings.
- **Shopping:** country and town, the stores they use, budget stance, what is usually in the
  pantry.
- **Kitchen:** appliances, confidence, techniques to avoid.
- **How they work with you:** what to call them, experience with Git and web development,
  operating system and shell, the language of the conversation, and whether you commit or they
  do.
- **Repository:** public or private.
- **Website:** none (local preview only), a GitHub Pages address
  (`https://<user>.github.io/<repo>/`), or their own domain. Say what depends on it: the
  Bring! buttons only work with a public website, because Bring! fetches the shopping list from
  it.
- **Apps:** whether they shop with Bring!, and whether meals should go into Todoist (project
  name, due times for lunch and dinner).
- **The recipes that came along:** keep them as a starter collection, or start empty.

Tell them once that the site, the recipes and the build messages are German. The conversation
can be in any language, but translating the site is a project of its own and not part of this
setup.

Summarise what you understood and wait for a yes.

### 3. The profile

Write `planner/private/profile.md` with the sections of `planner/profile.example.md`, in the
owner's own rules and with how strict each one is. Git ignores `planner/private/`, so it exists
only on this computer: tell the owner to include it in their backups. In a private repository
they may instead delete the `planner/private/` line from `.gitignore` and commit it.

### 4. Reset the planner's memory

- Delete every file in `planner/history/`. They are the previous household's weeks.
- In `src/data/plan.yaml` keep the comment at the top and set `weeks: []`.

### 5. Recipes and people

- **Start empty:** delete every file in `src/content/recipes/` except `_vorlage.yaml`, and every
  file in `src/assets/recipes/`. Replace `src/data/people.yaml` with the household's people.
- **Keep the starter collection:** leave the recipes and their pictures. Keep the people they
  name as `author` in `src/data/people.yaml` and add the household's people. Treat the recipes
  as never cooked: the history is empty, so nothing counts as familiar yet.
- In both cases: people appear with first names or family roles only (the repository may be
  public). Set `author` in `src/content/recipes/_vorlage.yaml` to an id that exists in
  `people.yaml`; a unit test checks this. Note the owner's id in the profile under
  "Integrations".
- `src/data/bring.yaml`, `tags.yaml` and `units.yaml` stay as they are.

### 6. The owner's block in CLAUDE.md

Replace the block under "## Owner" with the new owner: name, experience, how much explanation
they want, who commits and pushes, operating system and shell. Keep the points about SPEC.md
§12, simple solutions and asking before architectural changes unless the owner wants otherwise.

In `SPEC.md`, replace the status lines at the top and the log in §12 with one line: set up for a
new household, with today's date. Dated decisions elsewhere in SPEC.md stay; they explain why
the site works the way it does.

### 7. Remove the previous owner's identity

Always, whichever website option was chosen. These must never be published under a new owner:

- `public/CNAME` holds the previous owner's domain. Delete it, or put the new owner's domain in
  it (step 8).
- `src/pages/impressum.astro` holds the previous owner's legal contact details and names them as
  responsible in the Datenschutzerklärung. Replace both with the new owner's details. Ask for
  them; do not invent any. Whether and in what form they need an Impressum is their decision and
  depends on their country; if they publish no website, replace the details with a neutral
  placeholder. Keep these details in this one file only.
- `astro.config.mjs`: `site` (step 8).
- `src/lib/site.ts`: `SITE_NAME`, if the household wants its own name. `package.json`: `name`.
- `README.md` and `README.en.md`: the link to the live site and to the repository.

### 8. Website

- **None:** delete `.github/workflows/deploy.yml`, so that a push does not try to publish. Set
  `site` in `astro.config.mjs` to `http://localhost:4321`. The plan is viewed with `npm run dev`.
- **GitHub Pages address:** in `astro.config.mjs` set `site: 'https://<user>.github.io'` and add
  `base: '/<repo>'`. All internal links already respect the base path. Then give the owner these
  steps: on GitHub open the repository → Settings → Pages → "Build and deployment" → Source:
  "GitHub Actions". In a fork, also open the Actions tab once and enable workflows. Every push
  to `main` then publishes. A private repository needs a paid GitHub plan for Pages; the
  published site is public either way.
- **Own domain:** `site: 'https://<domain>'`, no `base`, and `public/CNAME` containing the
  domain. The same Pages steps as above, plus the domain under Settings → Pages → "Custom
  domain" and the DNS records GitHub asks for there. SPEC.md §8 describes the result.

Note the website's address, or "none", in the profile under "Integrations".

### 9. Todoist

- **No:** delete `.mcp.json`.
- **Yes:** keep `.mcp.json`, have the owner sign in (Claude Code: `/mcp`), and note project name
  and due times in the profile under "Integrations".

### 10. Check and finish

Run `npm test` and `npm run build`. Both must pass; fix what the messages name. Commit as
"Set up for a new household", or hand over the commands, as the owner chose.

Finish with a short summary: what you changed, what is left for the owner to do themselves
(GitHub settings, DNS, backup of `planner/private/`), and the next step: prompt A in
`planner/README.md`.
