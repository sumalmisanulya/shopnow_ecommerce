import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Download, Search, Clock, ShieldCheck, Receipt } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  code: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
}

export default function AdminInvoicesPage() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders for invoices:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.code.toLowerCase().includes(query) ||
      order.shippingAddress.toLowerCase().includes(query) ||
      order.paymentMethod.toLowerCase().includes(query)
    );
  });

  const getInvoiceStatus = (order: Order) => {
    // If order status is CANCELLED, or if it is COD and status is still PENDING, label UNPAID
    if (order.status === "CANCELLED") return "CANCELLED";
    if (order.paymentMethod === "CASH_ON_DELIVERY" && order.status === "PENDING") {
      return "UNPAID";
    }
    return "PAID";
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "UNPAID":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  const getDownloadUrl = (order: Order) => {
    const name = user?.name || "Customer";
    const email = user?.email || "customer@shopnow.com";

    const params = new URLSearchParams({
      orderCode: order.code,
      customerName: name,
      customerEmail: email,
      address: order.shippingAddress,
      totalPrice: order.totalPrice.toString(),
      items: JSON.stringify(order.items)
    });

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return `${backendUrl}/api/invoices/download?${params.toString()}`;
  };

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Clock className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in text-left font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100">Invoice Audit</h1>
          <p className="text-sm text-zinc-500 mt-1">Review invoices, verify transaction logs, and generate PDF bills.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl">
          <Receipt className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold text-zinc-300">{orders.length} Invoices</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order code, address, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden text-left">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-zinc-200">Billing Log</h3>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" /> PDF Engine Active
          </span>
        </div>

        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No transaction invoices available in history.
            </div>
          ) : (
            <table className="w-full text-sm text-zinc-300">
              <thead className="bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider text-left font-mono">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Date Issued</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const status = getInvoiceStatus(order);
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-200">
                        INV-{order.code.split("-")[1]}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getInvoiceStatusBadge(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200 font-sans">
                        LKR {order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={getDownloadUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
