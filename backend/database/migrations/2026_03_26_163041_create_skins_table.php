<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skins', function (Blueprint $table) {
            $table->id();
            // Nom de la skin
            $table->string('name')->unique();
            // Preus actuals
            $table->decimal('steam_price', 10, 2)->nullable();
            $table->decimal('dmarket_price', 10, 2)->nullable();
            // Marge i categoria
            $table->decimal('profit_margin', 5, 2)->nullable();
            $table->enum('category', ['Oportunitat rentable', 'Marge baix', 'No recomanable'])->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skins');
    }
};

?>
