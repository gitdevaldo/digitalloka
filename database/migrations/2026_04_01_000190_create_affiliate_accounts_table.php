<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('affiliate_accounts')) {
            return;
        }

        Schema::create('affiliate_accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('code')->unique();
            $table->string('status')->default('active');
            $table->decimal('default_commission_rate', 5, 2)->default(0);
            $table->json('meta')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_accounts');
    }
};
