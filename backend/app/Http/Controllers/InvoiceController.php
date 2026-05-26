<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function download(Request $request)
    {
        $orderCode = $request->input('orderCode');

        // Initialize default fallback values
        $date          = $request->input('date', date('F j, Y'));
        $customerName  = $request->input('customerName', 'John Doe');
        $customerEmail = $request->input('customerEmail', 'customer@shopnow.com');
        $address       = $request->input('address', '123 Creative Studio, Design District, NY 10001');
        $totalPrice    = floatval($request->input('totalPrice', 333.98));
        $isPaid        = true;

        // Parse items
        $itemsRaw = $request->input('items');
        $items = [];
        if ($itemsRaw) {
            if (is_string($itemsRaw)) {
                $items = json_decode($itemsRaw, true) ?: [];
            } elseif (is_array($itemsRaw)) {
                $items = $itemsRaw;
            }
        }

        // If orderCode is provided, try to fetch the real order from the database
        if ($orderCode) {
            $order = Order::with(['items', 'user'])->where('code', $orderCode)->first();
            if ($order) {
                $date          = $order->created_at ? $order->created_at->format('F j, Y') : date('F j, Y');
                $customerName  = $order->user ? $order->user->name : 'John Doe';
                $customerEmail = $order->user ? $order->user->email : 'customer@shopnow.com';
                $address       = $order->shipping_address;
                $totalPrice    = floatval($order->total_price);
                $isPaid        = $order->status !== 'PENDING' && $order->status !== 'CANCELLED';

                $items = $order->items->map(function ($item) {
                    return [
                        'name'     => $item->name,
                        'quantity' => intval($item->quantity),
                        'price'     => floatval($item->price),
                    ];
                })->toArray();
            }
        } else {
            $orderCode = 'SN-100000';
        }

        if (empty($items)) {
            $items = [
                [
                    'name'     => 'Acoustic Pro ANC Headphones',
                    'quantity' => 1,
                    'price'    => 299.99,
                ]
            ];
        }

        // Compute totals (matching frontend logic)
        $subtotal = array_sum(array_map(fn($i) => $i['price'] * $i['quantity'], $items));
        $shipping = $subtotal > 100 ? 0 : 9.99;
        $tax      = $subtotal * 0.08;

        $pdf = Pdf::loadView('invoice', compact(
            'orderCode',
            'date',
            'customerName',
            'customerEmail',
            'address',
            'totalPrice',
            'items',
            'subtotal',
            'shipping',
            'tax',
            'isPaid'
        ))->setPaper('a4', 'portrait');

        return $pdf->stream('invoice-' . $orderCode . '.pdf');
    }
}
