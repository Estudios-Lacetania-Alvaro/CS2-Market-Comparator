<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skin;

class SkinSeeder extends Seeder
{
    /**
     * Execució de la càrrega inicial del catàleg de skins.
     */
    public function run(): void
    {
        // Definició del llistat de skins amb alta liquiditat i elevat volum de mercat
        $liquidSkins = [
            // Categoria: Rifles AK-47
            'AK-47 | Redline (Field-Tested)',
            'AK-47 | Slate (Field-Tested)',
            'AK-47 | Bloodsport (Field-Tested)',
            'AK-47 | Asiimov (Field-Tested)',
            'AK-47 | Frontside Misty (Field-Tested)',
            'AK-47 | Neon Rider (Minimal Wear)',
            'AK-47 | The Empress (Field-Tested)',
            'AK-47 | Legion of Anubis (Field-Tested)',
            'AK-47 | Ice Coaled (Field-Tested)',

            // Categoria: Rifles M4A1-S
            'M4A1-S | Printstream (Field-Tested)',
            'M4A1-S | Decimator (Field-Tested)',
            'M4A1-S | Nightmare (Field-Tested)',
            'M4A1-S | Player Two (Field-Tested)',
            'M4A1-S | Cyrex (Factory New)',
            'M4A1-S | Mecha Industries (Field-Tested)',
            'M4A1-S | Leaded Glass (Field-Tested)',

            // Categoria: Rifles M4A4
            'M4A4 | The Emperor (Field-Tested)',
            'M4A4 | Neo-Noir (Field-Tested)',
            'M4A4 | Asiimov (Field-Tested)',
            'M4A4 | Desolate Space (Field-Tested)',
            'M4A4 | In Living Color (Field-Tested)',
            'M4A4 | Spider Lily (Field-Tested)',

            // Categoria: Rifles de precisió AWP
            'AWP | Asiimov (Field-Tested)',
            'AWP | Redline (Field-Tested)',
            'AWP | Atheris (Field-Tested)',
            'AWP | Neo-Noir (Field-Tested)',
            'AWP | Mortis (Field-Tested)',
            'AWP | Wildfire (Field-Tested)',
            'AWP | Chromatic Aberration (Field-Tested)',

            // Categoria: Pistoles
            'USP-S | Kill Confirmed (Field-Tested)',
            'USP-S | Cortex (Field-Tested)',
            'USP-S | Neo-Noir (Field-Tested)',
            'USP-S | Orion (Factory New)',
            'USP-S | Ticket to Hell (Factory New)',
            'Glock-18 | Water Elemental (Field-Tested)',
            'Glock-18 | Moonrise (Factory New)',
            'Glock-18 | Vogue (Field-Tested)',
            'Desert Eagle | Printstream (Field-Tested)',
            'Desert Eagle | Mecha Industries (Field-Tested)',
            'Desert Eagle | Conspiracy (Factory New)',

            // Categoria: Ganivets i Guants (Alta gamma)
            '★ Karambit | Doppler (Factory New)',
            '★ Butterfly Knife | Doppler (Factory New)',
            '★ M9 Bayonet | Doppler (Factory New)',
            '★ Specialist Gloves | Crimson Web (Field-Tested)',
            '★ Sport Gloves | Vice (Field-Tested)'
        ];

        // Processament i inserció de dades a la base de dades
        foreach ($liquidSkins as $skinName) {
            // Verificació d'existència prèvia per evitar duplicats i creació del registre si s'escau
            Skin::firstOrCreate(
                ['name' => $skinName],
                [
                    'steam_price' => null,
                    'dmarket_price' => null,
                    'profit_margin' => null,
                ]
            );
        }
    }
}