<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operations', function (Blueprint $table) {
            $table->id();
            // Relació amb l'usuari que fa l'operació
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Relació amb l'ítem específic comprat o venut
            $table->foreignId('user_item_id')->constrained()->onDelete('cascade');
            // Definició del tipus de transacció
            $table->enum('type', ['buy', 'sell']);
            // Quantitat econòmica moguda en la transacció
            $table->decimal('amount', 10, 2);
            // Benefici net (pot ser negatiu en pèrdues, o nul si és una compra)
            $table->decimal('profit', 10, 2)->nullable();
            // Data exacta del registre financer
            $table->timestamp('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operations');
    }
};
