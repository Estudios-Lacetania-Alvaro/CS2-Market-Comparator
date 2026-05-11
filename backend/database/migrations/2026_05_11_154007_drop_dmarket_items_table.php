<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Elimina la taula dmarket_items ja que el projecte canvia el seu enfocament 
     * cap a un gestor de portafoli (Smart Ledger).
     */
    public function up(): void
    {
        Schema::dropIfExists('dmarket_items');
    }

    /**
     * En cas de reversió, no recreem la taula per evitar inconsistències 
     * amb el nou model de negoci.
     */
    public function down(): void
    {
        // Operació buida
    }
};