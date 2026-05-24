<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed default fallback users
        User::updateOrCreate(
            ['email' => 'admin@shopnow.com'],
            [
                'id' => 'admin-id',
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'ADMIN',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@shopnow.com'],
            [
                'id' => 'customer-id',
                'name' => 'John Doe',
                'password' => Hash::make('customer123'),
                'role' => 'CUSTOMER',
            ]
        );

        // Seed Categories
        $categories = [
            [
                'id' => 'cat-electronics',
                'name' => 'Electronics',
                'slug' => 'electronics',
                'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'id' => 'cat-fashion',
                'name' => 'Fashion',
                'slug' => 'fashion',
                'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'id' => 'cat-home-living',
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'id' => 'cat-books',
                'name' => 'Books',
                'slug' => 'books',
                'image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'id' => 'cat-sports',
                'name' => 'Sports',
                'slug' => 'sports',
                'image' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['id' => $cat['id']], $cat);
        }

        // Seed Products
        $products = [
            [
                'id' => 'prod-1',
                'name' => 'Acoustic Pro ANC Headphones',
                'slug' => 'acoustic-pro-anc-headphones',
                'description' => 'Experience premium sound with advanced hybrid active noise cancellation, 45-hour battery life, spatial audio processing, and plush leather earcups.',
                'price' => 299.99,
                'stock' => 25,
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-electronics',
                'active' => true,
            ],
            [
                'id' => 'prod-2',
                'name' => 'Minimalist Leather Watch',
                'slug' => 'minimalist-leather-watch',
                'description' => 'A sleek, contemporary timepiece with a genuine full-grain leather strap, scratch-resistant sapphire crystal glass, and Japanese quartz movement.',
                'price' => 189.00,
                'stock' => 12,
                'images' => [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-fashion',
                'active' => true,
            ],
            [
                'id' => 'prod-3',
                'name' => 'Premium Sport Sneakers',
                'slug' => 'premium-sport-sneakers',
                'description' => 'Engineered for maximum stability and bounce. Features breathable engineered mesh, reactive nitrogen-infused foam mid-soles, and durable rubber outsoles.',
                'price' => 145.50,
                'stock' => 8,
                'images' => [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-fashion',
                'active' => true,
            ],
            [
                'id' => 'prod-4',
                'name' => 'Cold-Brew Coffee Dripper',
                'slug' => 'cold-brew-coffee-dripper',
                'description' => 'Artisan slow-drip iced coffee maker. Crafted with thermal-shock resistant borosilicate glass, stainless steel valves, and a walnut wood support frame.',
                'price' => 110.00,
                'stock' => 15,
                'images' => [
                    'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-home-living',
                'active' => true,
            ],
            [
                'id' => 'prod-5',
                'name' => 'Designer Glass Desk Lamp',
                'slug' => 'designer-glass-desk-lamp',
                'description' => 'Sleek lighting for your modern home office. Includes a brass brushed finish base, handblown ribbed amber glass shade, and smart dimming capabilities.',
                'price' => 79.99,
                'stock' => 4,
                'images' => [
                    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-home-living',
                'active' => true,
            ],
            [
                'id' => 'prod-6',
                'name' => 'Minimalist Travel Backpack',
                'slug' => 'minimalist-travel-backpack',
                'description' => 'Weather-resistant nylon shell bag featuring expandable compartments, a dedicated 16-inch laptop pocket, hidden passport sleeve, and TSA-approved luggage straps.',
                'price' => 135.00,
                'stock' => 19,
                'images' => [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
                ],
                'categoryId' => 'cat-fashion',
                'active' => true,
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(
                ['id' => $prod['id']],
                [
                    'id' => $prod['id'],
                    'name' => $prod['name'],
                    'slug' => $prod['slug'],
                    'description' => $prod['description'],
                    'price' => $prod['price'],
                    'stock' => $prod['stock'],
                    'images' => $prod['images'],
                    'category_id' => $prod['categoryId'],
                    'active' => $prod['active'],
                ]
            );
        }
    }
}
