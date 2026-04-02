# Project Guidelines

DigitalOcean Panel is a customer-facing dashboard for managing assigned DigitalOcean droplets through proxied API routes. The active codebase is Laravel-first; previous Next.js code is archived.

## Architecture

```text
digitalloka/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Auth and droplet route handlers
│   │   ├── Middleware/        # Request and origin guards
│   │   └── Requests/          # Validation request classes
│   ├── Models/                # Eloquent models
│   └── Services/
│       ├── Auth/              # Supabase auth/session integration
│       ├── Access/            # Droplet ownership checks
│       └── DigitalOcean/      # DigitalOcean API wrapper
├── config/                    # Service configuration
├── database/migrations/       # Laravel DB migrations
├── routes/
│   ├── api.php                # API routes
│   └── web.php                # Callback/web routes
├── docs/
└── .archive/legacy/           # Archived Next.js implementation
└── .github/
    └── copilot-instructions.md
```

Core flow:
1. User authenticates via Supabase Auth.
2. Laravel controllers and middleware validate session/auth context.
3. Droplet ownership is enforced through `users.droplet_ids` checks.
4. API routes enforce origin checks, request validation, and typed errors.
5. All DigitalOcean calls go through `app/Services/DigitalOcean/DigitalOceanService.php`.

## Commands

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start local server
php artisan serve

# Run tests (when configured)
php artisan test
```

If PHP/Composer are missing in local environment, install them first before running Laravel commands.

### Local PHP Path and Supabase DB Access Caution

- Canonical local PHP executable path:
  - `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`
- For live Supabase database inspection, use `DATABASE_URL` direct PostgreSQL access.
- Do not use Supabase service URL or `SUPABASE_SERVICE_ROLE_KEY` for live DB inspection tasks.

## Tech Stack

- Framework: Laravel 11+
- Language: PHP 8.2+
- UI: Laravel-delivered UI following project brand guideline
- Auth and Database: Supabase (SSR + PostgreSQL)
- API Provider: DigitalOcean API v2
- Validation: Laravel request validation

## Code Conventions

 - Use strict PHP typing and explicit request validation.
- Follow `docs/projects/frontend-brand-guidelines.md` for all frontend/UI work (style, typography, color, logo, SVG/iconography, motion, and elements).
- Keep DigitalOcean API access server-side only via `app/Services/DigitalOcean/DigitalOceanService.php`.
- Use service boundaries:
  - Auth/session: `app/Services/Auth/SupabaseAuthService.php`
  - Access checks: `app/Services/Access/DropletAccessService.php`
  - Provider calls: `app/Services/DigitalOcean/DigitalOceanService.php`
- In API routes, enforce this order:
  1. Origin check for mutating requests (`isSameOrigin`)
  2. Session/auth check via Supabase auth service
  3. Ownership check via `DropletAccessService`
  4. Input validation via Laravel request rules
  5. Action execution + typed error mapping

## Security Requirements

- Never expose or log secrets.
- Required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DIGITALOCEAN_TOKEN`
- Enforce droplet access control on every droplet endpoint.
- Keep same-origin checks on state-changing API routes.
- Treat `.archive/legacy/` as read-only historical reference unless explicitly asked to modify archives.

---

## Agent Behaviour

### Context Recovery After Compaction (MANDATORY)

When context is compacted, recover full context BEFORE continuing:

1. Check auto-memory at `~/.claude/projects/c--Users-Administrator-Desktop-indexnow-dev/memory/`
2. Use claude-mem MCP tools (`search`, `timeline`, `get_observations`) if available
3. Read JSONL transcript at `~/.claude/projects/*/[session-id].jsonl` for specific details
4. NEVER rely solely on compacted summary. Do NOT ask the user to repeat information discussed earlier.

### Git Commit Scope Rules

- Commit and push after every change, including small changes.
- **Before every push**, run `git status` and `git diff` to check for user changes in the working tree.
- Stage files explicitly; do not use broad staging that can include secrets or generated files.
- Exclude `__pycache__/`, `*.pyc`, `node_modules/`, `.next/`, `dist/` unless explicitly asked.
- Use Conventional Commits with proper type, scope, and description.

