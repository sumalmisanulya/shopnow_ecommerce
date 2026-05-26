<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\InvoiceController;
use Illuminate\Http\Request;

echo "=== DomPDF Invoice Test ===\n\n";

$request = new Request([
    'orderCode'     => 'SN-999999',
    'customerName'  => 'John Doe',
    'customerEmail' => 'john@shopnow.com',
    'address'       => '42 Market Street, Colombo 03',
    'totalPrice'    => '4599.99',
    'items'         => json_encode([
        ['name' => 'Sony WH-1000XM5', 'quantity' => 1, 'price' => 3999.99],
        ['name' => 'USB-C Cable 2m',  'quantity' => 2, 'price' => 299.99],
    ])
]);

try {
    $controller = new InvoiceController();
    $response = $controller->download($request);
    $status = $response->getStatusCode();
    $content = $response->getContent();
    echo "Status: $status\n";
    echo "PDF Size: " . strlen($content) . " bytes\n";
    if ($status === 200 && strlen($content) > 1000) {
        file_put_contents('invoice_dompdf_test.pdf', $content);
        echo "✅ SUCCESS — saved to invoice_dompdf_test.pdf\n";
    } else {
        echo "❌ FAILED — response: $content\n";
    }
} catch (\Exception $e) {
    echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
