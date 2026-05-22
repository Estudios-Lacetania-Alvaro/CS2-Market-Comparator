<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skin;
use App\Models\UserItem;
use App\Models\Operation;
use Carbon\Carbon;

/**
 * Controlador encarregat de la lògica financera i la gestió d'inventaris dels usuaris.
 */
class OperationController extends Controller
{
    /**
     * Registra l'adquisició d'una nova arma i l'afegeix a l'inventari de l'usuari.
     */
    public function buy(Request $request)
    {
        // Validació de les dades d'entrada enviades des del frontend
        $request->validate([
            'skin_id' => 'required|exists:skins,id',
            'price'   => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Creació de l'actiu a l'inventari (es guarda com a 'owned' per defecte)
        $userItem = UserItem::create([
            'user_id'        => $user->id,
            'skin_id'        => $request->skin_id,
            'purchase_price' => $request->price,
            'status'         => 'owned'
        ]);

        // Registre de l'operació financera a l'historial
        Operation::create([
            'user_id'      => $user->id,
            'user_item_id' => $userItem->id,
            'type'         => 'buy',
            'amount'       => $request->price,
            'profit'       => null, // Les compres no generen benefici directe en el moment
            'date'         => Carbon::now()
        ]);

        // Deducció i redondeig del saldo de l'usuari
        $user->balance = round($user->balance - $request->price, 2);
        $user->save();

        return response()->json([
            'message'        => 'Compra registrada correctament',
            'inventory_item' => $userItem,
            'new_balance'    => $user->balance
        ], 200);
    }

    /**
     * Registra la venda d'una arma de l'inventari i en calcula el benefici net.
     */
    public function sell(Request $request, $inventory_id)
    {
        // Validació del preu de venda enviat pel frontend
        $request->validate([
            'sell_price' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Recuperació i validació de l'ítem (ha de ser de l'usuari i no estar venut prèviament)
        $userItem = UserItem::where('id', $inventory_id)
                            ->where('user_id', $user->id)
                            ->where('status', 'owned')
                            ->firstOrFail();

        // Càlcul del preu de venda net (restant la comissió de Steam del 15%)
        $netSellPrice = round($request->sell_price * 0.85, 2);
        
        // Càlcul del marge de benefici net (Preu Venda Net - Preu de Compra original)
        $profit = round($netSellPrice - $userItem->purchase_price, 2);

        // Actualització de l'estat de l'actiu a "venut"
        $userItem->update(['status' => 'sold']);

        // Registre de l'operació financera a l'historial (guardem el preu net al saldo/benefici)
        Operation::create([
            'user_id'      => $user->id,
            'user_item_id' => $userItem->id,
            'type'         => 'sell',
            'amount'       => $request->sell_price, // preu brut de llistat
            'profit'       => $profit,
            'date'         => Carbon::now()
        ]);

        // Actualització del saldo afegint només el preu net de venda (menys comissions)
        $user->balance = round($user->balance + $netSellPrice, 2);
        $user->save();

        return response()->json([
            'message'     => 'Venda registrada correctament',
            'profit'      => $profit,
            'new_balance' => $user->balance
        ], 200);
    }

    /**
     * Recupera el llistat d'armes que l'usuari posseeix actualment.
     */
    public function inventory(Request $request)
    {
        // Obtenim només els ítems actius i carreguem la informació del catàleg mestre (skin)
        $inventory = UserItem::where('user_id', $request->user()->id)
                            ->where('status', 'owned')
                             ->with('skin') // Això adjunta la imatge i el nom de l'arma a la resposta JSON
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json($inventory, 200);
    }

    /**
     * Recupera el llibre major (historial) de totes les transaccions de l'usuari.
     */
    public function history(Request $request)
    {
        // Recuperem operacions amb les dades de l'arma associada
        $operations = Operation::where('user_id', $request->user()->id)
                            ->with('userItem.skin')
                            ->orderBy('created_at', 'desc')
                            ->get();
        
        return response()->json($operations, 200);
    }

    /**
     * Importa l'inventari extern de l'usuari (Steam/DMarket) cap a la nostra base de dades local.
     */
    public function importExternalInventory(Request $request)
    {
        $user = $request->user();

        // SIMULACIÓ DE L'API EXTERNA: 
        // A la vida real, aquí faríem un Http::get() a DMarket o Steam utilitzant el SteamID de l'usuari.
        // Simulem que l'API ens retorna dues armes que l'usuari ja tenia a la seva propietat.
        $externalItems = [
            ['name' => 'AK-47 | Redline (Field-Tested)', 'estimated_price' => 43.31],
            ['name' => 'AWP | Asiimov (Field-Tested)',   'estimated_price' => 105.00],
        ];

        $importedCount = 0;

        foreach ($externalItems as $item) {
            // Busquem si l'arma existeix al nostre catàleg mestre
            $skin = Skin::where('name', $item['name'])->first();

            if ($skin) {
                // Evitem duplicats: comprovem que l'usuari no tingui ja aquesta arma importada
                $alreadyImported = UserItem::where('user_id', $user->id)
                                        ->where('skin_id', $skin->id)
                                        ->where('status', 'owned')
                                        ->exists();

                if (!$alreadyImported) {
                    // Inserim l'arma a l'inventari intern de l'usuari
                    // Nota financera: Com que no sabem quant li va costar en el passat, 
                    // assignem el preu actual de mercat com a preu d'adquisició base.
                    UserItem::create([
                        'user_id'        => $user->id,
                        'skin_id'        => $skin->id,
                        'purchase_price' => $item['estimated_price'], 
                        'status'         => 'owned'
                    ]);

                    $importedCount++;
                }
            }
        }

        return response()->json([
            'message'        => "Sincronització completada. S'han importat {$importedCount} noves armes.",
            'imported_count' => $importedCount
        ], 200);
    }

    /**
     * Calcula les estadístiques globals i el valor en temps real del portafoli
     * creuant el preu de compra amb el lowest price actual del catàleg.
     */
    public function portfolioStats(Request $request)
    {
        $user = $request->user();

        // Recuperem només les armes que l'usuari té actives a l'inventari
        $activeItems = UserItem::where('user_id', $user->id)
                            ->where('status', 'owned')
                            ->with('skin')
                            ->get();

        $totalInvested = 0;
        $currentEstimatedValue = 0;

        foreach ($activeItems as $item) {
            // Sumem el que l'usuari es va gastar de la seva butxaca
            $totalInvested += $item->purchase_price;

            // Busquem el lowest_price actualitzat (prioritzem DMarket, si no Steam)
            $currentFloorPrice = $item->skin->dmarket_price ?? ($item->skin->steam_price ?? 0);
            $currentEstimatedValue += $currentFloorPrice;
        }

        // Càlcul del benefici potencial si vengués tot avui al preu mínim
        $potentialProfit = $currentEstimatedValue - $totalInvested;
        $potentialProfitPercentage = $totalInvested > 0 ? round(($potentialProfit / $totalInvested) * 100, 2) : 0;

        return response()->json([
            'total_invested'              => round($totalInvested, 2),
            'current_estimated_value'     => round($currentEstimatedValue, 2),
            'potential_profit'            => round($potentialProfit, 2),
            'potential_profit_percentage' => $potentialProfitPercentage,
            'realized_roi'                => $user->balance // Els diners ja guanyats/perduts en vendes tancades
        ], 200);
    }
}
