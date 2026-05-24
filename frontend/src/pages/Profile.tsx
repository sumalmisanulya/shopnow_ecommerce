import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import {
  ShoppingBag,
  Clock,
  FileDown,
  RefreshCw,
  MapPin,
  Mail,
  Loader2,
  Calendar,
} from "lucide-react";

interface Order {
  id: string;
  code: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const [orders, setOrders] = useState<Order[]>([]);
  const [returnOrderId, setReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login?callbackUrl=/profile");
    }
  }, [status, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "authenticated" && user) {
        try {
          const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
          const res = await fetch(`${backendUrl}/api/orders/user/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      }
    };
    fetchOrders();
  }, [status, user]);

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId || !returnReason) {
      showToast("Please select an order and state a reason for the return.", "error");
      return;
    }

    setIsSubmittingReturn(true);
    setTimeout(() => {
      // Update order status to RETURN_REQUESTED or register return request
      const updatedOrders = orders.map((ord) => {
        if (ord.code === returnOrderId) {
          return { ...ord, status: "RETURNED" };
        }
        return ord;
      });
      
      setOrders(updatedOrders);
      localStorage.setItem("mock_orders", JSON.stringify(updatedOrders));

      // Append to global returns database in localstorage for admin panel to see!
      const mockReturns = JSON.parse(localStorage.getItem("mock_returns") || "[]");
      mockReturns.unshift({
        id: "ret_" + Math.random().toString(36).substring(2, 9),
        orderCode: returnOrderId,
        reason: returnReason,
        status: "PENDING",
        customerEmail: user?.email,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("mock_returns", JSON.stringify(mockReturns));

      showToast(`Return request registered for ${returnOrderId}.`, "success");
      setReturnOrderId("");
      setReturnReason("");
      setIsSubmittingReturn(false);
    }, 1000);
  };

  if (status === "loading" || status === "unauthenticated" || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto" />
      </div>
    );
  }

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-8 text-left font-sans">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Return Request Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center text-base text-white font-bold uppercase">
                {user.name?.slice(0, 2) || "U"}
              </div>
              <div>
                <h3 className="font-bold text-zinc-200">{user.name || "Premium User"}</h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600/10 text-violet-300 mt-1 uppercase border border-violet-500/10 font-sans">
                  {user.role || "CUSTOMER"}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-zinc-455 font-sans">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-550" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-555" />
                <span>123 Creative Studio, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Return Request Form */}
          <div className="glass p-6 rounded-2xl border border-white/5 text-left">
            <h3 className="font-bold text-zinc-200 mb-4 flex items-center gap-2 font-sans">
              <RefreshCw className="w-4.5 h-4.5 text-violet-400" />
              Request a Return
            </h3>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                  Select Order
                </label>
                <select
                  value={returnOrderId}
                  onChange={(e) => setReturnOrderId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="" className="bg-zinc-950">-- Choose Order --</option>
                  {orders
                    .filter((ord) => ord.status === "PENDING" || ord.status === "CONFIRMED" || ord.status === "PAID")
                    .map((ord) => (
                      <option key={ord.code} value={ord.code} className="bg-zinc-950">
                        {ord.code} (LKR {ord.totalPrice.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                  Reason for Return
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what went wrong..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReturn || orders.length === 0}
                className="w-full py-2.5 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-200 transition-colors text-sm cursor-pointer"
              >
                {isSubmittingReturn ? "Filing request..." : "Submit Return Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 text-left">
          <div className="glass p-6 rounded-2xl border border-white/5 min-h-[500px]">
            <h3 className="font-bold text-zinc-200 mb-6 flex items-center gap-2 font-sans">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              Order History ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="py-20 text-center">
                <Clock className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
                <h4 className="text-zinc-300 font-bold font-sans">No orders found</h4>
                <p className="text-xs text-zinc-550 mt-1 mb-6 font-sans">You haven't purchased any items yet.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Start exploring catalog &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-white/5 rounded-xl p-5 bg-[#09090f]/50 hover:bg-[#0c0c14]/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3.5 mb-3.5">
                      <div>
                        <span className="text-xs text-zinc-400 font-semibold font-mono">Code: {ord.code}</span>
                        <div className="flex items-center gap-2 text-xs text-zinc-550 mt-1 font-sans">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-sans ${
                          ord.status === "PENDING"
                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/15"
                            : ord.status === "RETURNED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm font-sans">
                          <span className="text-zinc-300">
                            {item.name} <span className="text-xs text-zinc-555 font-bold">x {item.quantity}</span>
                          </span>
                          <span className="text-zinc-200 font-medium">LKR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-5 pt-3.5 border-t border-white/5 font-sans">
                      <p className="text-sm font-bold text-zinc-200">
                        Total Price: <span className="text-violet-450">LKR {ord.totalPrice.toFixed(2)}</span>
                      </p>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={`${backendUrl}/api/invoices/download?orderCode=${ord.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors w-full sm:w-auto cursor-pointer"
                        >
                          <FileDown className="w-4 h-4" /> Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
