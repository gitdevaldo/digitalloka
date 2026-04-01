# PRD: DigitalLoka Migration from Next.js to Laravel

Date: 2026-04-01
Status: Completed
Owner: Product + Engineering
Target audience: Product, Backend, Frontend, DevOps, QA

## 1. Executive Summary

DigitalLoka currently runs as a Next.js 15 application with Supabase Auth, internal API routes, and a DigitalOcean API wrapper. This PRD defines the product and technical requirements to migrate the application to Laravel while preserving functional behavior, security boundaries, and user experience.

Primary migration goal:
- Replace the current Next.js full-stack runtime with Laravel as the primary backend and web delivery layer.

Non-goal:
- Change business behavior (auth flow, droplet ownership model, action semantics) during the initial migration.

## 2. Current Product Baseline

Current user-facing features to preserve:
- Magic-link login flow.
- Protected dashboard.
- Assigned droplet listing.
- Droplet detail page.
- Droplet actions: power on, power off, shutdown, reboot, power cycle.
- Action history listing.
- UI style system defined in docs/projects/frontend-brand-guidelines.md.

Current security model to preserve:
- Every mutating request enforces same-origin protection.
- Session validation before protected operations.
- Ownership check per droplet-scoped operation.
- Request input validation.
- Typed mapping for provider/rate-limit errors.

## 3. Product Objectives

1. Deliver feature parity with existing production behavior.
2. Maintain or improve security posture.
3. Keep the same visual identity and interaction language.
4. Minimize user-visible downtime and migration risk.
5. Enable long-term maintainability under Laravel conventions.

Success criteria:
- 100% parity for critical user journeys.
- No unauthorized droplet access regression.
- No increase in high-severity incidents during cutover window.

## 4. Scope

### In Scope
- Laravel app bootstrap and environment configuration.
- Auth integration with Supabase (or equivalent token/session bridge strategy).
- Laravel route/controller/service architecture for current APIs.
- DigitalOcean service abstraction in Laravel.
- Dashboard rendering approach under Laravel stack.
- UI migration preserving current brand rules.
- Data-model compatibility with current `users` table and `droplet_ids` access model.
- Observability, logging, error handling, and rate limiting in Laravel.
- Deployment and cutover runbook.

### Out of Scope (Phase 1)
- New end-user features.
- Admin panel implementation.
- Major redesign of UI patterns.
- Changing ownership model from `droplet_ids` to a new relational model (can be Phase 2).

## 5. User Stories

1. As a user, I can sign in using a magic link and get redirected to my dashboard.
2. As a user, I only see droplets assigned to me.
3. As a user, I can open a droplet detail page and view current status and metadata.
4. As a user, I can run supported power actions and receive clear status feedback.
5. As a user, I can view recent action logs for my droplet.

## 6. Functional Requirements

### FR-1 Authentication
- Laravel must support email magic-link authentication flow with secure callback handling.
- Callback must only redirect to safe internal paths.
- Session state must be server-validated before protected routes.

### FR-2 Authorization and Ownership
- Every droplet endpoint must verify user identity.
- Every droplet-scoped operation must enforce ownership using assigned droplet IDs.
- Unauthorized access must return explicit 401/403 responses.

### FR-3 Droplet Read Operations
- List assigned droplets.
- Fetch single droplet detail by ID.
- Fetch droplet actions history.

### FR-4 Droplet Mutating Operations
- Support the exact action set:
  - `power_on`
  - `power_off`
  - `shutdown`
  - `reboot`
  - `power_cycle`
- Mutating endpoints must enforce same-origin/CSRF protection.
- Mutating endpoints must validate payload schema.

### FR-5 Error Contract
- Laravel API responses must keep consistent, user-safe error messages.
- Provider errors (DigitalOcean) and rate-limit errors must be mapped to stable HTTP/status behavior.

### FR-6 UI and Brand Parity
- Visual language must follow docs/projects/frontend-brand-guidelines.md.
- Preserve typography, color tokens, border/shadow language, motion style, and icon conventions.
- Preserve responsive behavior across mobile/tablet/desktop.

## 7. Non-Functional Requirements

### NFR-1 Security
- Do not expose provider secrets in client responses/logs.
- Protect mutating requests with origin/CSRF controls.
- Keep strict server-side ownership checks.

### NFR-2 Performance
- Dashboard initial render target: p95 <= 2.5s on baseline production profile.
- API median latency target (droplet read routes): <= 400ms excluding third-party variance.

### NFR-3 Reliability
- Error handling must be explicit and observable.
- External provider failures must degrade gracefully and preserve clear user messaging.

### NFR-4 Maintainability
- Use clear Laravel layers: routes -> controllers -> services -> adapters.
- Keep provider logic centralized in a DigitalOcean service module.

## 8. Target Architecture (Laravel)

Recommended stack:
- Laravel 11+.
- Blade + Vite + Tailwind (or Inertia with Vue/React if chosen by architecture decision).
- Controllers for HTTP handling.
- Service classes for auth/session/access logic and DigitalOcean integration.
- Middleware for auth/session and request security.

