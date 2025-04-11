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
    /**
     * Register a new user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Optionally log the user in and create a token immediately after registration
        // $token = $user->createToken('api-token')->plainTextToken;
        // return response()->json(['user' => $user, 'token' => $token], 201);

        return response()->json(['message' => 'User registered successfully', 'user' => $user], 201);
    }

    /**
     * Authenticate user and return token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            // Revoke previous tokens if desired (optional, depends on strategy)
            // $user->tokens()->delete();
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json(['user' => $user, 'token' => $token]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Ensure the user is authenticated before trying to logout
        if ($request->user()) {
             // Revoke the token that was used to authenticate the current request...
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out successfully']);
        }

        // Handle cases where logout is called without authentication (optional)
        return response()->json(['message' => 'No user authenticated'], 401);

    }
}
