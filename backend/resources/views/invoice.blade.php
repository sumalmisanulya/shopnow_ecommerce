<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $orderCode }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #27272a;
            line-height: 1.6;
            padding: 40px;
            background: #fff;
        }

        /* ── Header ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1.5px solid #e4e4e7;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .brand-name {
            font-size: 22px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 4px;
        }
        .brand-meta {
            font-size: 9px;
            color: #71717a;
            line-height: 1.8;
        }
        .invoice-meta {
            text-align: right;
        }
        .invoice-title {
            font-size: 16px;
            font-weight: bold;
            color: #18181b;
            margin-bottom: 4px;
        }
        .invoice-meta-text {
            font-size: 9px;
            color: #71717a;
            line-height: 1.8;
        }

        /* ── Status Badge ── */
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 6px;
        }
        .status-paid   { background: #d1fae5; color: #065f46; }
        .status-unpaid { background: #fef3c7; color: #92400e; }

        /* ── Bill / Ship To ── */
        .details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            gap: 20px;
        }
        .details-column { width: 48%; }
        .section-title {
            font-size: 9px;
            font-weight: bold;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 0.5px solid #e4e4e7;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }
        .detail-name  { font-weight: bold; font-size: 10px; color: #18181b; }
        .detail-value { font-size: 9px; color: #52525b; line-height: 1.7; }

        /* ── Items Table ── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        thead tr {
            background: #f4f4f5;
        }
        thead th {
            padding: 8px 10px;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #52525b;
            border-bottom: 1px solid #e4e4e7;
        }
        tbody td {
            padding: 8px 10px;
            border-bottom: 0.5px solid #f4f4f5;
            font-size: 10px;
            color: #3f3f46;
        }
        .col-desc  { text-align: left; width: 50%; }
        .col-qty   { text-align: center; width: 12%; }
        .col-price { text-align: right; width: 18%; }
        .col-total { text-align: right; width: 20%; }

        /* ── Totals ── */
        .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
        }
        .summary-box {
            width: 42%;
            border-top: 1px solid #e4e4e7;
            padding-top: 12px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 9px;
        }
        .summary-label { color: #71717a; }
        .summary-value { color: #3f3f46; font-weight: 500; }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1.5px solid #7c3aed;
        }
        .total-label, .total-value {
            font-size: 12px;
            font-weight: bold;
            color: #7c3aed;
        }

        /* ── Footer ── */
        .footer {
            margin-top: 48px;
            border-top: 0.5px solid #e4e4e7;
            padding-top: 12px;
            text-align: center;
            font-size: 8px;
            color: #a1a1aa;
        }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header">
        <div>
            <div class="brand-name">ShopNow Inc.</div>
            <div class="brand-meta">
                123 Digital Square, Commerce Plaza<br>
                support@shopnow.com &nbsp;|&nbsp; +1 (555) 019-0000
            </div>
        </div>
        <div class="invoice-meta">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta-text">
                Invoice Code: <strong>{{ $orderCode }}</strong><br>
                Date: {{ $date }}
            </div>
            @if($isPaid)
                <span class="status-badge status-paid">PAID</span>
            @else
                <span class="status-badge status-unpaid">UNPAID</span>
            @endif
        </div>
    </div>

    {{-- BILL TO / SHIP TO --}}
    <div class="details-grid">
        <div class="details-column">
            <div class="section-title">Bill To</div>
            <div class="detail-name">{{ $customerName }}</div>
            <div class="detail-value">{{ $customerEmail }}</div>
        </div>
        <div class="details-column">
            <div class="section-title">Ship To</div>
            <div class="detail-value">{{ $address }}</div>
        </div>
    </div>

    {{-- ORDER ITEMS TABLE --}}
    <table>
        <thead>
            <tr>
                <th class="col-desc">Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Unit Price</th>
                <th class="col-total">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td class="col-desc">{{ $item['name'] }}</td>
                <td class="col-qty">{{ $item['quantity'] }}</td>
                <td class="col-price">LKR {{ number_format($item['price'], 2) }}</td>
                <td class="col-total">LKR {{ number_format($item['price'] * $item['quantity'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- TOTALS SUMMARY --}}
    <div class="summary-wrapper">
        <div class="summary-box">
            <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">LKR {{ number_format($subtotal, 2) }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Shipping</span>
                <span class="summary-value">{{ $shipping == 0 ? 'FREE' : 'LKR ' . number_format($shipping, 2) }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Tax (8%)</span>
                <span class="summary-value">LKR {{ number_format($tax, 2) }}</span>
            </div>
            <div class="total-row">
                <span class="total-label">Total Due</span>
                <span class="total-value">LKR {{ number_format($totalPrice, 2) }}</span>
            </div>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        Thank you for choosing ShopNow! If you have any inquiries regarding this invoice, please reach out to our helpdesk.
    </div>

</body>
</html>
