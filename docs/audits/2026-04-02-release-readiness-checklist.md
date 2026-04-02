# Release Readiness Checklist

Date: 2026-04-02

## Functional Gates

- [ ] Auth login/session/callback flow validated
- [ ] User product action queue processing validated
- [ ] Admin order/status and audit coverage validated
- [ ] Payment webhook verification and idempotency validated
- [ ] Entitlement expiration command validated

## Security Gates

- [ ] `php artisan security:verify-db-policies` exits 0
- [ ] same-origin coverage test passes
- [ ] no secret values in logs or responses

## Operational Gates

- [ ] Auth/provider runbook published
- [ ] Correlation ID logs visible for DigitalOcean requests
- [ ] Alerting rules configured for auth/provider error spikes

## Test Gates

- [ ] Required feature tests pass in CI
- [ ] Smoke integration tests pass

## Rollback Notes

- Revert latest deployment commit.
- Re-run migration rollback only if schema changes are the root cause.
- Re-run policy verification after rollback.
