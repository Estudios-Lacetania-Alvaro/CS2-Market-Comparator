<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- TASQUES PROGRAMADES (CRON JOBS) ---

// Programem la sincronització cada 15 minuts.
// withoutOverlapping() és CRÍTIC: evita que s'obri un segon script si el primer encara no ha acabat.
Schedule::command('market:sync-skins-lowest-prices')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/market-sync.log'));