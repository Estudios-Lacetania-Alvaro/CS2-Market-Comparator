<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AiService;

/**
 * Controlador encarregat d'exposar els endpoints de consultoria intel·ligent (IA).
 */
class AiController extends Controller
{
    protected $aiService;

    /**
     * Injectem el servei d'IA mitjançant el contenidor de dependències de Laravel.
     */
    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Retorna el llistat d'insights i recomanacions generades en temps real pel model.
     */
    public function getRecommendations(Request $request)
    {
        try {
            // Executem l'anàlisi passant les dades de l'usuari autenticat
            $insights = $this->aiService->getPortfolioRecommendations($request->user());
            
            return response()->json($insights, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "Error processant l'anàlisi intel·ligent.",
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
