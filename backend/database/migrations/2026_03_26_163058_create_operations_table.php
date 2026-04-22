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
            // Relacions amb l'usuari i la skin
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('skin_id')->constrained()->onDelete('cascade');
            
            // Dades de l'operació
            $table->decimal('buy_price', 10, 2);
            $table->decimal('sell_price', 10, 2)->nullable();
            $table->enum('marketplace', ['Steam', 'DMarket']);
            $table->decimal('profit', 10, 2)->nullable();
            
            // Data de la transacció
            $table->timestamp('operation_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operations');
    }
};

?>
