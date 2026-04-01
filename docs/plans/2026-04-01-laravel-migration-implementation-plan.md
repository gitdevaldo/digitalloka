# Laravel Migration Implementation Plan

Date: 2026-04-01
Status: In Progress

## Goal

Implement the first executable migration slice from Next.js to Laravel by creating a Laravel application skeleton with route/controller/service parity for auth and droplet flows.

## Constraints

- Current workspace lacks PHP and Composer, so framework bootstrap commands cannot run here.
- Implementation will be a migration-ready Laravel code structure that is source-controlled now and executable after PHP/Composer installation.

## Scope (Phase 1)

1. Create Laravel workspace folder and baseline project structure.
2. Add composer and environment template files.
3. Add route parity skeleton:
   - auth login/logout
   - auth callback
   - droplets index/show
   - droplet actions index/store
4. Add service-layer parity skeleton:
   - Supabase auth/session adapter
   - droplet ownership guard
   - DigitalOcean API wrapper
5. Add middleware placeholders:
   - same-origin check for mutating routes
   - auth session requirement
6. Add migration notes for local setup and next implementation steps.
7. Archive legacy Next.js implementation into `.archive/legacy` with reference README.

## Acceptance Criteria

- Laravel folder structure exists with coherent namespaces.
- Every current critical API route has Laravel route and controller placeholder.
- Service classes represent current architecture boundaries (auth, access, provider).
- Environment keys align with current project secret model.
- Documentation explains what remains to make it runnable.

## Next Phases

- Phase 2: Install PHP/Composer, run Laravel bootstrap, and wire real framework kernel/config.
- Phase 3: Implement real Supabase token verification and session bridge.
- Phase 4: Implement full frontend parity in Laravel rendering stack.
