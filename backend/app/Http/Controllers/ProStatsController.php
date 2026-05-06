<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ProStatsController extends Controller
{
    private $apiUrl = 'https://api.csapi.de';

    public function getRankings()
    {
        return Cache::remember('cs_rankings', 3600, function () {
            $response = Http::get("{$this->apiUrl}/rankings");
            return $response->json();
        });
    }

    public function getLatestMatches()
    {
        return Cache::remember('cs_latest_matches', 3600, function () {
            $response = Http::get("{$this->apiUrl}/matches/latest");
            return $response->json();
        });
    }

    public function getPlayerStats()
    {
        return Cache::remember('cs_player_stats', 3600, function () {
            $response = Http::get("{$this->apiUrl}/players/stats");
            return $response->json();
        });
    }
}
