<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Afegim el capital disponible de l'usuari amb valor per defecte 0
            $table->decimal('balance', 10, 2)->default(0.00)->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Eliminem el camp si desfem la migració
            $table->dropColumn('balance');
        });
    }
};

?>
