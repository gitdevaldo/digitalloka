# Project Guidelines

DigitalOcean Panel: A customer-facing dashboard for managing DigitalOcean droplets via API. The active implementation is now Laravel-first, with the previous Next.js app archived for reference.

## Architecture

```
digitalloka/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Auth and droplet route handlers
│   │   ├── Middleware/        # Request-origin and security middleware
│   │   └── Requests/          # Validation request classes
│   ├── Models/                # Eloquent models (users, etc.)
│   └── Services/
│       ├── Auth/              # Supabase auth/session adapter
│       ├── Access/            # Droplet ownership checks
│       └── DigitalOcean/      # DigitalOcean API wrapper
├── config/                    # Service and app configuration
├── database/migrations/       # Laravel migrations
├── routes/
│   ├── api.php                # API route declarations
│   └── web.php                # Web/callback routes
├── docs/
└── .archive/legacy/           # Archived Next.js implementation
```

**Core Flow:**
1. User authenticates via Supabase magic-link flow.
2. Laravel routes/controllers enforce auth and ownership checks.
3. Laravel service layer calls DigitalOcean API through a centralized wrapper.
4. Mutating droplet actions run through validated requests and origin checks.

**Key Entities:**
- `users` — Supabase Auth users
- `droplet_ids` (on `users`) — Assigned droplet IDs used for access control

## Commands

```bash
# Install dependencies
composer install

# Copy environment template
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve

# Run tests (when configured)
php artisan test
```

### Local PHP Path and Supabase DB Access Caution

- Canonical local PHP executable path:
	- `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`
- For live Supabase database inspection, use `DATABASE_URL` direct PostgreSQL access.
- Do not use Supabase service URL or `SUPABASE_SERVICE_ROLE_KEY` for live DB inspection tasks.

## Tech Stack

- **Framework:** Laravel 11+
- **Language:** PHP 8.2+
- **Auth & Database:** Supabase (Auth + PostgreSQL)
- **API:** DigitalOcean API v2
- **HTTP Client:** Laravel HTTP client / Guzzle
- **Frontend/UI:** Laravel-delivered UI following `docs/projects/frontend-brand-guidelines.md`

## Code Conventions

**Type hints:** Use strict typing in PHP classes and explicit validation for all request payloads.

**Brand/UI guideline:** Follow `docs/projects/frontend-brand-guidelines.md` for all UI decisions (typography, color tokens, logo treatment, SVG/icon style, motion, and component patterns).

**API calls:** All DigitalOcean API calls go through `app/Services/DigitalOcean/DigitalOceanService.php`. Never call DO API directly from views/client code.

**Auth:** Use `app/Services/Auth/SupabaseAuthService.php` for session resolution and magic-link initiation.

**Access Control:** Use `app/Services/Access/DropletAccessService.php` for droplet ownership checks.

**Environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side only, for admin operations
- `DIGITALOCEAN_TOKEN` — Server-side only

## Key Constraints

- **Token Security:** Never expose or log Supabase or DigitalOcean secrets.
- **Scoped Access:** Users can ONLY manage droplets assigned to their `droplet_ids`.
- **No Direct DO Panel Access:** All provider calls must be proxied through Laravel services/controllers.
- **Legacy Isolation:** Do not modify `.archive/legacy/` during active development except explicit archive maintenance.

## DigitalOcean API Reference

Key endpoints used:
- `GET /v2/droplets` — List droplets
- `GET /v2/droplets/{id}` — Get droplet details
- `POST /v2/droplets/{id}/actions` — Power on/off, reboot, resize
- `GET /v2/droplets/{id}/actions` — Get action history

API docs: https://docs.digitalocean.com/reference/api/api-reference/

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

Execute EXACTLY the user's instruction. Do not assume next steps, do not start additional work. If asked for information, give it and stop. If asked to delete something, delete ALL of it. Before taking action: "Did the user explicitly ask me to do this?" If no → don't do it.
