<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validació dades que envia el frontend
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Creació del nou usuari a la base de dades
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_photo' => 'https://picsum.photos/200',
        ]);

        // Generació del token de sessió de seguretat amb Sanctum 
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'message' => 'Usuari creat correctament',
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // Validació dades que envia el frontend
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Comprovació de credencials correctes
        if (!Auth::attempt($request->only('email', 'password'))){
            return response()->json([
                'message' => 'Credencials incorrectes'
            ], 401);
        }

        // Creació usuari
        $user = User::where('email', $request->email)->firstOrFail();

        // Creació token de sessió
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuari logejat correctament',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    public function user(Request $request)
    {
        // Retornem les dades de l'usuari autenticat actualment
        return response()->json($request->user(), 200);
    }

    public function logout(Request $request)
    {
        // Eliminació del token actual per tancar la sessió de l'usuari
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sessió tancada correctament'
        ], 200);
    }
}
