# Setup – make this repository yours

This repository arrives with another household inside it: their recipes, their weeks, their
website address and their legal notice. The setup turns it into yours. Your coding agent does the
work; you answer its questions. It takes about fifteen minutes.

## For you

1. Fork or clone the repository and run `npm install` in it (Git and Node.js 24 or newer).
2. Open your coding agent in the folder and paste:

```
Set up this repository for my household. Read SETUP.md and follow it.
```

3. Afterwards, plan your first week with prompt A from `planner/README.md`.

Everything below is written for the agent.

---

## For the agent

Read `CLAUDE.md`, `planner/README.md`, `MEAL_PLANNER.md` and `planner/profile.example.md` first.
The "Owner" block in `CLAUDE.md` still describes the previous owner until step 6; do not apply
it to the person in front of you. Then work through the steps in order. Change nothing before
the interview is done and the owner has confirmed your summary of it.

### 1. Who is this?

If `planner/private/profile.md` exists, the setup has been done: say so and stop. Otherwise ask
whether this is a new household, or the existing owner on another computer. The existing owner
only needs to copy `planner/private/` over from the old computer; then stop.

### 2. Interview

Ask in conversation, a few questions at a time, never as one long form. Accept loose answers and
ask back only where a rule would be unclear. Where the owner has nothing to say, write "none
named" in the profile instead of inventing something. You need:

- **People:** adults, children and their ages, who eats what kind of portion. Also how each
  person who contributes recipes should appear on the site: a first name or family role, never a
  full name.
- **Hard constraints:** allergies and strict exclusions, per person. Also what sounds like a
  restriction but is not.
- **Likes and dislikes:** favourite meals, cuisines, who dislikes what and how strictly.
- **Direction:** anything the household wants more or less of over time.
- **Week rhythm:** which days and which meals to plan, busy days, dinner time, how long cooking
  may take, how lunches work, how many servings.
- **Shopping:** country and town, the stores they use and whose offers are worth checking,
  budget stance, what is usually in the pantry.
- **Kitchen:** appliances, confidence, techniques to avoid.
- **How they work with you:** what to call them, experience with Git and web development,
  operating system and shell, the language of the conversation, and whether you commit or they
  do.
- **Repository:** public or private, its name and their GitHub user name, and whether to keep
  the Git history. The history contains everything the previous household ever committed,
  including their legal notice; a fork or a push carries it along. That is no secret (their
  repository is public), but someone who wants a clean start can have one (step 10).
- **Website:** none (local preview only), a GitHub Pages address
  (`https://<user>.github.io/<repo>/`), or their own domain; and a name for the site. Say what
  depends on it: the Bring! buttons only work with a public website, because Bring! fetches the
  shopping list from it.
- **Legal notice:** with a public website, the details for the Impressum page (step 7), or the
  decision to fill them in later.
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

- Delete every file in `planner/history/`; they are the previous household's weeks. Leave an
  empty `.gitkeep` there so the folder stays.
- In `src/data/plan.yaml` keep the comment at the top and set `weeks: []`.

### 5. Recipes and people

- **Start empty:** delete every recipe file in `src/content/recipes/` except `_vorlage.yaml`,
  and every picture in `src/assets/recipes/` (its `.gitkeep` stays). Replace
  `src/data/people.yaml` with the household's people.
- **Keep the starter collection:** leave the recipes and their pictures. Keep the people they
  name as `author` in `src/data/people.yaml` and add the household's people. Treat the recipes
  as never cooked: the history is empty, so nothing counts as familiar yet. Check every kept
  recipe against the new household's hard constraints and delete those that break one.
- In both cases: set `author` in `src/content/recipes/_vorlage.yaml` to an id that exists in
  `people.yaml`; a unit test checks this. Note the owner's id in the profile under
  "Integrations".
- `src/data/bring.yaml`, `tags.yaml` and `units.yaml` stay as they are. Everything in
  `src/lib/fixtures/` stays too: it is test data, not part of the site.

### 6. CLAUDE.md and SPEC.md

In `CLAUDE.md`, replace the block under "## Owner" with the new owner: name, experience, how
much explanation they want, who commits and pushes, operating system and shell. Keep the points
about SPEC.md §12, simple solutions and asking before architectural changes unless the owner
wants otherwise.

