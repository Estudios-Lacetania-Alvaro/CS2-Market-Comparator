<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MarketApiService
{
    /**
     * Obtenció de dades financeres i mètriques des de l'API de Steam.
     */
    public function getSteamData(string $skinName): array
    {
        $response = Http::get('https://steamcommunity.com/market/priceoverview/', [
            'appid' => 730,
            'currency' => 1,
            'market_hash_name' => $skinName
        ]);

        $data = ['price' => null, 'volume' => null];

        if ($response->successful()) {
            $json = $response->json();

            // Extracció i conversió del preu mínim actual
            if (isset($json['lowest_price'])) {
                $data['price'] = (float) str_replace(['$', ','], ['', ''], $json['lowest_price']);
            }

            // Extracció i conversió del volum de vendes
            if (isset($json['volume'])) {
                $data['volume'] = (int) str_replace(',', '', $json['volume']);
            }
        }

        return $data;
    }

    /**
     * Obtenció de l'oferta de menor cost i recursos gràfics des de l'API de DMarket.
     */
    public function getDMarketData(string $skinName): array
    {
        $response = Http::get('https://api.dmarket.com/exchange/v1/market/items', [
            'gameId' => 'a8db',
            'title' => $skinName,
            'limit' => 1,
            'currency' => 'USD'
        ]);

        $data = ['price' => null, 'image' => null];

        if ($response->successful() && !empty($response->json()['objects'])) {
            $item = $response->json()['objects'][0];

            // Conversió del valor monetari de cèntims a unitats decimals
            $data['price'] = $item['price']['USD'] / 100;
            
            // Assignació de la URL de la imatge si està disponible
            $data['image'] = $item['image'] ?? null;
        }

        return $data;
    }
}