# Integration Test Matrix

Date: 2026-04-02

## Endpoint Families

| Family | Critical Endpoints | Coverage Type | Status |
|---|---|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/session`, web auth middleware redirects | Feature tests | Implemented |
| Catalog | `GET /api/products`, `GET /api/products/{slug}` | Feature tests + smoke | Implemented |
| User Products | `POST /api/user/products/{id}/actions`, `GET /api/user/products/{id}/actions/{actionId}` | Feature tests | Implemented |
| User Orders/Checkout | `GET /api/user/orders`, `POST /api/user/checkout` | Existing + follow-up needed | Partial |
| Admin Orders | `PUT /api/admin/orders/{id}/status` | Feature tests with audit assertions | Implemented |
| Admin Settings | `PUT /api/admin/settings` | Validation test | Implemented |
| Payments | `POST /api/payments/webhook` | Feature tests (signature + idempotency) | Implemented |
| Security | mutating route same-origin middleware | Coverage test + deployment checklist | Implemented |

## Required CI Suite

```bash
php artisan test --filter="Auth|UserProductActionQueue|AdminAuditCoverage|PaymentWebhookAndEntitlementExpiry|SameOriginCoverage|SmokeIntegrationFlows"
```

## Follow-up Tests

- Expand end-to-end checkout -> payment -> entitlement assertions with multiple items and currencies.
- Add admin filters matrix tests for users/orders/entitlements listing.
