"use client";

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

  useEffect(() => {
    setMounted(true);
    const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
    setOrders(localOrders);
  }, []);

  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem("mock_orders", JSON.stringify(updatedOrders));
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    saveOrders(updated);
    showToast(`Order status updated to ${newStatus}`, "success");
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order from history?")) {
      const updated = orders.filter((order) => order.id !== orderId);
      saveOrders(updated);
      showToast("Order removed from database", "info");
      if (selectedOrder && selectedOrder.id === orderId) {
        setIsDetailOpen(false);
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.code.toLowerCase().includes(query) ||
      order.shippingAddress.toLowerCase().includes(query) ||
      order.phone.includes(query) ||
      order.paymentMethod.toLowerCase().includes(query)
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
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100">Orders Grid</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor payments, dispatch status, and client purchases.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl">
          <ListOrdered className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold text-zinc-300">{orders.length} total orders</span>
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
            <h3 className="font-bold text-zinc-200">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No orders found matching the filter or in storage history.
              </div>
            ) : (
              <table className="w-full text-sm text-zinc-300">
                <thead className="bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">Order Code</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Fulfillment</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
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
                        {order.code}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-450 transition-colors"
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
        <div className="lg:col-span-1">
          {isDetailOpen && selectedOrder ? (
            <div className="glass p-6 rounded-2xl border border-white/5 text-left space-y-6 animate-slide-in">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase">Order Details</span>
                  <h3 className="text-lg font-bold text-zinc-200 font-mono mt-0.5 text-violet-400">
                    {selectedOrder.code}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Update Status
                </label>
                <div className="relative">
                  <select
                    value={selectedOrder.status}
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
              <div className="space-y-4 text-sm text-zinc-300">
                <div className="flex gap-3">
                  <Calendar className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Order Date</p>
                    <p className="text-zinc-300 mt-0.5">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CreditCard className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Payment Mode</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadge(selectedOrder.paymentMethod)}`}>
                      {selectedOrder.paymentMethod.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Delivery Address</p>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Phone Number</p>
                    <p className="text-zinc-300 mt-0.5">
                      {selectedOrder.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Purchased Items
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3 text-xs">
                      <div>
                        <p className="font-bold text-zinc-200">{item.name}</p>
                        <p className="text-zinc-500 mt-0.5">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <span className="font-semibold text-zinc-300">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-zinc-200 border-t border-white/5 text-sm">
                  <span>Grand Total</span>
                  <span className="text-violet-400 text-base">${selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl border border-white/5 text-center text-zinc-500 text-sm hidden lg:block">
              <Eye className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
              Select an order from the list to review addresses, products, and update order fulfillment statuses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
