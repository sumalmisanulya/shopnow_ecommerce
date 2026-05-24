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
            $product->categoryId = $product->category_id;
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
        $product->categoryId = $product->category_id;

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:products,slug',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'images' => 'required|array',
            'category_id' => 'required|string|exists:categories,id',
        ]);

        $product = Product::create([
            'id' => 'prod-' . random_int(1000, 9999),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'price' => floatval($validated['price']),
            'stock' => intval($validated['stock']),
            'images' => $validated['images'],
            'category_id' => $validated['category_id'],
            'active' => true,
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'slug' => 'sometimes|required|string|unique:products,slug,' . $id,
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric',
            'stock' => 'sometimes|required|integer',
            'images' => 'sometimes|required|array',
            'category_id' => 'sometimes|required|string|exists:categories,id',
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
