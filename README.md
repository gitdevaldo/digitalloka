# Laravel Migration Workspace

This folder contains Phase 1 migration scaffolding for moving DigitalLoka from Next.js to Laravel.

## Current State

- Route parity skeleton is present for auth and droplet endpoints.
- Controller, middleware, request validation, and service boundaries are scaffolded.
- Supabase and DigitalOcean services are placeholder implementations aligned to existing architecture.

## Setup Prerequisites

1. Install PHP 8.2+.
2. Install Composer.
3. From this folder, run:
   - composer install
4. Copy .env.example to .env and fill secrets.

## Immediate Next Tasks

1. Bootstrap a full Laravel app kernel and providers.
2. Wire middleware registration and route loading.
3. Implement real Supabase session/token verification.
4. Implement persistent rate limiting backend.
5. Port UI layer with brand guideline parity from docs/projects/frontend-brand-guidelines.md.
