<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('user_product_actions')) {
            return;
        }

        Schema::create('user_product_actions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('action', 50);
            $table->string('status', 30)->default('queued');
            $table->json('request_payload')->nullable();
            $table->json('result_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'product_id']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_product_actions');
    }
};
