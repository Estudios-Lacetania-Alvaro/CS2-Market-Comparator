<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_items', function (Blueprint $table) {
            $table->id();
            // Relació directa amb l'usuari (si s'esborra l'usuari, s'esborra el seu inventari)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Relació amb el catàleg mestre de skins
            $table->foreignId('skin_id')->constrained()->onDelete('cascade');
            // Preu d'adquisició per calcular futurs beneficis
            $table->decimal('purchase_price', 10, 2);
            // Estat actual de l'ítem (owned = a l'inventari, sold = ja venut)
            $table->enum('status', ['owned', 'sold'])->default('owned');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_items');
    }
};
