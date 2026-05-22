import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get("orderCode") || "SN-100000";

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/invoices/download?orderCode=${orderCode}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to download invoice from backend" }, { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${orderCode}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Frontend invoice proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
