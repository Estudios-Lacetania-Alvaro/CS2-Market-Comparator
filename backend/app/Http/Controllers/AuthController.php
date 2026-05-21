<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador encarregat de la gestió de l'autenticació, autorització i perfil d'usuaris.
 * Utilitza Laravel Sanctum per a l'emissió i validació de tokens d'accés (API tokens).
 */
class AuthController extends Controller
{
    /**
     * Registre d'un nou usuari al sistema i generació del token d'accés inicial.
     *
     * @param Request $request Dades del formulari de registre.
     * @return \Illuminate\Http\JsonResponse Resposta amb el token i les dades de l'usuari.
     */
    public function register(Request $request)
    {
        // Validació estricta de les dades d'entrada segons les regles de negoci
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Persistència del nou registre d'usuari a la base de dades
        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), // Xifratge de la contrasenya
            'profile_photo' => 'https://picsum.photos/200',    // Assignació d'imatge per defecte
            'balance'       => 0.00,                           // Capital inicial zero
        ]);

        // Generació del token de sessió mitjançant Sanctum per a futures peticions autenticades
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'message' => 'Usuari creat correctament',
            'token'   => $token,
            'user'    => $user
        ], 201);
    }

    /**
     * Autenticació d'usuaris existents mitjançant credencials.
     *
     * @param Request $request Credencials d'accés (email i contrasenya).
     * @return \Illuminate\Http\JsonResponse Resposta amb el token d'accés o error d'autenticació.
     */
    public function login(Request $request)
    {
        // Validació del format de les credencials rebudes
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Verificació d'identitat contra els registres de la base de dades
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credencials incorrectes'
            ], 401);
        }

        // Recuperació de la instància de l'usuari autenticat
        $user = User::where('email', $request->email)->firstOrFail();

        // Emissió d'un nou token de sessió operatiu
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuari logejat correctament',
            'token'   => $token,
            'user'    => $user
        ], 200);
    }

    /**
     * Recuperació de les dades del perfil associat al token d'accés vigent.
     *
     * @param Request $request Petició autenticada.
     * @return \Illuminate\Http\JsonResponse Dades de l'usuari.
     */
    public function user(Request $request)
    {
        // Retorn directe de la informació de l'entitat usuari autenticada
        return response()->json($request->user(), 200);
    }

    /**
     * Revocació del token d'accés i tancament de la sessió activa.
     *
     * @param Request $request Petició autenticada.
     * @return \Illuminate\Http\JsonResponse Confirmació de tancament de sessió.
     */
    public function logout(Request $request)
    {
        // Inactivació i eliminació del token vigent per finalitzar l'accés autoritzat
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sessió tancada correctament'
        ], 200);
    }

    /**
     * Modificació de les dades del perfil de l'usuari autenticat.
     *
     * @param Request $request Dades actualitzades del perfil.
     * @return \Illuminate\Http\JsonResponse Confirmació i noves dades de l'usuari.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validació de les dades entrants, permetent mantenir l'email actual sense disparar la regla d'unicitat
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'profile_photo' => 'nullable|string',
        ]);

        // Actualització dels atributs del model
        $user->update([
            'name'          => $request->name,
            'email'         => $request->email,
            'profile_photo' => $request->profile_photo,
        ]);

        return response()->json([
            'message' => 'Perfil actualitzat correctament',
            'user'    => $user
        ], 200);
    }
}