<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configurem el CORS per permetre peticions des de l'Angular
        $middleware->validateCsrfTokens(except: [   
            'api/*', // Excloem les rutes de la API de la protecció CSRF si cal
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