Logical layers:
1. HTTP Layer:
   - Web routes for page rendering.
   - API routes for droplet operations.
2. Middleware Layer:
   - Session/auth middleware.
   - Origin/CSRF middleware for mutating endpoints.
3. Domain/Service Layer:
   - User access service (`validateDropletAccess` equivalent).
   - DigitalOcean service wrapper.
   - Rate-limit service abstraction.
4. Integration Layer:
   - Supabase integration adapter (auth/session/user lookup).
   - DigitalOcean API adapter.

## 9. Data and Integration Requirements

### Database
- Preserve `users` schema compatibility:
  - `id`
  - `email`
  - `droplet_ids`
- No destructive migration in phase 1.

### External Integrations
- Supabase:
  - Auth/session verification strategy documented and implemented.
- DigitalOcean:
  - API token remains server-only.
  - Centralized wrapper with explicit error mapping.

## 10. Security Requirements (Migration-Critical)

1. Enforce auth before protected operations.
2. Enforce droplet ownership for every droplet route.
3. Enforce request origin/CSRF protection for state-changing requests.
4. Validate all request payloads using Laravel validation rules.
5. Do not return raw provider exception internals to end-users.
6. Do not log secrets.

## 11. Migration Strategy

### Phase A: Foundation
- Create Laravel project scaffold.
- Configure env and secure secrets handling.
- Implement base middleware stack.
- Implement Supabase auth/session adapter strategy.

### Phase B: API Parity
- Build Laravel equivalents of existing droplet/auth routes.
- Implement DigitalOcean service wrapper + error mapping.
- Add rate limiting.
- Add automated API parity checks for core routes.

### Phase C: UI Parity
- Rebuild login, dashboard, droplet list/detail, and action log views under Laravel frontend approach.
- Enforce brand guideline parity.
- Validate behavior/motion/responsiveness.

### Phase D: Hardening and Cutover
- Regression testing.
- Security checklist execution.
- Observability checks.
- Gradual traffic cutover and rollback readiness.

## 12. Rollout and Cutover Plan

Cutover model:
- Staging parity sign-off first.
- Production canary deployment (small traffic slice).
- Observe auth failures, droplet action failure rates, and response latency.
- Increase traffic gradually.

Rollback criteria:
- Unauthorized access regression.
- Elevated auth callback/session failure rate.
- Elevated droplet action failure rate due to migration logic.

Rollback mechanism:
- Re-route traffic back to existing Next.js deployment quickly.

## 13. Acceptance Criteria

Product acceptance:
- Login journey passes end-to-end with safe callback behavior.
- Authorized users only see/manage assigned droplets.
- All action endpoints work with expected status behavior.
- UI matches brand guideline and responsive standards.

Engineering acceptance:
- Security checks pass for all droplet routes.
- Error mapping remains consistent and user-safe.
- Observability coverage exists for critical failures.

## 14. Risks and Mitigations

Risk 1: Auth/session mismatch between current Supabase flow and Laravel session model.
- Mitigation: Design and test explicit adapter pattern before UI migration.

Risk 2: Ownership regression during route rewrite.
- Mitigation: Mandatory ownership guard tests for every droplet endpoint.

Risk 3: Provider error leakage.
- Mitigation: Centralized exception mapper in DigitalOcean service layer.

Risk 4: UI parity drift.
- Mitigation: Use docs/projects/frontend-brand-guidelines.md as hard gate in reviews.

Risk 5: Deployment instability during cutover.
- Mitigation: Canary + rollback switch + pre-defined SLO guardrails.

## 15. Open Decisions

1. Frontend rendering strategy in Laravel:
   - Blade only, or Inertia-based SPA hybrid.
2. Supabase auth integration mode:
   - Direct token verification vs delegated session bridge.
3. Rate-limit backend:
   - In-memory baseline vs Redis from day one.

## 16. Delivery Milestones (Proposed)

- M1: Architecture decision + Laravel baseline scaffold.
- M2: Auth/session parity validated in staging.
- M3: Droplet API parity validated.
- M4: UI parity validated against brand guideline.
- M5: Canary and production cutover complete.

## 17. Appendix: Route Parity Matrix (Current -> Target)

- `POST /api/auth/login` -> Laravel auth controller login endpoint.
- `POST /api/auth/logout` -> Laravel auth controller logout endpoint.
- `GET /auth/callback` -> Laravel callback route/controller.
- `GET /api/droplets` -> Laravel droplets index endpoint.
- `GET /api/droplets/{id}` -> Laravel droplets show endpoint.
- `GET /api/droplets/{id}/actions` -> Laravel droplet actions index endpoint.
- `POST /api/droplets/{id}/actions` -> Laravel droplet actions store endpoint.

This PRD authorizes planning and implementation design. It does not authorize dropping existing security controls or changing user-visible behavior without explicit approval.
