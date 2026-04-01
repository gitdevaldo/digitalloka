<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('affiliate_referrals')) {
            return;
        }

        Schema::create('affiliate_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_account_id')->constrained('affiliate_accounts')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->uuid('referred_user_id')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('IDR');
            $table->timestampTz('converted_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestampsTz();

            $table->foreign('referred_user_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['affiliate_account_id', 'status']);
            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_referrals');
    }
};
