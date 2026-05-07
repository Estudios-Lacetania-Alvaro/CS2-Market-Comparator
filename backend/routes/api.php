<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MarketController;
use App\Http\Controllers\ProStatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Registre de les rutes de l'API per a l'aplicació. Aquestes rutes són
| carregades pel RouteServiceProvider i s'assignen automàticament al 
| grup de middleware "api".
|
*/

// Definició de rutes d'accés públic per a la gestió d'autenticació
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Definició de rutes protegides mitjançant el middleware d'autenticació Sanctum
// Es requereix l'enviament d'un token vàlid a la capçalera de la petició
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Rutas para la escena Pro (Proxy interno para evitar CORS)
Route::get('/pro/rankings', [ProStatsController::class, 'getRankings']);
Route::get('/pro/matches', [ProStatsController::class, 'getLatestMatches']);
Route::get('/pro/players', [ProStatsController::class, 'getPlayerStats']);

// Endpoints destinats a la consulta de dades del comparador de mercat
// Aquestes rutes proporcionen la informació necessària per a la interfície del frontend
Route::get('/market/skins', [MarketController::class, 'getMarketSkins']);
Route::get('/market/skins/{id}', [MarketController::class, 'getSkinDetail']);
Route::get('/market/dmarket-items', [MarketController::class, 'getDMarketItems']);