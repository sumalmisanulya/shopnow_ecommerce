import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle, Calendar, FileDown, Compass, MapPin, Phone, User } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentMethod = searchParams.get("payment_method");
  const shippingName = searchParams.get("shipping_name");
  const shippingAddress = searchParams.get("shipping_address");
  const phone = searchParams.get("phone");
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    // Clear shopping cart on successful checkout redirect
    clearCart();

    const paramCode = searchParams.get("code");
    
    if (paramCode) {
      setOrderCode(paramCode);
    } else {
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
    }
  }, [clearCart, searchParams]);

  // Calculate delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      {/* Animated Checkmark */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl scale-125" />
        <CheckCircle className="w-20 h-20 text-emerald-400 relative z-10 animate-bounce" />
      </div>

      {paymentMethod === "cod" ? (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/15 mb-4">
          Cash on Delivery Confirmed
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 mb-4">
          Payment Successful
        </span>
      )}
      
      <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 mb-2 font-sans">
        Thank You for Your Order!
      </h1>
      <p className="text-zinc-400 mb-2 font-sans">
        Your order has been logged and sent to our fulfillment queue.
      </p>
      <p className="text-sm text-zinc-500 font-mono mb-8">
        Order Reference: <span className="text-zinc-300 font-bold">{orderCode}</span>
      </p>

      {/* Shipping Timeline */}
      <div className="glass border border-white/5 rounded-2xl p-6 text-left mb-10 max-w-xl mx-auto">
        <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2 font-sans">
          <Calendar className="w-4 h-4 text-violet-400" />
          Fulfillment Timeline
        </h3>

        <div className="relative pl-6 border-l-2 border-white/5 space-y-6">
          {/* Step 1 */}
          <div className="relative text-left">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 ring-4 ring-zinc-950" />
            <h4 className="font-semibold text-zinc-200 text-sm font-sans">Order Confirmed</h4>
            <p className="text-xs text-zinc-500 mt-0.5 font-sans">
              {paymentMethod === "cod"
                ? "We have registered your Cash on Delivery request."
                : "We have received your payment and details."}
            </p>
          </div>
          {/* Step 2 */}
          <div className="relative text-left">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 ring-4 ring-zinc-950 animate-pulse-subtle" />
            <h4 className="font-semibold text-zinc-400 text-sm font-sans">Processing & Packaging</h4>
            <p className="text-xs text-zinc-500 mt-0.5 font-sans">Item quality check and driver scheduling.</p>
          </div>
          {/* Step 3 */}
          <div className="relative text-left">
            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 ring-4 ring-zinc-950" />
            <h4 className="font-semibold text-zinc-500 text-sm font-sans">Delivery Expected</h4>
            <p className="text-xs text-zinc-450 mt-0.5 font-medium text-violet-350 font-sans">
              {formattedDeliveryDate}
            </p>
          </div>
        </div>

        {/* Shipping Details for Cash on Delivery */}
        {paymentMethod === "cod" && shippingAddress && (
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            <h4 className="font-bold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-2 font-sans">
              <MapPin className="w-4 h-4 text-violet-400" />
              Delivery Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 rounded-xl p-4 border border-white/5 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block">
                  Receiver Name
                </span>
                <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{shippingName}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block">
                  Contact Number
                </span>
                <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{phone}</span>
                </div>
              </div>
              
              <div className="sm:col-span-2 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block">
                  Shipping Address
                </span>
                <p className="text-zinc-200 font-medium text-sm leading-relaxed">
                  {shippingAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
        <a
          href={`${backendUrl}/api/invoices/download?orderCode=${orderCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg hover:shadow-violet-600/10 cursor-pointer"
        >
          <FileDown className="w-4.5 h-4.5" />
          Download Invoice PDF
        </a>
        <Link
          to="/profile"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass hover:bg-white/5 text-zinc-300 hover:text-white border border-white/10 font-semibold transition-all"
        >
          <Compass className="w-4.5 h-4.5" />
          My Dashboard
        </Link>
      </div>
    </div>
  );
}
