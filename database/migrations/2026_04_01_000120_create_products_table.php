<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('products')) {
            return;
        }

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('product_type')->default('digital');
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->string('status')->default('available');
            $table->boolean('is_visible')->default(true);
            $table->json('faq_items')->nullable();
            $table->timestampsTz();

            $table->index(['category_id', 'status']);
            $table->index(['is_visible', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
