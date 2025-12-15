# Development Guide (Posterama)

This repo is optimized for:
- predictable builds
- safe public sharing
- fast iteration without mystery regressions

## Principles
- No secrets in git, ever.
- Small commits, clear messages.
- Every feature ships with a minimal test or at least a reproducible manual QA checklist.
- Keep the app usable first, clever second.

## Required tooling
- Node.js: use an LTS version (recommend: latest LTS).
- Package manager: npm (use npm ci in CI).

## Setup
1) Install dependencies:
   ```bash
   npm install
   ```
2) Start dev server:
   ```bash
   npm run dev
   ```

## Common scripts
- `npm run dev`: local dev server
- `npm run build`: production build
- `npm run preview`: preview production build locally
- `npm run lint`: lint code (to be added)
- `npm run typecheck`: TypeScript checks without emitting (to be added)
- `npm run test`: unit tests (to be added)

## Branching and commits
- `main` stays deployable.
- Use short-lived branches: `feat/*`, `fix/*`, `chore/*`.
- Commit messages:
  - `feat: add preset manager`
  - `fix: correct alpha handling on export`
  - `docs: add usage guide`
  - `chore: bump deps`

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

## Manual QA checklist (run before pushing to main)
- App loads without console errors.
- Main workflow works end-to-end:
  - import
  - adjust
  - export
- Keyboard/mouse interactions behave (if applicable).
- Works on small viewport and desktop.
- Build succeeds: `npm run build`
- Preview works: `npm run preview`

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

## Releases
1. Update `CHANGELOG.md` with new version and date.
2. Bump version in `package.json`.
3. Commit changes: `git commit -am "chore: release v0.1.0"`
4. Tag the commit: `git tag v0.1.0`
5. Push changes and tags: `git push && git push --tags`
6. Create a GitHub Release from the tag, copying the changelog entry.

