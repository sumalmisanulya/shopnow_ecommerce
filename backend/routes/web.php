<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    
    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/orders', [CheckoutController::class, 'index']);
    Route::get('/orders/user/{userId}', [CheckoutController::class, 'userOrders']);
    Route::put('/orders/{id}', [CheckoutController::class, 'update']);
    Route::delete('/orders/{id}', [CheckoutController::class, 'destroy']);
    Route::get('/invoices/download', [InvoiceController::class, 'download']);
});
