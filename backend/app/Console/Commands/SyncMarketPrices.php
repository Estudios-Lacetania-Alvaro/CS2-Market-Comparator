<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Skin;
use Carbon\Carbon;

class SyncMarketPrices extends Command
{
    // Nom de la comanda per a l'execució a la terminal
    protected $signature = 'market:sync-prices';

    // Descripció de la comanda per a la llista d'ajuda de Laravel
    protected $description = 'Sincronització de preus de Steam i DMarket per a la llista de skins de la base de dades';

    public function handle()
    {
        // Selecció de skins de la base de dades ordenades per data d'actualització
        // Es prioritzen els registres més antics o aquells que no han estat processats (null)
        $targetSkins = Skin::orderBy('last_updated', 'asc')->limit(10)->get();

        $this->info("Iniciant sincronització de " . $targetSkins->count() . " skins des de la BD...");

        // Iteració sobre la llista de skins per a l'actualització de preus
        foreach ($targetSkins as $skin) {
            $skinName = $skin->name; // Extracció del nom del registre actual
            $this->line("Processant: {$skinName}...");

            // --- PART 1: STEAM ---
            // Consulta a l'API de Steam per obtenir el preu de mercat actual en USD
            $steamResponse = Http::get('https://steamcommunity.com/market/priceoverview/', [
                'appid' => 730,
                'currency' => 1, // USD
                'market_hash_name' => $skinName
            ]);

            $steamPrice = null;
            if ($steamResponse->successful() && isset($steamResponse->json()['lowest_price'])) {
                // Neteja de caràcters especials i conversió a format numèric (float)
                $steamPrice = (float) str_replace(['$', ','], ['', ''], $steamResponse->json()['lowest_price']);
            }

            // --- PART 2: DMARKET ---
            // Consulta a l'API de DMarket per obtenir l'article més econòmic disponible
            $dmarketResponse = Http::get('https://api.dmarket.com/exchange/v1/market/items', [
                'gameId' => 'a8db',
                'title' => $skinName,
                'limit' => 1,
                'currency' => 'USD'
            ]);

            $dmarketPrice = null;
            if ($dmarketResponse->successful() && !empty($dmarketResponse->json()['objects'])) {
                // Conversió del valor rebut en cèntims a unitats de dòlar
                $priceInCents = $dmarketResponse->json()['objects'][0]['price']['USD'];
                $dmarketPrice = $priceInCents / 100;
            }

            // --- PART 3: CÀLCUL I ACTUALITZACIÓ ---
            // Verificació de la disponibilitat d'ambdós preus per calcular el marge i actualitzar la BD
            if ($steamPrice && $dmarketPrice) {
                // Càlcul de la rendibilitat percentual
                $profitMargin = round((($steamPrice - $dmarketPrice) / $dmarketPrice) * 100, 2);

                Skin::updateOrCreate(
                    ['name' => $skinName],
                    [
                        'steam_price' => $steamPrice,
                        'dmarket_price' => $dmarketPrice,
                        'profit_margin' => $profitMargin,
                        'last_updated' => Carbon::now()
                    ]
                );
                $this->info("✅ Actualitzat: Steam: ${steamPrice} | DMarket: ${dmarketPrice} | Marge: {$profitMargin}%");
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