`SPEC.md` is the single source of truth, so it must not keep describing the previous owner:

- Replace the status paragraph at the top (from "Status" up to the line about the owner) with
  one line: set up for a new household, with today's date.
- In §12 replace everything above "Known small things" with the same line and what comes next
  (the first planned week).
- Correct the facts that changed: the constraint about the owner's experience (§1), the
  development environment (§2), the recipe file named in the layout (§3), the authors (§4.7),
  the site name (§6.6, §13.3), the Impressum (§6.7), hosting and address (§8), privacy (§9) if
  the repository is private.
- Dated decisions stay as they are, also where they name the previous owner; they explain why
  the site works the way it does.

### 7. Remove the previous owner's identity

Always, whichever website option was chosen. None of this may go live under a new owner:

- `public/CNAME` holds the previous owner's domain. Delete it, or put the new owner's domain in
  it (step 8).
- `src/pages/impressum.astro` holds the previous owner's legal contact details and names them as
  responsible in the Datenschutzerklärung. Replace both with the new owner's details, exactly as
  given; invent nothing. Whether and in what form they need an Impressum is their decision and
  depends on their country. Without a website, or when the details are to follow later, put a
  clearly marked placeholder there. Keep these details in this one file only.
- `astro.config.mjs`: `site` (step 8) and the comment that names the old domain.
- `src/lib/site.ts`: `SITE_NAME` and the comment above it. The wordmark in the header is sized
  for about 13 characters; check a longer name at phone width.
- `public/favicon.svg` shows the previous site's initials: change the letters or replace it.
- `package.json`: `name`; then run `npm install --package-lock-only` so the lock file follows.
- `README.md` and `README.en.md`: the title and the line with the link to the live site. The
  rest describes the project for the next person who takes it over and can stay.

### 8. Website

- **None:** delete `.github/workflows/deploy.yml`, so that a push does not try to publish. Set
  `site` in `astro.config.mjs` to `http://localhost:4321`. The plan is viewed with `npm run dev`.
- **GitHub Pages address:** in `astro.config.mjs` set `site: 'https://<user>.github.io'` and add
  `base: '/<repo>'`, with the repository's exact name. All internal links already respect the
  base path; the local preview then lives under that path too (`npm run dev` prints the
  address). Give the owner these steps: on GitHub open the repository → Settings → Pages →
  "Build and deployment" → Source: "GitHub Actions". In a fork, also open the Actions tab once
  and enable workflows. Every push to `main` then publishes. A private repository needs a paid
  GitHub plan for Pages; the published site is public either way.
- **Own domain:** `site: 'https://<domain>'`, no `base`, and `public/CNAME` containing the
  domain. The same Pages steps as above, plus the domain under Settings → Pages → "Custom
  domain" and the DNS records GitHub asks for there. SPEC.md §8 describes the result.

If the Impressum still holds a placeholder, the site must not go live yet: tell the owner not to
push to `main`, or not to switch on Pages, until the details are in.

Note the website's address, or "none", in the profile under "Integrations".

### 9. Todoist

- **No:** delete `.mcp.json`.
- **Yes:** keep `.mcp.json`, have the owner sign in (Claude Code: `/mcp`), and note project name
  and due times in the profile under "Integrations".

### 10. Check and finish

Run `npm test` and `npm run build`. Both must pass; fix what the messages name. With an empty
collection the build warns that the recipe collection is empty and the homepage says "Nichts
gefunden"; both are expected until the first week is planned.

Before the first commit:

- `git remote -v` must show the owner's own repository, not the one this was cloned from.
  Without one, the owner creates an empty repository on GitHub with the name used in step 8, and
  you point `origin` at it.
- In a public repository, `git config user.email` should be the owner's GitHub no-reply address
  if they do not want their e-mail address published (SPEC.md §9).
- **Clean start, only if the owner asked for it in the interview:** delete the `.git` folder,
  run `git init`, and set the branch name to `main` and the remote as above. This cannot be
  undone and cuts the link to the original repository, so later improvements there can no
  longer be merged in.

Commit as "Set up for a new household", or hand over the commands, as the owner chose. Do not
push; that is the owner's step.

Finish with a short summary: what you changed, what is left for the owner to do themselves
(GitHub settings, DNS, Impressum details, backup of `planner/private/`), and the next step:
prompt A in `planner/README.md`.