### Planning Rule

For non-trivial tasks (3+ steps or architectural decisions), write a comprehensive markdown plan with step-by-step tasks, goals, and acceptance criteria. Store plans in `docs/plans/`. Do not execute code until explicitly told to implement.

### Change Log Rules

For every implementation/change, update `docs/log/log-changes.md` before commit/push. Each log entry must include:

- `Date time`
- `Short description`
- `What you do`
- `File path that changes`

Log entries appended in reverse-chronological order (newest first).

### Verification Before Done

Never mark a task complete without proving it works. Run `python -m compileall main.py core`, check for errors, demonstrate correctness.

### No Lazy Fixes

- Always find and fix root causes. Never apply temporary workarounds or band-aids.
- When fixing a file, check all other files that import from or depend on the changed code. Trace the full impact.
- Senior developer standards: would a staff engineer approve this change?

### Simplicity & Minimal Impact

- Make every change as simple as possible. Minimal code impact.
- Changes touch only what's necessary. Avoid introducing bugs.
- When changing shared code (`core/`), verify all consumer modules still work.

### Self-Improvement Loop

After ANY correction from the user, save the lesson to `.claude/lessons/lessons.md` and `.github/lessons.md`. Review lessons at session start. Never repeat the same mistake.

### Workflow Orchestration

- **Plan Mode**: Enter plan mode for any non-trivial task. If something goes sideways, STOP and re-plan immediately.
- **Subagent Strategy**: Use subagents for research, exploration, and parallel analysis. One task per subagent. Keep main context window clean.
- **Autonomous Bug Fixing**: When given a bug report, just fix it. Point at logs/errors/failing tests, then resolve. Zero hand-holding required.
- **Demand Elegance (Balanced)**: For non-trivial changes, pause and consider if there's a more elegant approach. Skip for simple, obvious fixes — don't over-engineer.

### Generated Documents

All generated markdown documents must go to the correct docs subdirectory based on document type, with descriptive filenames (date prefix when relevant):

- PRDs: `docs/prds/`
- Plans: `docs/plans/`
- Audits: `docs/audits/`
- Issues and bug reports: `docs/issues/`

---

## Lessons & Principles (Mandatory)

These are hard-won rules from past mistakes. Each is a PRINCIPLE to follow — violating any is a blocking issue.

### Principle 1: Verify Actual Call Chains — Don't Trust Code Is Wired Up

Before modifying or relying on any module, VERIFY it has actual callers. Grep for imports and function calls across all files. Zero callers = dead code. Flag it.

### Principle 2: Never Destroy Git History

Never create root commits on repos with existing history. Never force-push without verifying local history includes all remote commits. Before ANY push: `git fetch origin && git log origin/main --oneline -5`. Default to `git pull --rebase origin main`.

### Principle 3: Dead Code Cleanup Must Be Complete

When removing a feature, remove ALL traces — types, imports, config references, route files. No orphaned code.

### Principle 4: Never Defer Implementation Tasks — Only Defer Live Testing

Complete ALL implementation tasks. Never defer code changes to "a separate cleanup PR" or "later." The only deferrable tasks are those requiring a running deployment (live/E2E testing).

### Principle 5: Commit + Push Is ONE Atomic Action Chain

After committing, ALWAYS immediately push. Never stop after `git commit`. Full chain: `git commit` → `git push`.

### Principle 6: When Unsure, ASK — Never Guess and Change Code

If not 100% certain which element or issue the user means, ASK before making code changes. Never guess, assume, or make speculative changes. One wrong guess wastes time and erodes trust.

### Principle 7: Do Exactly What Is Asked — No Assumptions, No Extra Steps

Execute EXACTLY the user's instruction. Do not assume next steps, do not start additional work. If asked for information, give it and stop. If asked to delete something, delete ALL of it. Before taking action: "Did the user explicitly ask me to do this?" If no -> don't do it.
