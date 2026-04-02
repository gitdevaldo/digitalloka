# Backend Deployment Security Checklist

Date: 2026-04-02
Scope: Policy drift and authorization safety gates before release

## Required Checks Before Deploy

1. Run DB policy verification command using direct DATABASE_URL access.
2. Confirm all mutating API routes enforce same-origin middleware except explicit external webhook routes.
3. Confirm helper functions exist in public schema: `is_active_user`, `is_admin`, `is_row_owner`.
4. Confirm every required table has policy coverage (minimum 1 policy each).
5. Confirm auth and admin middleware regression tests pass.

## Commands

```bash
php artisan security:verify-db-policies
php artisan test --filter="SameOriginCoverage|AuthMiddlewareRedirect"
```

## Release Gate

Release is blocked if:
- `security:verify-db-policies` exits non-zero
- same-origin coverage test fails
- middleware redirect/auth tests fail
