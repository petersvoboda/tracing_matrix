<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    // ...register method unchanged...

    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required'],
            ]);

            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                $token = $user->createToken('api-token')->plainTextToken;
                return response()->json(['user' => $user, 'token' => $token]);
            }

            return response()->json(['message' => 'Invalid credentials'], 401);
        } catch (\Throwable $e) {
            \Log::error('Login error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Login error: ' . $e->getMessage()], 500);
        }
    }

    // ...logout method unchanged...
}
