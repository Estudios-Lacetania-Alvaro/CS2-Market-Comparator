<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skin;
use App\Models\DMarketItem;
use App\Models\PriceHistory;

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
        $skin = Skin::findOrFail($id);

        if (!$skin) {
            return response()->json([
                'success' => false,
                'error' => 'Skin no localitzada a la base de dades'
            ], 404);
        }

        $historicalData = PriceHistory::where('skin_id', $id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'timestamp'     => $item->created_at->format('Y-m-d H:i'),
                    'steam_price'   => (float) $item->steam_price,
                    'dmarket_price' => (float) $item->dmarket_price,
                ];
            });

        // Estimació de comissions per plataforma (15% Steam / 3% DMarket)
        $steamFee = $skin->steam_price ? ($skin->steam_price * 0.15) : 0;
        $dmarketFee = $skin->dmarket_price ? ($skin->dmarket_price * 0.03) : 0;

        // Resposta
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $skin->id,
                'name' => $skin->name,
                'image' => $skin->image_url,
                'steam_price' => $skin->steam_price,
                'dmarket_price' => $skin->dmarket_price,
                'fees' => [
                    'steam_fee' => round($steamFee, 2),
                    'dmarket_fee' => round($dmarketFee, 2)
                ],
                'historical_data' => $historicalData
            ]
        ]);
    }
}