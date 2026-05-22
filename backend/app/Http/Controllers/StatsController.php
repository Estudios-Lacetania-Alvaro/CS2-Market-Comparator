<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Operation;
use App\Models\PriceHistory;
use App\Models\Skin;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Controlador dedicat a la generació de mètriques i dades evolutives per a les gràfiques del dashboard.
 */
class StatsController extends Controller
{
    /**
     * Retorna l'evolució dels beneficis (profits) realitzats per l'usuari agrupats per dies.
     * Permet filtrar per període: 'week', 'month' o 'year'.
     */
    public function realizedProfitChart(Request $request)
    {
        $user = $request->user();
        $period = $request->query('period', 'month'); // Per defecte, dades de l'últim mes

        // Iniciem la consulta sobre les operacions de venda (les úniques que generen profit liquidat)
        $query = Operation::where('user_id', $user->id)
                        ->where('type', 'sell')
                        ->whereNotNull('profit');
        
        // Apliquem el filtre temporal segons la petició del frontend
        $now = Carbon::now();
        if ($period === 'week') {
            $query->where('date', '>=', $now->subDays(7));
        } elseif ($period === 'month') {
            $query->where('date', '>=', $now->subDays(30));
        } elseif ($period === 'year') {
            $query->where('date', '>=', $now->subDays(365));
        }

        // Agrupem els beneficis per dia exacte (Format YYYY-MM-DD) sumant els guanys/pèrdues
        // Utilitzem DB::raw per extreure només la part de la data ignorant les hores i minuts
        $chartData = $query->select(
                            DB::raw('DATE(date) as day'), 
                            DB::raw('SUM(profit) as total_profit')
                        )
                    ->groupBy('day')
                    ->orderBy('day', 'asc')
                    ->get();

        return response()->json([
            'period_requested' => $period,
            'data_points'      => $chartData
        ], 200);
    }

    /**
     * Genera un sumari de l'activitat transaccional de l'usuari (volum d'operacions).
     */
    public function userActivitySummary(Request $request)
    {
        $user = $request->user();

        // Comptabilitzem quantes compres i vendes ha fet en total
        $totalBuys  = Operation::where('user_id', $user->id)->where('type', 'buy')->count();
        $totalSells = Operation::where('user_id', $user->id)->where('type', 'sell')->count();

        return response()->json([
            'total_buys'  => $totalBuys,
            'total_sells' => $totalSells,
            'total_operations' => $totalBuys + $totalSells
        ], 200);
    }
}
