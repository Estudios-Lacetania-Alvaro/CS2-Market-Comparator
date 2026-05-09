<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skins', function (Blueprint $table) {
            // Canviem el tipus de columna a 'text' per permetre URLs infinites de Steam
            $table->text('image_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('skins', function (Blueprint $table) {
            // Reversió a string clàssic de 255 caràcters
            $table->string('image_url', 255)->nullable()->change();
        });
    }
};