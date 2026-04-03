<?php

use App\Models\Entitlement;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('entitlements:expire', function () {
    $updated = Entitlement::query()
        ->where('status', 'active')
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->update([
            'status' => 'expired',
            'updated_at' => now(),
        ]);

    $this->info('Expired entitlements updated: ' . $updated);
})->purpose('Mark active entitlements as expired when expires_at has passed');

Artisan::command('security:verify-db-policies', function () {
    $databaseUrl = (string) env('DATABASE_URL', '');
    if ($databaseUrl === '') {
        $this->error('DATABASE_URL is required');

        return 1;
    }

    $parts = parse_url($databaseUrl);
    if (!is_array($parts)) {
        $this->error('Invalid DATABASE_URL format');

        return 1;
    }

    parse_str((string) ($parts['query'] ?? ''), $queryParams);
    $host = (string) ($parts['host'] ?? '');
    $port = (int) ($parts['port'] ?? 5432);
    $db = ltrim((string) ($parts['path'] ?? ''), '/');
    $user = rawurldecode((string) ($parts['user'] ?? ''));
    $pass = rawurldecode((string) ($parts['pass'] ?? ''));
    $sslmode = (string) ($queryParams['sslmode'] ?? 'require');

    $dsn = "pgsql:host={$host};port={$port};dbname={$db};sslmode={$sslmode}";

    try {
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (Throwable $e) {
        $this->error('DB connection failed: ' . $e->getMessage());

        return 1;
    }

    $requiredTables = [
        'users',
        'product_categories',
        'products',
        'product_prices',
        'orders',
        'order_items',
        'transactions',
        'entitlements',
        'site_settings',
        'audit_logs',
    ];

    $tableRows = $pdo->query("select tablename from pg_tables where schemaname='public'")->fetchAll(PDO::FETCH_COLUMN);
    $missingTables = array_values(array_diff($requiredTables, $tableRows));

    $rlsCount = (int) $pdo->query("select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity = true")->fetchColumn();
    $policyRows = $pdo->query("select tablename, count(*) as c from pg_policies where schemaname='public' group by tablename")->fetchAll(PDO::FETCH_ASSOC);
    $policyMap = [];
    foreach ($policyRows as $row) {
        $policyMap[(string) $row['tablename']] = (int) $row['c'];
    }

    $requiredFuncs = ['is_active_user', 'is_admin', 'is_row_owner'];
    $funcRows = $pdo->query("select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public'")->fetchAll(PDO::FETCH_COLUMN);
    $missingFuncs = array_values(array_diff($requiredFuncs, $funcRows));

    $this->line('RLS enabled tables: ' . $rlsCount);
    $this->line('Missing required tables: ' . count($missingTables));
    if ($missingTables !== []) {
        $this->line(' - ' . implode(', ', $missingTables));
    }

    foreach ($requiredTables as $table) {
        $this->line('Policies[' . $table . ']: ' . (string) ($policyMap[$table] ?? 0));
    }

    if ($missingFuncs !== []) {
        $this->line('Missing helper functions: ' . implode(', ', $missingFuncs));
    }

    $hasPolicyGaps = false;
    foreach ($requiredTables as $table) {
        if (($policyMap[$table] ?? 0) < 1) {
            $hasPolicyGaps = true;
            break;
        }
    }

    if ($missingTables !== [] || $missingFuncs !== [] || $hasPolicyGaps) {
        $this->error('Policy verification failed');

        return 1;
    }

    $this->info('Policy verification passed');

    return 0;
})->purpose('Verify Supabase RLS/policies/helper functions using DATABASE_URL');

Schedule::command('entitlements:expire')->hourly();
