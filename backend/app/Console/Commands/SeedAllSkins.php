<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SeedAllSkins extends Command
{
    // Definició del nom de la comanda per a ser executada a la terminal
    protected $signature = 'market:seed-all-skins';

    // Breu descripció de la funcionalitat per al menú d'ajuda d'Artisan
    protected $description = 'Pobla la BD amb ítems líquids (Armes, Ganivets, Guants, Caixes i Adhesius), ignorant la brossa.';

    public function handle()
    {
        $this->info("Iniciant la lectura del catàleg mestre des del fitxer local...");

        ini_set('memory_limit', '-1');
        // Definim la ruta on s'ha d'ubicar el fitxer JSON descarregat manualment
        $filePath = storage_path('app/items.json');
        
        // Verifiquem si el fitxer existeix realment a la ruta esperada
        if (!File::exists($filePath)) {
            $this->error("❌ No s'ha trobat el fitxer a la ruta: {$filePath}");
            return;
        }

        // Extraiem el contingut de l'arxiu i el transformem en un array de PHP
        $json = File::get($filePath);
        $data = json_decode($json, true);

        // Validem que l'estructura del JSON sigui correcta abans de continuar
        if (!$data || !isset($data['success']) || !$data['success']) {
            $this->error("❌ El fitxer JSON local conté errors de format o està corrupte.");
            return;
        }

        $items = $data['items_list'];
        $skinsToInsert = [];
        $this->info("S'han detectat " . count($items) . " ítems globals. Aplicant els filtres d'inversió...");

        // Llista negra: termes clau d'objectes sense interès comercial o amb volum nul
        $bannedKeywords = [
            'Graffiti', 'Sealed', 'Patch', 'Charm', 'Pin', 'Souvenir', 'Music Kit', 'Pass', 'Sticker'
        ];

        // Recorrem l'array mestre per destriar el gra de la palla
        foreach ($items as $marketHashName => $details) {
            
            $isBanned = false;
            
            // Comprovem si el nom de l'actiu inclou alguna paraula de la llista negra
            foreach ($bannedKeywords as $ban) {
                if (str_contains($marketHashName, $ban)) {
                    $isBanned = true;
                    break; // Parem de buscar tan bon punt trobem una coincidència
                }
            }

            // Si l'ítem supera el filtre, preparem l'estructura per a la base de dades
            if (!$isBanned) {
                $skinsToInsert[] = [
                    'name'          => $marketHashName,
                    'image_url'     => null,
                    'steam_price'   => null,
                    'dmarket_price' => null,
                    'profit_margin' => null,
                    'volume'        => null,
                    'last_updated'  => null, // Essencial perquè l'actualitzador automàtic els processi
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];
            }
        }

        $totalValids = count($skinsToInsert);
        $this->info("✅ Filtre aplicat amb èxit! S'injectaran {$totalValids} actius financers vàlids.");

        // Procés d'inserció a MySQL dividit en paquets de 1000 per no desbordar la memòria
        $chunks = array_chunk($skinsToInsert, 1000);
        $bar = $this->output->createProgressBar(count($chunks));
        $bar->start();

        foreach ($chunks as $chunk) {
            // Utilitzem insertOrIgnore per saltar-nos les excepcions de claus duplicades
            DB::table('skins')->insertOrIgnore($chunk);
            $bar->advance(); // Actualitzem l'estat de la barra de progrés
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("🎉 Base de dades inicialitzada i llesta per al 'trading'!");
    }
}