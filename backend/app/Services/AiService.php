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
        // 1. Obtenim només les armes en propietat de l'usuari carregant les dades de la skin
        $items = UserItem::where('user_id', $user->id)
                        ->where('status', 'owned')
                        ->with('skin')
                        ->get();

        // Si l'inventari està buit, retornem l'estructura neta per al frontend
        if ($items->isEmpty()) {
            return [
                'general_analysis' => "Your portfolio is currently empty. Register new purchases to receive recommendations based on artificial intelligence.",
                'recommendations'  => []
            ];
        }

        // 2. Mapegem les dades rellevants per enviar-les com a context al prompt
        $portfolioData = $items->map(function ($item) {
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

        // 3. Prompt estricte: demanem un format JSON pla sense caràcters estranys
        $prompt = "You are an expert financial analyst in the Counter-Strike 2 digital asset market.
Analyze the following user portfolio and generate strategic recommendations.
Live portfolio data: " . json_encode($portfolioData) . "

You MUST respond ONLY with a flat JSON object. All contents and analysis must be written in English. The structure must be EXACTLY like this:
{
\"general_analysis\": \"Global health analysis of the portfolio in 2 or 3 lines.\",
\"recommendations\": [
{
\"inventory_id\": 1,
\"skin_name\": \"Name of the skin\",
\"action\": \"sell\",
\"reason\": \"Concise and expert reasoning for the suggested operation.\"
}
]
}";

        // 4. URL neta i correcta cap a l'API de Google Gemini
        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}";

        $response = Http::post($url, [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            // Forcem nativament la resposta en JSON
            'generationConfig' => [
                'responseMimeType' => 'application/json',
            ]
        ]);

        // Gestió d'errors de connexió o de l'API
        if (!$response->successful()) {
            $errorMessage = $response->body();
            Log::error("Error crític a l'API de Gemini: " . $errorMessage);
            
            // Si l'error és de quota o clau d'API, informem clarament
            if ($response->status() === 429) {
                return [
                    'general_analysis' => "Gemini API quota exceeded. Please try again in a minute.",
                    'recommendations'  => []
                ];
            }

            return [
                'general_analysis' => "Connection error with the AI engine. Please verify your API key or internet connection.",
                'recommendations'  => []
            ];
        }

        // 5. Descodificació de la resposta
        $data = $response->json();
        
        // Verifiquem si la resposta ha estat bloquejada per seguretat o està buida
        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            Log::warning("Gemini ha retornat una resposta buida o bloquejada: " . json_encode($data));
            return [
                'general_analysis' => "The AI engine blocked the response due to safety reasons or lack of data. Try adding skins to your inventory.",
                'recommendations'  => []
            ];
        }

        $jsonString = $data['candidates'][0]['content']['parts'][0]['text'];

        // Neteja extra per si el model inclou blocs de codi markdown per error
        $jsonString = str_replace(['```json', '```'], '', $jsonString);
        $result = json_decode(trim($jsonString), true);

        if (!$result) {
            Log::error("Error parsejant el JSON de Gemini. Resposta original: " . $jsonString);
            return [
                'general_analysis' => "The AI generated an invalid data format. Please try again in a few seconds.",
                'recommendations'  => []
            ];
        }

        return $result;
    }
}