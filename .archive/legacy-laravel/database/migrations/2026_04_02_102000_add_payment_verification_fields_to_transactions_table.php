<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table): void {
            if (!Schema::hasColumn('transactions', 'idempotency_key')) {
                $table->string('idempotency_key')->nullable()->after('provider_ref');
                $table->unique('idempotency_key');
            }

            if (!Schema::hasColumn('transactions', 'verified_at')) {
                $table->timestampTz('verified_at')->nullable()->after('paid_at');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table): void {
            if (Schema::hasColumn('transactions', 'idempotency_key')) {
                $table->dropUnique(['idempotency_key']);
                $table->dropColumn('idempotency_key');
            }

            if (Schema::hasColumn('transactions', 'verified_at')) {
                $table->dropColumn('verified_at');
            }
        });
    }
};
