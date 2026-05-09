<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Skin;
use App\Models\PriceHistory;
use App\Services\MarketApiService;
use Carbon\Carbon;

class SyncSkinLowestPrices extends Command
{
    // Nom de la comanda per a l'execució a la terminal
    protected $signature = 'market:sync-skins-lowest-prices';

    // Descripció de la comanda per a la llista d'ajuda de Laravel
    protected $description = 'Sincronització de preus de Steam i DMarket per a la llista de skins de la base de dades';

    public function handle(MarketApiService $marketApi)
    {
        // Selecció de skins de la base de dades ordenades per data d'actualització
        // Es prioritzen els registres més antics o aquells que no han estat processats (null)
        $targetSkins = Skin::orderBy('last_updated', 'asc')->limit(45)->get();
        $this->info("Iniciant sincronització de " . $targetSkins->count() . " skins des de la BD...");

        // Iteració sobre la llista de skins per a l'actualització de preus
        foreach ($targetSkins as $skin) {
            $skinName = $skin->name; // Extracció del nom del registre actual
            $this->line("Processant: {$skinName}...");

            // Ús del servei centralitzat per a la consulta d'APIs externes
            $steamData = $marketApi->getSteamData($skinName);
            $dmarketData = $marketApi->getDMarketData($skinName);

            // Avaluació condicional de mètriques per a la persistència de dades
            if ($steamData['price'] && $dmarketData['price']) {
                // Càlcul de la rendibilitat percentual
                $profitMargin = round((($steamData['price'] - $dmarketData['price']) / $dmarketData['price']) * 100, 2);
                
                $updatedSkin = Skin::updateOrCreate(
                    ['name' => $skinName],
                    [
                        'image_url' => $dmarketData['image'],
                        'steam_price' => $steamData['price'],
                        'dmarket_price' => $dmarketData['price'],
                        'profit_margin' => $profitMargin,
                        'volume' => $steamData['volume'],
                        'last_updated' => Carbon::now()
                    ]
                );

                // --- INICI DEL PILOT AUTOMÀTIC (FASE 6) ---
                // Inserció directa a la taula de l'historial per crear punts a la gràfica
                PriceHistory::create([
                    'skin_id'       => $updatedSkin->id,
                    'steam_price'   => $steamData['price'],
                    'dmarket_price' => $dmarketData['price'],
                    'created_at'    => Carbon::now(),
                    'updated_at'    => Carbon::now(),
                ]);
                // --- FI DEL PILOT AUTOMÀTIC ---

                $this->info("✅ Actualitzat: Steam: {$steamData['price']} | DMarket: {$dmarketData['price']} | Marge: {$profitMargin}%");
            } else {
                // Registre d'error en cas que alguna de les APIs no retorni dades vàlides
                $this->error("❌ No s'han pogut obtenir preus per a: {$skinName}");
            }

            // Pausa de seguretat per evitar limitacions per ràtio de peticions (Rate Limiting)
            sleep(3); 
        }

        $this->info("Sincronització completada correctament.");
    }
}