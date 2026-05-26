import { useEffect, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { 
  ListOrdered, 
  Search, 
  Eye, 
  Trash2, 
  Calendar, 
  MapPin, 
  Phone, 
  CreditCard, 
  XCircle,
  Clock
} from "lucide-react";

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

export default function AdminOrdersPage() {
  const showToast = useToastStore((state) => state.showToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        throw new Error("Failed to fetch orders from server");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load orders from database", "error");
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update status");
      }
      const updatedOrder = await res.json();
      
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      showToast(`Order status updated to ${newStatus}`, "success");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update order status", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order from history?")) {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/orders/${orderId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to delete order");
        }
        
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        showToast("Order removed from database", "info");
        if (selectedOrder && selectedOrder.id === orderId) {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to delete order", "error");
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const code = order.code ? order.code.toLowerCase() : "";
    const address = order.shippingAddress ? order.shippingAddress.toLowerCase() : "";
    const phone = order.phone ? order.phone.toLowerCase() : "";
    const method = order.paymentMethod ? order.paymentMethod.toLowerCase() : "";
    return (
      code.includes(query) ||
      address.includes(query) ||
      phone.includes(query) ||
      method.includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "PAID":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "DISPATCHED":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  const getPaymentBadge = (method: string) => {
    if (method === "CASH_ON_DELIVERY") {
      return "text-amber-300 bg-amber-500/5 border-amber-500/10";
    }
    return "text-violet-300 bg-violet-500/5 border-violet-500/10";
  };

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Clock className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-sans">Orders Grid</h1>
          <p className="text-sm text-zinc-500 mt-1 font-sans">Monitor payments, dispatch status, and client purchases.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 px-4 py-2 rounded-xl">
          <ListOrdered className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold text-zinc-300 font-sans">{orders.length} total orders</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order code, address, phone, or method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table List */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-bold text-zinc-200 font-sans">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm font-sans">
                No orders found matching the filter or in storage history.
              </div>
            ) : (
              <table className="w-full text-sm text-zinc-300">
                <thead className="bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider text-left font-sans">
                  <tr>
                    <th className="px-6 py-4">Order Code</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Fulfillment</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        selectedOrder?.id === order.id ? "bg-white/[0.03]" : ""
                      }`}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-violet-400">
                        {order.code || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(order.status || "PENDING")}`}>
                          {order.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200">
                        LKR {(order.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Order Details panel */}
        <div className={
          isDetailOpen && selectedOrder
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 lg:relative lg:inset-auto lg:z-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:col-span-1"
            : "lg:col-span-1 hidden lg:block"
        }>
          {isDetailOpen && selectedOrder ? (
            <div className="glass p-6 rounded-2xl border border-white/10 bg-zinc-950/95 lg:bg-transparent text-left space-y-6 animate-slide-in w-full max-w-lg lg:max-w-none shadow-2xl lg:shadow-none overflow-y-auto max-h-[90vh] lg:max-h-none">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-200 font-mono mt-0.5 text-violet-400">
                    {selectedOrder.code || "N/A"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider font-sans">
                  Update Status
                </label>
                <div className="relative">
                  <select
                    value={selectedOrder.status || "PENDING"}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Shipping Metadata */}
              <div className="space-y-4 text-sm text-zinc-300 font-sans">
                <div className="flex gap-3">
                  <Calendar className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Order Date</p>
                    <p className="text-zinc-300 mt-0.5">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CreditCard className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Payment Mode</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadge(selectedOrder.paymentMethod || "CARD")}`}>
                      {(selectedOrder.paymentMethod || "CARD").replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Delivery Address</p>
                    <p className="text-zinc-305 mt-0.5 leading-relaxed">
                      {selectedOrder.shippingAddress || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Phone Number</p>
                    <p className="text-zinc-305 mt-0.5">
                      {selectedOrder.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="border-t border-white/5 pt-4 space-y-3 font-sans">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Purchased Items
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3 text-xs">
                      <div>
                        <p className="font-bold text-zinc-200">{item.name}</p>
                        <p className="text-zinc-500 mt-0.5">{(item.quantity || 1)} x LKR {(item.price || 0).toFixed(2)}</p>
                      </div>
                      <span className="font-semibold text-zinc-300">
                        LKR {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-zinc-200 border-t border-white/5 text-sm">
                  <span>Grand Total</span>
                  <span className="text-violet-400 text-base">LKR {(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl border border-white/5 text-center text-zinc-500 text-sm hidden lg:block font-sans">
              <Eye className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              Select an order from the list to review addresses, products, and update order fulfillment statuses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
