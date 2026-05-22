"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle, Calendar, FileDown, ArrowRight, Loader2, Compass } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "mock_session";
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [orderCode, setOrderCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear shopping cart on successful checkout redirect
    clearCart();

    // Generate a random order number
    const code = "SN-" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);
    
    // Proactively save this order inside localstorage so we can list it in user's profile dashboard!
    const mockOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
    const newOrder = {
      id: "ord_" + Math.random().toString(36).substring(2, 9),
      code: code,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      totalPrice: 299.99, // default simulation value
      shippingAddress: "123 Creative Studio, Design District, NY 10001",
      phone: "+1 (555) 019-2834",
      items: [
        {
          name: "Acoustic Pro ANC Headphones",
          quantity: 1,
          price: 299.99
        }
      ]
    };
    mockOrders.unshift(newOrder);
    localStorage.setItem("mock_orders", JSON.stringify(mockOrders));
  }, [clearCart]);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto" />
      </div>
    );
  }

  // Calculate delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      {/* Animated Checkmark */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl scale-125" />
        <CheckCircle className="w-20 h-20 text-emerald-400 relative z-10 animate-bounce" />
      </div>

      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 mb-4">
        Payment Successful
      </span>
      
      <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 mb-2">
        Thank You for Your Order!
      </h1>
      <p className="text-zinc-400 mb-2">
        Your order has been logged and sent to our fulfillment queue.
      </p>
      <p className="text-sm text-zinc-500 font-mono mb-8">
        Order Reference: <span className="text-zinc-300 font-bold">{orderCode}</span>
      </p>

      {/* Shipping Timeline */}
      <div className="glass border border-white/5 rounded-2xl p-6 text-left mb-10 max-w-xl mx-auto">
        <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" />
          Fulfillment Timeline
        </h3>

        <div className="relative pl-6 border-l-2 border-white/5 space-y-6">
          {/* Step 1 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 ring-4 ring-zinc-950" />
            <h4 className="font-semibold text-zinc-200 text-sm">Order Confirmed</h4>
            <p className="text-xs text-zinc-500 mt-0.5">We have received your payment and details.</p>
          </div>
          {/* Step 2 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 ring-4 ring-zinc-950 animate-pulse-subtle" />
            <h4 className="font-semibold text-zinc-400 text-sm">Processing & Packaging</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Item quality check and driver scheduling.</p>
          </div>
          {/* Step 3 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 ring-4 ring-zinc-950" />
            <h4 className="font-semibold text-zinc-500 text-sm">Delivery Expected</h4>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium text-violet-300">
              {formattedDeliveryDate}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
        <a
          href={`/api/invoices/download?orderCode=${orderCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg hover:shadow-violet-600/10 cursor-pointer"
        >
          <FileDown className="w-4.5 h-4.5" />
          Download Invoice PDF
        </a>
        <Link
          href="/profile"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass hover:bg-white/5 text-zinc-300 hover:text-white border border-white/10 font-semibold transition-all"
        >
          <Compass className="w-4.5 h-4.5" />
          My Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
