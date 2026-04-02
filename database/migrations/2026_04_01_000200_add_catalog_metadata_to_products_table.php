<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0)->after('is_visible');
            }

            if (!Schema::hasColumn('products', 'reviews_count')) {
                $table->unsignedInteger('reviews_count')->default(0)->after('rating');
            }

            if (!Schema::hasColumn('products', 'tags')) {
                $table->json('tags')->nullable()->after('reviews_count');
            }

            if (!Schema::hasColumn('products', 'badges')) {
                $table->json('badges')->nullable()->after('tags');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $dropColumns = [];

            if (Schema::hasColumn('products', 'badges')) {
                $dropColumns[] = 'badges';
            }
            if (Schema::hasColumn('products', 'tags')) {
                $dropColumns[] = 'tags';
            }
            if (Schema::hasColumn('products', 'reviews_count')) {
                $dropColumns[] = 'reviews_count';
            }
            if (Schema::hasColumn('products', 'rating')) {
                $dropColumns[] = 'rating';
            }

            if ($dropColumns !== []) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};
