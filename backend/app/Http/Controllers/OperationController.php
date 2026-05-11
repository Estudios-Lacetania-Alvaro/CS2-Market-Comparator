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

        // Càlcul del marge de benefici (Preu Venda actual - Preu de Compra original) (lo que el user ha tret de benefici per l'item)
        $profit = $request->sell_price - $userItem->purchase_price;

        // Actualització de l'estat de l'actiu a "venut"
        $userItem->update(['status' => 'sold']);

        // Registre de l'operació financera a l'historial
        Operation::create([
            'user_id'      => $user->id,
            'user_item_id' => $userItem->id,
            'type'         => 'sell',
            'amount'       => $request->sell_price,
            'profit'       => $profit,
            'date'         => Carbon::now()
        ]);

        // Actualització del saldo amb redondeig (moneda de 2 decimals)
        $user->balance = round($user->balance + $request->sell_price, 2);
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
}
