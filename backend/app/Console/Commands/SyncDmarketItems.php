<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Skin;
use App\Services\MarketApiService;
use App\Models\DMarketItem;
use Carbon\Carbon;

class SyncDmarketItems extends Command
{
    /**
     * Identificador de la comanda per a l'execució mitjançant la CLI d'Artisan.
     */
    protected $signature = 'market:sync-dmarket-items';

    /**
     * Descripció funcional de la comanda per al panell d'ajuda del sistema.
     */
    protected $description = "Sincronització d'ofertes detallades i actualització del catàleg des de l'API de DMarket";

    /**
     * Execució de la lògica de negoci de la comanda.
     */
    public function handle(MarketApiService $marketApi)
    {
        $this->info("Iniciant procés de sincronització amb l'API de DMarket...");

        // Execució de la petició HTTP per obtenir els articles més populars de CS2 (gameId: a8db)
        $response = Http::get('https://api.dmarket.com/exchange/v1/market/items', [
            'gameId'   => 'a8db',
            'limit'    => 100,
            'orderBy'  => 'popularity',
            'currency' => 'USD'
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $items = $data['objects'] ?? [];

            // Processament de la col·lecció d'objectes rebuts
            if (!empty($items)) {
                foreach ($items as $item) {
                
                    // Normalització del nom per evitar errors de concordança
                    $normalizedName = trim($item['title']);

                    /**
                     * Gestió de la integritat del catàleg: 
                     * Intentem buscar la skin ignorant espais extres i majúscules/minúscules.
                     */
                    $skin = Skin::where('name', $normalizedName)->first();
                    $this->line("Avaluació del registre: '{$normalizedName}'...");

                    // Si no la troba exactament, provem una cerca més laxa per si hi ha espais invisibles
                    if (!$skin) {
                        $skin = Skin::where('name', 'LIKE', '%' . $normalizedName . '%')->first();
                    }

                    if (!$skin) {
                        $this->line("Generant alta al catàleg base per: '{$normalizedName}'...");

                        // Ús del servei centralitzat per a la recuperació de dades de referència
                        $steamData = $marketApi->getSteamData($normalizedName);

                        // Computació de valors financers assignables al nou registre
                        $dmarketPrice = $item['price']['USD'] / 100;
                        $profitMargin = ($steamData['price'] && $dmarketPrice) ? round((($steamData['price'] - $dmarketPrice) / $dmarketPrice) * 100, 2) : 0;

                        // Persistència del nou element a l'estructura relacional
                        $skin = Skin::create([
                            'name'          => $normalizedName,
                            'image_url'     => $item['image'] ?? null,
                            'steam_price'   => $steamData['price'],
                            'dmarket_price' => $dmarketPrice,
                            'profit_margin' => $profitMargin,
                            'volume'        => $steamData['volume'],
                            'last_updated'  => Carbon::now()
                        ]);
                        // Inducció de latència estratègica per prevenir restriccions de connexió amb Steam
                        sleep(2);
                    }
                    
                    // Emmagatzematge de l'oferta individual vinculada a la skin mitjançant el seu identificador únic
                    DMarketItem::updateOrCreate(
                        ['item_id' => $item['itemId']], 
                        [
                            'skin_id'      => $skin->id,
                            'price'        => $item['price']['USD'] / 100, // Conversió de cèntims a valor decimal USD
                            'float_value'  => $item['extra']['floatValue'] ?? null,
                            'inspect_link' => $item['extra']['inspectInGame'] ?? null,
                        ]
                    );
                }
                $this->info("S'han processat " . count($items) . " registres correctament.");
            }
        } else {
            // Log d'error en cas de resposta no satisfactòria per part de l'endpoint extern
            $this->error("Error en la comunicació amb l'API externa: " . $response->body());
        }
    }
}