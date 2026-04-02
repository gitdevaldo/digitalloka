# Supabase RLS/RBAC Runbook

Date: 2026-04-02
Owner: GitHub Copilot

## Objective

Apply and verify DB-layer hardening for Supabase Postgres using a repeatable script set.

## Artifacts

- Migration script: `docs/sql/2026-04-02-supabase-rls-rbac.sql`
- Verification script: `docs/sql/2026-04-02-supabase-rls-rbac-verify.sql`
- Policy matrix: `docs/audits/2026-04-02-supabase-policy-matrix.md`

## Execution Order

1. Confirm `DATABASE_URL` is set in shell environment.
2. Apply migration SQL script to the target Supabase database.
3. Run verification SQL script.
4. Capture outputs for:
   - RLS flags (`relrowsecurity`)
   - policy inventory and command coverage
   - grants matrix for `anon` and `authenticated`
5. Perform app-level regression checks for catalog, user, and admin paths.

## Commands Used

```powershell
python -c "import os, pathlib, psycopg; sql=pathlib.Path('docs/sql/2026-04-02-supabase-rls-rbac.sql').read_text(encoding='utf-8'); conn=psycopg.connect(os.environ['DATABASE_URL']); conn.autocommit=True; cur=conn.cursor(); cur.execute(sql); cur.close(); conn.close()"

python -c "import os, pathlib, psycopg; sql=pathlib.Path('docs/sql/2026-04-02-supabase-rls-rbac-verify.sql').read_text(encoding='utf-8'); conn=psycopg.connect(os.environ['DATABASE_URL']); conn.autocommit=True; cur=conn.cursor(); cur.execute(sql); cur.close(); conn.close()"
```

## Rollback Strategy

1. Drop newly created policies from affected tables.
2. Recreate previous policy set if a backup exists.
3. Revert grants for `anon` and `authenticated` to previous matrix.
4. Disable RLS on specific table(s) only as emergency rollback (temporary) while preparing corrected policy set.
5. Re-run verification script and confirm expected rollback state.

## Validation Checklist

- All target tables report `relrowsecurity = true`.
- `pg_policies` contains expected user/admin policy coverage.
- Unauthorized actor paths are denied by policy.
- Admin actor paths are allowed for protected operations.
- No secrets are logged in repository artifacts.
