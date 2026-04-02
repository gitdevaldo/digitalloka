# Auth and Provider Observability Runbook

Date: 2026-04-02

## Auth Failure Logs

Event name: `supabase_auth_user_lookup_failed`

Fields:
- `status`
- `path`
- `has_cookie_token`
- `has_bearer_token`

Use this event to diagnose session/token mismatch issues.

## DigitalOcean Correlated Logs

Events:
- `digitalocean_request`
- `digitalocean_request_failed`

Fields:
- `correlation_id`
- `method`
- `endpoint`
- `status`
- `message` (failed only)

Use `correlation_id` to trace provider failures across request lifecycle.

## Immediate Triage Steps

1. Check auth warning logs for token source mismatch.
2. Check DigitalOcean failure logs and group by `correlation_id`.
3. Confirm same-origin failures are not mistaken for provider outages.
4. Re-run policy verification command if access behavior appears inconsistent.
