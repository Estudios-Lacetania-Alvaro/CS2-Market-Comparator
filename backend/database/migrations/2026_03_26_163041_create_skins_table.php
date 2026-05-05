<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Execució de les migracions per a la creació de l'esquema.
     */
    public function up(): void
    {
        // Creació de la taula 'skins' amb l'estructura requerida per al comparador
        Schema::create('skins', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Denominació oficial de la skin (clau única)
            $table->string('image_url')->nullable(); // URL de la imatge de la skin
            
            // Atributs de preus i mètriques de rendibilitat
            $table->decimal('steam_price', 10, 2)->nullable(); // Preu de mercat a Steam (USD)
            $table->decimal('dmarket_price', 10, 2)->nullable(); // Preu de mercat a DMarket (USD)
            $table->decimal('profit_margin', 5, 2)->nullable(); // Percentatge de rendibilitat calculat
            
            $table->integer('volume')->nullable(); // Volum de transaccions registrat a Steam
            $table->timestamp('last_updated')->nullable(); // Registre temporal de l'última actualització de preus
            $table->timestamps();
        });
    }

    /**
     * Reversió de les migracions.
     */
    public function down(): void
    {
        // Eliminació de la taula 'skins' en cas de revertir la migració
        Schema::dropIfExists('skins');
    }
};