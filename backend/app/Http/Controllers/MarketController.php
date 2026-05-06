<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skin;
use App\Models\DMarketItem;

class MarketController extends Controller
{
    /**
     * Obtenció del llistat complet de skins amb dades processades.
     */
    public function getMarketSkins()
    {
        // Recuperació i transformació de la col·lecció de skins
        $skins = Skin::all()->map(function ($skin) {
            
            // Determinació del tipus de recomanació basada en el marge de benefici
            $recommendation = 'No recomanable';
            if ($skin->profit_margin > 15) {
                $recommendation = 'Oportunitat rentable';
            } elseif ($skin->profit_margin > 0) {
                $recommendation = 'Marge baix';
            }

            // Càlcul de la diferència bruta entre preus de venda i compra
            $netProfit = 0;
            if ($skin->steam_price && $skin->dmarket_price) {
                $netProfit = $skin->steam_price - $skin->dmarket_price;
            }

            // Retorn de l'estructura de dades normalitzada per al frontend
            return [
                'id' => $skin->id,
                'name' => $skin->name,
                'image' => $skin->image_url,
                'steam_price' => $skin->steam_price,
                'dmarket_price' => $skin->dmarket_price,
                'profit_margin_percent' => $skin->profit_margin,
                'net_profit_usd' => round($netProfit, 2),
                'recommendation' => $recommendation
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $skins
        ]);
    }

    /**
     * Obtenció del detall d'una skin específica mitjançant el seu identificador.
     */
    public function getSkinDetail($id)
    {
        // Localització del registre per identificador únic o gestió de resposta 404
        $skin = Skin::find($id);

        if (!$skin) {
            return response()->json([
                'success' => false,
                'error' => 'Skin no localitzada a la base de dades'
            ], 404);
        }

        // Estimació de comissions per plataforma (15% Steam / 3% DMarket)
        $steamFee = $skin->steam_price ? ($skin->steam_price * 0.15) : 0;
        $dmarketFee = $skin->dmarket_price ? ($skin->dmarket_price * 0.03) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $skin->id,
                'name' => $skin->name,
                'fees' => [
                    'steam_fee' => round($steamFee, 2),
                    'dmarket_fee' => round($dmarketFee, 2)
                ],
                'historical_data' => [] // Espai reservat per a futures implementacions de dades històriques
            ]
        ]);
    }

    /**
     * Obtenció d'ofertes individuals de DMarket comparades amb el preu base de Steam.
     */ 
    public function getDMarketItems()
    {
        // Es recuperen els ítems de DMarket carregant la informació de la skin base (Steam)
        $offers = DMarketItem::with('skin')->get()->map(function ($item) {
            $steamPrice = $item->skin->steam_price;
            $profit = $steamPrice ? round((($steamPrice - $item->price) / $item->price) * 100, 2) : 0;

            return [
                'name' => $item->skin->name,
                'dmarket_price' => $item->price,
                'steam_reference' => $steamPrice,
                'float' => $item->float_value,
                'profit_margin' => $profit,
                'link' => "https://dmarket.com/ingame-items/item-id/" . $item->item_id
            ];
        });

        return response()->json(['success' => true, 'data' => $offers]);
    }
}