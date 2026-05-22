<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dmarket_items', function (Blueprint $table) {
            $table->id();
            // Relació amb la taula de skins (el catàleg)
            $table->foreignId('skin_id')->constrained()->onDelete('cascade');
            
            // Dades específiques de l'oferta a DMarket
            $table->string('item_id')->unique(); // ID propi de DMarket
            $table->decimal('price', 10, 2);
            $table->float('float_value')->nullable(); // El desgast exacte de l'arma
            $table->string('inspect_link')->nullable(); // Enllaç per veure-la in-game
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dmarket_items');
    }
};
