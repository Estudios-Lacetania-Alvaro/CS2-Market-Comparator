<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_histories', function (Blueprint $table) {
            $table->id();
            // Clau forana que connecta amb la taula skins
            $table->foreignId('skin_id')->constrained()->onDelete('cascade');
            
            // Preus en el moment de la captura
            $table->decimal('steam_price', 10, 2)->nullable();
            $table->decimal('dmarket_price', 10, 2)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_histories');
    }
};

?>
