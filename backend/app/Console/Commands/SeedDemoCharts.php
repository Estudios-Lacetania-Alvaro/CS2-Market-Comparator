<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Skin;
use App\Models\UserItem;
use App\Models\Operation;
use App\Models\PriceHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SeedDemoCharts extends Command
{
    /**
     * El nom i la signatura de la comanda de consola.
     */
    protected $signature = 'market:seed-demo-charts';

    /**
     * La descripció de la comanda de consola.
     */
    protected $description = 'Pobla la BD amb dades demo de compres/vendes en diferents dies i històrics per provar les gràfiques de l\'usuari.';

    /**
     * Execució de la comanda de consola.
     */
    public function handle()
    {
        $this->info("🚀 Iniciant la generació de dades de prova per a les gràfiques...");

        // 1. Crear o actualitzar l'usuari demo
        $user = User::updateOrCreate(
            ['email' => 'usuari1@lacetania.cat'],
            [
                'name' => 'Usuario',
                'password' => Hash::make('Usuari1234!'),
                'balance' => 5000.00
            ]
        );
        $this->info("✅ Usuari 'Usuario' (usuari1@lacetania.cat) llest.");

        // Netejar dades prèvies de l'usuari per evitar duplicacions estranyes
        DB::table('operations')->where('user_id', $user->id)->delete();
        DB::table('user_items')->where('user_id', $user->id)->delete();
        $this->info("🧹 Netejades les operacions i inventari previs de l'usuari.");

        // 2. Definir i crear les skins rellevants desitjades pel client
        $skinsData = [
            [
                'name' => 'Five-SeveN | Fall Hazard (Field-Tested)',
                'steam' => 1050.00,
                'dmarket' => 75.90,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ],
            [
                'name' => '★ StatTrak™ Falchion Knife | Doppler (Minimal Wear)',
                'steam' => 1271.58,
                'dmarket' => 379.99,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ],
            [
                'name' => 'StatTrak™ AK-47 | Fuel Injector (Minimal Wear)',
                'steam' => 1099.75,
                'dmarket' => 493.46,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ],
            [
                'name' => '★ Butterfly Knife | Ultraviolet (Minimal Wear)',
                'steam' => 1452.69,
                'dmarket' => 799.00,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ],
            [
                'name' => '★ Talon Knife | Stained (Factory New)',
                'steam' => 964.08,
                'dmarket' => 405.59,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ],
            [
                'name' => '★ Karambit | Tiger Tooth (Minimal Wear)',
                'steam' => 1600.00,
                'dmarket' => 960.00,
                'image' => 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTkDZ1yhkDsBtMyufgGfM8d8RwcURKq1rNVO4sDYl9V63iDX-S_0cDaWFt_JhBStOr3e1Y1gKKbJ2tE7Nm3xpKOl_ShYbrTkDsDvcN3jrvF9Nmh0QXnr0Vva2j1cYWddAM6M1CF_E-ggbC4',
            ]
        ];

        $skins = [];
        foreach ($skinsData as $data) {
            $calculatedMargin = round((($data['steam'] * 0.85) - $data['dmarket']) / $data['dmarket'] * 100, 2);
            $skin = Skin::updateOrCreate(
                ['name' => $data['name']],
                [
                    'steam_price' => $data['steam'],
                    'dmarket_price' => $data['dmarket'],
                    'image_url' => $data['image'],
                    'profit_margin' => min(999.99, $calculatedMargin),
                    'volume' => 20
                ]
            );
            $skins[] = $skin;
        }
        $this->info("✅ Creats/Actualitzats els 6 models d'armes a la taula mestre.");

        // 3. Crear elements actius a l'inventari (status = 'owned')
        $ownedData = [
            ['skin' => $skins[0], 'buy_price' => 75.90, 'days_ago' => 5],
            ['skin' => $skins[1], 'buy_price' => 379.99, 'days_ago' => 3],
            ['skin' => $skins[2], 'buy_price' => 493.46, 'days_ago' => 1],
        ];

        foreach ($ownedData as $itemData) {
            $date = Carbon::now()->subDays($itemData['days_ago']);

            $userItem = UserItem::create([
                'user_id' => $user->id,
                'skin_id' => $itemData['skin']->id,
                'purchase_price' => $itemData['buy_price'],
                'status' => 'owned',
                'created_at' => $date,
                'updated_at' => $date
            ]);

            Operation::create([
                'user_id' => $user->id,
                'user_item_id' => $userItem->id,
                'type' => 'buy',
                'amount' => $itemData['buy_price'],
                'profit' => null,
                'date' => $date,
                'created_at' => $date,
                'updated_at' => $date
            ]);
        }
        $this->info("✅ Afegits 3 elements actius (owned) a l'inventari de l'usuari.");

        // 4. Crear historial de transaccions completes (comprades i venudes en diferents mesos)
        // Generem operacions de vendes al llarg dels últims mesos per poder provar la gràfica d'anys/mesos
        $historySkins = [
            // Més de 1 any enrere (> 365 dies)
            ['skin' => $skins[0], 'buy' => 80.00, 'sell' => 120.00, 'days_buy' => 400, 'days_sell' => 398],

            // Historial repartit al llarg de l'any
            ['skin' => $skins[1], 'buy' => 360.00, 'sell' => 500.00, 'days_buy' => 290, 'days_sell' => 285],
            ['skin' => $skins[2], 'buy' => 450.00, 'sell' => 610.00, 'days_buy' => 260, 'days_sell' => 255],
            ['skin' => $skins[3], 'buy' => 740.00, 'sell' => 1090.00, 'days_buy' => 230, 'days_sell' => 225],
            ['skin' => $skins[4], 'buy' => 380.00, 'sell' => 530.00, 'days_buy' => 200, 'days_sell' => 195],
            ['skin' => $skins[5], 'buy' => 880.00, 'sell' => 1290.00, 'days_buy' => 170, 'days_sell' => 165],
            ['skin' => $skins[0], 'buy' => 72.00, 'sell' => 115.00, 'days_buy' => 140, 'days_sell' => 135],
            ['skin' => $skins[1], 'buy' => 355.00, 'sell' => 525.00, 'days_buy' => 110, 'days_sell' => 105],
            ['skin' => $skins[2], 'buy' => 460.00, 'sell' => 650.00, 'days_buy' => 80, 'days_sell' => 75],
            ['skin' => $skins[3], 'buy' => 770.00, 'sell' => 1140.00, 'days_buy' => 50, 'days_sell' => 45],
            ['skin' => $skins[4], 'buy' => 390.00, 'sell' => 575.00, 'days_buy' => 20, 'days_sell' => 15],

            // Dues transaccions completes la darrera setmana
            ['skin' => $skins[1], 'buy' => 370.00, 'sell' => 550.00, 'days_buy' => 6, 'days_sell' => 5],
            ['skin' => $skins[2], 'buy' => 480.00, 'sell' => 680.00, 'days_buy' => 3, 'days_sell' => 2],
        ];

        foreach ($historySkins as $t) {
            $buyDate = Carbon::now()->subDays($t['days_buy']);
            $sellDate = Carbon::now()->subDays($t['days_sell']);

            // Crear ítem d'inventari com a venut
            $userItem = UserItem::create([
                'user_id' => $user->id,
                'skin_id' => $t['skin']->id,
                'purchase_price' => $t['buy'],
                'status' => 'sold',
                'created_at' => $buyDate,
                'updated_at' => $sellDate
            ]);

            // Operació de compra
            Operation::create([
                'user_id' => $user->id,
                'user_item_id' => $userItem->id,
                'type' => 'buy',
                'amount' => $t['buy'],
                'profit' => null,
                'date' => $buyDate,
                'created_at' => $buyDate,
                'updated_at' => $buyDate
            ]);

            // Benefici net real (15% de comissió de Steam al preu brut de venda)
            $netSell = round($t['sell'] * 0.85, 2);
            $profit = round($netSell - $t['buy'], 2);

            // Operació de venda
            Operation::create([
                'user_id' => $user->id,
                'user_item_id' => $userItem->id,
                'type' => 'sell',
                'amount' => $t['sell'],
                'profit' => $profit,
                'date' => $sellDate,
                'created_at' => $sellDate,
                'updated_at' => $sellDate
            ]);
        }
        $this->info("✅ Generats 11 registres de transaccions completes compres/vendes dels darrers 12 mesos.");

        // 5. Inserir dades històriques de preu (PriceHistory) per a 3 de les armes
        $skinsToPriceLog = [$skins[0], $skins[1], $skins[2]];
        
        foreach ($skinsToPriceLog as $skin) {
            DB::table('price_histories')->where('skin_id', $skin->id)->delete();

            $baseSteam = $skin->steam_price;
            $baseDMarket = $skin->dmarket_price;

            // Inserim històric de 30 dies enrere (un registre cada 2 dies)
            for ($i = 30; $i >= 0; $i -= 2) {
                $histDate = Carbon::now()->subDays($i);
                
                // Fluctuació del preu del -6% al +6% per fer la gràfica vistosa
                $fluctuation = 1 + (rand(-60, 60) / 1000);
                
                PriceHistory::create([
                    'skin_id' => $skin->id,
                    'steam_price' => round($baseSteam * $fluctuation, 2),
                    'dmarket_price' => round($baseDMarket * $fluctuation, 2),
                    'created_at' => $histDate,
                    'updated_at' => $histDate
                ]);
            }
        }
        $this->info("✅ Inserit correctament l'historial de preus diaris dels darrers 30 dies per a 3 armes.");

        $this->info("🎉 S'han generat correctament totes les dades per a provar les gràfiques i l'inventari!");
    }
}
