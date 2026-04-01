# Change Log

## 2026-04-01 00:00
- Short description: Relocated Laravel project from `laravel/` subdirectory to repository root.
- What you do:
  - Moved all Laravel runtime files and directories to root (`app/`, `routes/`, `config/`, `database/`, `composer.json`, `.env.example`, `README.md`).
  - Removed old nested `laravel/` path references by moving file structure instead of duplicating content.
- File path that changes:
  - `app/` (moved)
  - `routes/` (moved)
  - `config/` (moved)
  - `database/` (moved)
  - `composer.json` (moved)
  - `.env.example` (moved)
  - `README.md` (moved)
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Completed Laravel service/controller implementation slice and archived Next.js legacy code.
- What you do:
  - Implemented Supabase magic-link initiation and session user resolution service logic.
  - Implemented database-backed droplet access checks using `users.droplet_ids`.
  - Implemented DigitalOcean API integration methods and controller-level error mapping.
  - Added base Laravel model/controller and initial users migration.
  - Archived Next.js app/config and legacy docs into `.archive/legacy/` with archive README.
  - Expanded `.gitignore` with Laravel runtime artifacts.
- File path that changes:
  - `laravel/app/Services/Auth/SupabaseAuthService.php`
  - `laravel/app/Services/Access/DropletAccessService.php`
  - `laravel/app/Services/DigitalOcean/DigitalOceanService.php`
  - `laravel/app/Http/Controllers/Auth/LoginController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletActionController.php`
  - `laravel/app/Http/Controllers/Controller.php`
  - `laravel/app/Models/User.php`
  - `laravel/database/migrations/2026_04_01_000000_create_users_table.php`
  - `.archive/legacy/README.md`
  - `.archive/legacy/src/` (moved)
  - `.archive/legacy/next.config.js` (moved)
  - `.archive/legacy/package.json` (moved)
  - `.archive/legacy/package-lock.json` (moved)
  - `.archive/legacy/postcss.config.js` (moved)
  - `.archive/legacy/tailwind.config.ts` (moved)
  - `.archive/legacy/tsconfig.json` (moved)
  - `.archive/legacy/dashboard.html` (moved)
  - `.archive/legacy/prd.md` (moved)
  - `.gitignore`
  - `docs/plans/2026-04-01-laravel-migration-implementation-plan.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Implemented Laravel migration Phase 1 scaffold with route and service parity skeleton.
- What you do:
  - Created a Laravel workspace scaffold under `laravel/` including composer metadata, env template, service config, route definitions, middleware, request validation, controllers, and service boundaries.
  - Added migration implementation plan for phased execution under `docs/plans/`.
  - Added setup and next-step notes for enabling runnable Laravel bootstrap once PHP/Composer are available.
- File path that changes:
  - `docs/plans/2026-04-01-laravel-migration-implementation-plan.md`
  - `laravel/README.md`
  - `laravel/composer.json`
  - `laravel/.env.example`
  - `laravel/config/services.php`
  - `laravel/routes/api.php`
  - `laravel/routes/web.php`
  - `laravel/app/Http/Middleware/EnsureSameOrigin.php`
  - `laravel/app/Http/Requests/StoreDropletActionRequest.php`
  - `laravel/app/Http/Controllers/Auth/LoginController.php`
  - `laravel/app/Http/Controllers/Auth/LogoutController.php`
  - `laravel/app/Http/Controllers/Auth/CallbackController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletActionController.php`
  - `laravel/app/Services/Auth/SupabaseAuthService.php`
  - `laravel/app/Services/Access/DropletAccessService.php`
  - `laravel/app/Services/DigitalOcean/DigitalOceanService.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added explicit post-edit workflow mistakes and enforcement rules to lessons files.
- What you do:
  - Appended a concrete mistake entry describing missed post-edit chain execution.
  - Added enforcement rules requiring verification, changelog, status/diff review, explicit staging, commit, and push.
- File path that changes:
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added PRD for migrating DigitalLoka from Next.js to Laravel.
- What you do:
  - Created a detailed migration PRD covering scope, objectives, functional and non-functional requirements, target Laravel architecture, phased migration plan, cutover strategy, acceptance criteria, risks, and route parity.
- File path that changes:
  - `docs/prds/2026-04-01-laravel-migration-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Normalize instruction sources, add frontend brand guideline, and align behavior rules/lesson paths.
- What you do:
  - Replaced conflicting IDE instruction file usage and kept canonical workspace instruction file in `.github/copilot-instructions.md`.
  - Updated instruction behavior rules for generated-doc directories and self-improvement lesson paths.
  - Added comprehensive UI brand guideline document based on implemented frontend style system.
  - Added lessons tracking files required by instruction rules.
- File path that changes:
  - `.claude/CLAUDE.md`
  - `.github/copilot-instructions.md`
  - `.github/copilot-instructions-ide.md` (deleted)
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/projects/frontend-brand-guidelines.md`
  - `docs/log/log-changes.md`
