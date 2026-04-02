<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('payment_events')) {
            return;
        }

        Schema::create('payment_events', function (Blueprint $table): void {
            $table->id();
            $table->string('provider', 60);
            $table->string('event_id')->nullable();
            $table->string('idempotency_key')->unique();
            $table->string('status', 30)->default('received');
            $table->json('payload')->nullable();
            $table->timestampTz('processed_at')->nullable();
            $table->timestampsTz();

            $table->index(['provider', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
    }
};
