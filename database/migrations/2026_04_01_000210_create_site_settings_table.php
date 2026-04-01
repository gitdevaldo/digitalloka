<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('site_settings')) {
            return;
        }

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_group');
            $table->string('setting_key')->unique();
            $table->json('setting_value')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestampsTz();

            $table->index(['setting_group', 'setting_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
