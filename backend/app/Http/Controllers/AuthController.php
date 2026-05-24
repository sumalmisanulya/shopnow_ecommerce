<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
            'name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Missing or invalid fields'], 400);
        }

        $email = $request->input('email');
        if (User::where('email', $email)->exists()) {
            return response()->json(['error' => 'Email already registered'], 400);
        }

        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $request->input('name') ?: 'Customer',
            'email' => $email,
            'password' => Hash::make($request->input('password')),
            'role' => 'CUSTOMER',
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Missing email or password'], 400);
        }

        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if (!$user) {
            // Check fallback mock credentials
            if ($email === 'admin@shopnow.com' && $password === 'admin123') {
                return response()->json([
                    'id' => 'admin-id',
                    'name' => 'Admin User',
                    'email' => 'admin@shopnow.com',
                    'role' => 'ADMIN',
                ]);
            }
            if ($email === 'customer@shopnow.com' && $password === 'customer123') {
                return response()->json([
                    'id' => 'customer-id',
                    'name' => 'John Doe',
                    'email' => 'customer@shopnow.com',
                    'role' => 'CUSTOMER',
                ]);
            }
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if (!Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }
}
