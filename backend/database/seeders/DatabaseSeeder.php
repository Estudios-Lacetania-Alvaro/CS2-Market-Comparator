<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Execució dels seeders de l'aplicació.
     */
    public function run(): void
    {
        // Generació d'un usuari de prova per a l'entorn de desenvolupament
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Crida als seeders específics per a la càrrega de dades de negoci
        $this->call([
            SkinSeeder::class, // Càrrega del catàleg inicial de skins
        ]);
    }
}