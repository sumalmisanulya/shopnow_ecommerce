<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'paymentMethod' => 'required|string',
            'shippingAddress' => 'required|string',
            'phone' => 'required|string',
            'userId' => 'required|string|exists:users,id',
            'items' => 'required|array',
            'items.*.id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'totalPrice' => 'required|numeric',
        ]);

        // Generate Order Code and Unique ID
        $orderId = 'ord_' . Str::random(10);
        $orderCode = 'SN-' . random_int(100000, 999999);

        // Start Transaction
        \DB::beginTransaction();
        try {
            // Create Order
            $order = Order::create([
                'id' => $orderId,
                'code' => $orderCode,
                'status' => $validated['paymentMethod'] === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
                'total_price' => floatval($validated['totalPrice']),
                'payment_method' => $validated['paymentMethod'],
                'shipping_address' => $validated['shippingAddress'],
                'phone' => $validated['phone'],
                'user_id' => $validated['userId'],
            ]);

            // Create Order Items and Reduce Stock
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['id']);
                
                // Check stock
                if ($product->stock < $item['quantity']) {
                    \DB::rollBack();
                    return response()->json(['error' => "Product {$product->name} is out of stock"], 400);
                }

                // Reduce stock
                $product->decrement('stock', $item['quantity']);

                OrderItem::create([
                    'order_id' => $orderId,
                    'name' => $product->name,
                    'quantity' => intval($item['quantity']),
                    'price' => floatval($product->price),
                ]);
            }

            \DB::commit();

            // Load items
            $order->load('items');
            return response()->json($order, 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(['error' => 'Order failed: ' . $e->getMessage()], 500);
        }
    }

    public function index()
    {
        $orders = Order::with('items')->orderBy('created_at', 'desc')->get();
        
        // Map snake_case to camelCase for frontend compatibility
        $mapped = $orders->map(function ($order) {
            return $this->formatOrderResponse($order);
        });

        return response()->json($mapped);
    }

    public function userOrders($userId)
    {
        $orders = Order::with('items')->where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        
        $mapped = $orders->map(function ($order) {
            return $this->formatOrderResponse($order);
        });

        return response()->json($mapped);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json($this->formatOrderResponse($order->load('items')));
    }

    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    private function formatOrderResponse($order)
    {
        return [
            'id' => $order->id,
            'code' => $order->code,
            'createdAt' => $order->created_at->toISOString(),
            'status' => $order->status,
            'totalPrice' => $order->total_price,
            'paymentMethod' => $order->payment_method,
            'shippingAddress' => $order->shipping_address,
            'phone' => $order->phone,
            'userId' => $order->user_id,
            'items' => $order->items->map(function ($item) {
                return [
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ];
            }),
        ];
    }
}
