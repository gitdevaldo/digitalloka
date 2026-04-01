<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('licenses')) {
            return;
        }

        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entitlement_id')->constrained('entitlements')->cascadeOnDelete();
            $table->string('license_key')->unique();
            $table->string('status')->default('active');
            $table->timestampTz('issued_at')->nullable();
            $table->timestampTz('last_validated_at')->nullable();
            $table->timestampTz('revoked_at')->nullable();
            $table->text('revocation_reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestampsTz();

            $table->index(['entitlement_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
