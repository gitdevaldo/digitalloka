<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('transactions')) {
            return;
        }

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('provider')->default('manual');
            $table->string('provider_ref')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('IDR');
            $table->timestampTz('paid_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestampsTz();

            $table->index(['order_id', 'status']);
            $table->index(['provider', 'provider_ref']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
