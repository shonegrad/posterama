# Development Guide (Posterama)

This file contains non-negotiable development rules for this project. These rules must be followed on every session, every code change, and every deploy.

# SECTION A: Project Metadata

- **Project name:** posterama
- **Primary repo:** <https://github.com/shonegrad/posterama>
- **Default branch:** main
- **Deployment:** GitHub Pages via gh-pages branch
- **Live URL:** <https://shonegrad.github.io/posterama/>
- **Local dev URL:** <http://localhost:5173>

# SECTION B: Always-Run Checklist (every session)

1. Verify repo + remote (`git status`, `git remote -v`)
2. Check if app is already running (`lsof -i :5173`)
3. Reuse existing browser tab if available
4. Confirm current version is correct (local + UI)
5. Make changes
6. Validate (`npm run typecheck && npm run test && npm run build`)
7. Commit + push + deploy (when requested)
8. Verify live version matches

# SECTION C: Prereqs (non-negotiable)

- This repo must use git from day one.
- GitHub must be connected to my GitHub account using existing credentials/config from my other workspaces.
- Verify origin remote is correct and points to GitHub.
- GitHub Pages deployment must be configured for this repo.
- **Pages method:** `gh-pages` branch (via `npm run deploy` / `gh-pages` package).

# SECTION D: Port and process hygiene (no duplicates)

**Rule:**
Before starting any dev server:

- Check whether the app is already running and which port it’s using.
- If a running instance exists, reuse it and do not start a second instance.
- If a new port is required, document why and stop old processes cleanly.

**Concrete commands (macOS/Linux):**

- List listening ports: `lsof -i -P -n | grep LISTEN`
- Find a specific port (typically 5173): `lsof -i :5173`
- Stop a process safely: `kill <PID>` (use `kill -9 <PID>` only if necessary)

# SECTION E: Browser hygiene (reuse tabs)

**Rule:**
When opening the app in a browser:

- Always check if there is already an open tab for the app.
- Reuse the existing tab whenever possible.

Only open a new tab if:

- Wrong environment
- Wrong URL/route
- Stale session that cannot be refreshed

# SECTION F: Versioning system (single source of truth)

**Rule:**

- Use SemVer MAJOR.MINOR.PATCH.
- **Source of Truth:** `package.json` (`version` field).
- The app must visibly print the version in the UI (stable spot: Footer or Settings).
- The version must match across: local working copy, commit history, GitHub repo, GitHub Pages live site.

**Implementation:**

- **Store:** `package.json` > `version`.
- **Update:** Manually increment or use `npm version patch/minor/major`.
- **UI Read:** Usage of `import.meta.env.PACKAGE_VERSION` (requires vite config) or importing `package.json` (if enabled) is recommended to avoid scattered hardcoding.

# SECTION G: Validation rules (never deploy broken builds)

**Rule:**
Before committing for deployment or running any commit+push+deploy workflow:

- Run a quick validation step (build or smoke test).
- If validation fails, block commit/deploy and fix first.

**Validation Command:**

```bash
npm run typecheck && npm run test && npm run build
```

# SECTION H: Commit + push + deploy workflow (must follow this order)

Whenever a change should be published, do all steps in order:

1. Update version (if change warrants it) and ensure UI prints it.
2. Validate (`npm run typecheck && npm run test && npm run build`).
3. `git status` sanity check, confirm intended files.
4. Commit with a meaningful message.
5. Push to GitHub (`git push`).
6. Deploy GitHub Pages (`npm run deploy`).
7. Verify live site updated and displayed version matches.

**Blocking rules:**

- If working tree is dirty and the request is “deploy”, block and require a commit first.
- If deployment fails, capture the error output and record it under Troubleshooting.

# SECTION I: Smart additions (required)

- **Release tags on version changes:**

  ```bash
  git tag vX.Y.Z
  git push --tags
  ```

- **Maintain a lightweight CHANGELOG.md:**
  - One short entry per version bump.
- **Prefer a single deploy script/command:**
  - `npm run deploy`
- **Dirty tree protection after deploy:**
  - `git status` must be clean.
- **Post-deploy verification:**
  - Live URL loads.
  - Version displayed matches intended version.

# SECTION J: Troubleshooting / Known issues

- **Deployment failures:**
  - *Symptom:* Deployment fails or site doesn't update.
  - *Fix:* Verify `gh-pages` branch exists. Check permissions. Ensure build passes locally.
- **Port conflicts:**
  - *Symptom:* EADDRINUSE or "Port already in use".
  - *Fix:* Use `lsof -i :<PORT>` to find the PID, then `kill <PID>`.

---

# General Guidelines

## Principles

- No secrets in git, ever.
- Small commits, clear messages.
- Every feature ships with a minimal test or at least a reproducible manual QA checklist.
- Keep the app usable first, clever second.

## Required tooling

- Node.js: use an LTS version (recommend: latest LTS).
- Package manager: npm (use npm ci in CI).

## Code style rules

- Prefer readable code over “smart” code.
- No huge functions. Split early.
- Keep state local unless shared state is truly necessary.
- Avoid circular dependencies.
- Keep UI components dumb when possible, push logic to hooks/services.

## File organization (recommended)

```
src/
  app/          (app shell, routing if any)
  components/   (reusable UI components)
  features/     (feature modules)
  hooks/        (shared hooks)
  lib/          (helpers, pure utilities)
  styles/
  assets/
```

## Typescript rules

- No "any" unless there is a written reason in a comment.
- Prefer explicit return types for exported functions.
- Use type guards for runtime validation where needed.

## Testing strategy

Minimum:

- Unit tests for pure utilities (color conversion, alpha logic, parsing, transforms).
- One smoke test that the app renders.

Recommended next:

- Component tests for core interactions.
- E2E tests for the primary workflow.

## Security and privacy

- Never commit .env files.
- If using third-party APIs, document:
  - what data is sent
  - why it is sent
  - how users can opt out
- Keep dependencies updated. Prefer Dependabot PRs.

## Performance budget (lightweight)

- No giant images in git without reason.
- Avoid blocking the main thread for long operations, use requestAnimationFrame or a worker if needed.
- Keep bundle size sensible. Add lazy loading if it grows.
