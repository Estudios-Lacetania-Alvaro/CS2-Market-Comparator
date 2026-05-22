<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * Controlador encarregat de la gestió i integració de dades competitives.
 * Interacciona amb una API externa per obtenir estadístiques professionals de CS2.
 */
class ProStatsController extends Controller
{
    /**
     * Endpoint base de l'API externa utilitzada per a l'extracció de dades.
     *
     * @var string
     */
    private $apiUrl = 'https://api.csapi.de';

    /**
     * Obtenció de la classificació mundial dels equips professionals.
     * S'implementa un sistema de memòria cau (cache) de 3600 segons (1 hora) 
     * per optimitzar el temps de resposta i reduir el consum d'amplada de banda.
     *
     * @return array|mixed Estructura JSON amb les dades de classificació.
     */
    public function getRankings()
    {
        return Cache::remember('cs_rankings', 3600, function () {
            $response = Http::get("{$this->apiUrl}/rankings");
            return $response->json();
        });
    }

    /**
     * Obtenció del registre històric dels darrers enfrontaments competitius.
     * Les dades es recuperen de la memòria cau o se sol·liciten a l'API si el període d'expiració ha finalitzat.
     *
     * @return array|mixed Estructura JSON amb els resultats recents.
     */
    public function getLatestMatches()
    {
        return Cache::remember('cs_latest_matches', 3600, function () {
            $response = Http::get("{$this->apiUrl}/matches/latest");
            return $response->json();
        });
    }

    /**
     * Obtenció de les mètriques de rendiment i estadístiques individuals dels jugadors professionals.
     * S'aplica persistència temporal a través de memòria cau per garantir la latència mínima en peticions concurrents.
     *
     * @return array|mixed Estructura JSON amb el rendiment dels usuaris.
     */
    public function getPlayerStats()
    {
        return Cache::remember('cs_player_stats', 3600, function () {
            $response = Http::get("{$this->apiUrl}/players/stats");
            return $response->json();
        });
    }
}