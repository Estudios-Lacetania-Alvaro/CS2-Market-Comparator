<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\UserItem;
use Illuminate\Support\Facades\Log;

/**
 * Servei dedicat a la integració amb la API de Google Gemini per actuar com a
 * assistent financer (Smart Advisor) del portafoli de l'usuari.
 */
class AiService
{
    /**
     * Analitza l'inventari actiu de l'usuari i retorna recomanacions d'inversió estructurades.
     */
    public function getPortfolioRecommendations($user)
    {
        // Obtenim només les armes en propietat de l'usuari carregant les dades del mercat
        $items = UserItem::where('user_id', $user->id)
                        ->where('status', 'owned')
                        ->with('skin')
                        ->get();

        // Si l'inventari està buit, retornem un estat clar per al frontend
        if ($items->isEmpty()) {
            return [
                'general_analysis' => "El teu portafoli actualment està buit. Registra noves compres per rebre recomanacions basades en intel·ligència artificial.",
                'recommendations'  => []
            ];
        }

        // Mapegem i deshidratem les dades rellevants per estalviar tokens al prompt
        $portfolioData = $items->map(function ($item) {
            // Calculem el preu mínim actual prioritzant DMarket
            $currentPrice = $item->skin->dmarket_price ?? ($item->skin->steam_price ?? 0);
            $profit = $currentPrice - $item->purchase_price;
            
            return [
                'inventory_id'         => $item->id,
                'skin_name'            => $item->skin->name,
                'purchase_price'       => (float) $item->purchase_price,
                'current_market_price' => (float) $currentPrice,
                'current_profit_usd'   => (float) $profit
            ];
        })->toArray();

        // Enginyeria de Prompts: Definim el rol i l'estructura estricta de sortida
        $prompt = "Ets un analista financer expert en el mercat d'actius digitals de Counter-Strike 2.
        Analitza el següent portafoli d'un usuari i genera recomanacions estratègiques.
        Dades del portafoli en viu: " . json_encode($portfolioData) . "

        Has de respondre NOMÉS amb un objecte JSON. No incloguis cap bloc de codi markdown (```json). L'estructura ha de ser EXACTAMENT aquesta:
        {
            \"general_analysis\": \"Anàlisi global de salut del portafoli en 2 o 3 línies (risc, rendibilitat general).\",
            \"recommendations\": [
                {
                    \"inventory_id\": 1,
                    \"skin_name\": \"Nom de l'arma\",
                    \"action\": \"sell\" | \"hold\",
                    \"reason\": \"Raonament concís i expert de per què s'ha de vendre o mantenir tenint en compte el preu de compra vs el preu de mercat actual.\"
                }
            ]
        }";

        // Execució de la petició REST nativa cap a l'API de Gemini (gemini-1.5-flash)
        $apiKey = env('GEMINI_API_KEY');
        $url = "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=){$apiKey}";

        $response = Http::post($url, [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            // Forcem directament a nivell d'API que Gemini generi una resposta en format JSON estricte
            'generationConfig' => [
                'responseMimeType' => 'application/json',
            ]
        ]);

        // Gestió d'errors de connexió o clau d'API invàlida
        if (!$response->successful()) {
            Log::error("Error crític a l'API de Gemini: " . $response->body());
            throw new \Exception("No s'ha pogut establir comunicació amb el motor d'IA.");
        }

        // Extracció i descodificació nativa del JSON de sortida
        $data = $response->json();
        $jsonString = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';

        return json_decode($jsonString, true);
    }
}