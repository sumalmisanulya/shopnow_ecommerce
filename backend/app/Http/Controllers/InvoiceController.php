<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    public function download(Request $request)
    {
        $orderCode = $request->input('orderCode', 'SN-100000');
        $date = $request->input('date', date('F j, Y'));
        $customerName = $request->input('customerName', 'John Doe');
        $customerEmail = $request->input('customerEmail', 'customer@shopnow.com');
        $address = $request->input('address', '123 Creative Studio, Design District, NY 10001');
        $totalPrice = floatval($request->input('totalPrice', 333.98));

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

        if (empty($items)) {
            $items = [
                [
                    'name' => 'Acoustic Pro ANC Headphones',
                    'quantity' => 1,
                    'price' => 299.99,
                ]
            ];
        }

        // Package payload for CLI
        $payload = [
            'orderCode' => $orderCode,
            'date' => $date,
            'items' => $items,
            'customerName' => $customerName,
            'customerEmail' => $customerEmail,
            'address' => $address,
            'totalPrice' => $totalPrice,
        ];

        $payloadJson = json_encode($payload);

        // Generate temporary file paths
        $tempDir = storage_path('app');
        $tempId = uniqid();
        $tempJsonFile = $tempDir . DIRECTORY_SEPARATOR . 'invoice_' . $tempId . '.json';
        $tempPdfFile = $tempDir . DIRECTORY_SEPARATOR . 'invoice_' . $tempId . '.pdf';

        // Write JSON data to temp file
        file_put_contents($tempJsonFile, $payloadJson);

        // Paths for Node execution
        $scriptPath = base_path('pdf-generator' . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'generate-pdf-cli.js');

        // Quote arguments for Windows shell compatibility
        $escapedScript = escapeshellarg($scriptPath);
        $escapedJsonFile = escapeshellarg($tempJsonFile);
        $escapedPdfFile = escapeshellarg($tempPdfFile);

        // Resolve Node binary path
        $nodeBinary = env('NODE_BINARY', 'node');
        if ($nodeBinary === 'node') {
            // Check if node is directly available in PATH, if not try common cPanel Node paths
            $pathsToTry = [
                'node',
                '/usr/local/bin/node',
                '/usr/bin/node',
                '/opt/cpanel/ea-nodejs22/bin/node',
                '/opt/cpanel/ea-nodejs20/bin/node',
                '/opt/cpanel/ea-nodejs18/bin/node',
                '/opt/cpanel/ea-nodejs16/bin/node',
            ];
            foreach ($pathsToTry as $path) {
                if ($path === 'node') {
                    $checkCmd = 'node -v';
                } else {
                    $checkCmd = escapeshellarg($path) . ' -v';
                }
                $outputCheck = [];
                $returnValCheck = -1;
                @exec($checkCmd, $outputCheck, $returnValCheck);
                if ($returnValCheck === 0) {
                    $nodeBinary = $path;
                    break;
                }
            }
        }

        $escapedNodeBinary = $nodeBinary === 'node' ? 'node' : escapeshellarg($nodeBinary);
        $cmd = "{$escapedNodeBinary} {$escapedScript} {$escapedJsonFile} {$escapedPdfFile}";

        // Run compiler process
        $output = [];
        $returnVar = -1;
        exec($cmd, $output, $returnVar);

        // Clean up JSON input file
        @unlink($tempJsonFile);

        if ($returnVar !== 0 || !file_exists($tempPdfFile)) {
            Log::error("PDF Generation failed", [
                'cmd' => $cmd,
                'output' => $output,
                'returnCode' => $returnVar,
                'tempPdfFileExists' => file_exists($tempPdfFile),
            ]);
            return response()->json(['error' => 'Failed to generate invoice PDF. CLI output: ' . implode("\n", $output)], 500);
        }

        $pdfContent = file_get_contents($tempPdfFile);

        // Clean up temp PDF file
        @unlink($tempPdfFile);

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="invoice-' . $orderCode . '.pdf"');
    }
}
