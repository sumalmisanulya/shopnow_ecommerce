<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->where('active', true);

        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('minPrice')) {
            $query->where('price', '>=', floatval($request->input('minPrice')));
        }

        if ($request->filled('maxPrice')) {
            $query->where('price', '<=', floatval($request->input('maxPrice')));
        }

        if ($request->input('inStock') === 'true') {
            $query->where('stock', '>', 0);
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        // Map to format categoryName field explicitly as a fallback
        $products->transform(function ($product) {
            $product->categoryName = $product->category ? $product->category->name : 'Catalog';
            return $product;
        });

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with('category')->where('slug', $slug)->first();

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->categoryName = $product->category ? $product->category->name : 'Catalog';

        return response()->json($product);
    }
}
