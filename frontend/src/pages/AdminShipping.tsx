import { useEffect, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  Edit, 
  AlertCircle,
  Trash2
} from "lucide-react";

interface Order {
  id: string;
  code: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  shippingAddress: string;
  phone: string;
}

interface Shipping {
  id: string;
  orderId: string;
  orderCode: string;
  driverName: string;
  vehicleType: string;
  vehicleNumber: string;
  location: string;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED";
  updatedAt: string;
}

export default function AdminShippingPage() {
  const showToast = useToastStore((state) => state.showToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form states for assignment
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderCode, setSelectedOrderCode] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [location, setLocation] = useState("Warehouse");
  const [shippingStatus, setShippingStatus] = useState<"PENDING" | "IN_TRANSIT" | "DELIVERED">("PENDING");
  const [editingShippingId, setEditingShippingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders for shipping:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
    const localShippings = JSON.parse(localStorage.getItem("mock_shipping") || "[]");
    setShippings(localShippings);
  }, []);

  const saveShippings = (updatedShippings: Shipping[]) => {
    setShippings(updatedShippings);
    localStorage.setItem("mock_shipping", JSON.stringify(updatedShippings));
  };

  const handleOpenAssign = (order: Order, existingShipping?: Shipping) => {
    setSelectedOrderId(order.id);
    setSelectedOrderCode(order.code);
    if (existingShipping) {
      setEditingShippingId(existingShipping.id);
      setDriverName(existingShipping.driverName);
      setVehicleType(existingShipping.vehicleType);
      setVehicleNumber(existingShipping.vehicleNumber);
      setLocation(existingShipping.location);
      setShippingStatus(existingShipping.status);
    } else {
      setEditingShippingId(null);
      setDriverName("");
      setVehicleType("Motorcycle");
      setVehicleNumber("");
      setLocation("Sorting Center");
      setShippingStatus("PENDING");
    }
    setIsAssigning(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !vehicleNumber) {
      showToast("Please fill in driver name and vehicle number.", "error");
      return;
    }

    if (editingShippingId) {
      // Edit existing assignment
      const updated = shippings.map((s) => {
        if (s.id === editingShippingId) {
          return {
            ...s,
            driverName,
            vehicleType,
            vehicleNumber,
            location,
            status: shippingStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });
      saveShippings(updated);
      showToast(`Shipping record updated for order ${selectedOrderCode}`, "success");
    } else {
      // Create new assignment
      const newShipping: Shipping = {
        id: "shp_" + Math.random().toString(36).substring(2, 9),
        orderId: selectedOrderId!,
        orderCode: selectedOrderCode,
        driverName,
        vehicleType,
        vehicleNumber,
        location,
        status: shippingStatus,
        updatedAt: new Date().toISOString(),
      };
      saveShippings([newShipping, ...shippings]);
      showToast(`Driver assigned to order ${selectedOrderCode}!`, "success");
    }

    setIsAssigning(false);
    setSelectedOrderId(null);
    setEditingShippingId(null);
  };

  const handleDeleteShipping = (shippingId: string) => {
    if (confirm("Are you sure you want to delete this shipping assignment?")) {
      const updated = shippings.filter((s) => s.id !== shippingId);
      saveShippings(updated);
      showToast("Shipping details deleted.", "info");
    }
  };

  // Find orders that don't have shipping assigned yet
  const unassignedOrders = orders.filter(
    (order) => !shippings.some((s) => s.orderId === order.id) && order.status !== "CANCELLED"
  );

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "IN_TRANSIT":
        return "bg-violet-500/10 text-violet-300 border border-violet-500/20 animate-pulse-subtle";
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Shipping & Drivers</h1>
        <p className="text-sm text-zinc-500 mt-1">Assign logistics, manage delivery personnel, and update transit location points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unassigned orders list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/5 text-left space-y-4">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
              Pending Shipments ({unassignedOrders.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Orders that require a logistics assignment to begin delivery.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {unassignedOrders.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">All orders have been assigned drivers!</p>
              ) : (
                unassignedOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-200 font-mono text-violet-400">{order.code}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{order.paymentMethod.replace(/_/g, " ")}</p>
                    </div>
                    <button
                      onClick={() => handleOpenAssign(order)}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Assigned Shipments Grid */}
        <div className="lg:col-span-2 space-y-6 text-left">
          {isAssigning && (
            <div className="glass p-6 rounded-2xl border border-violet-500/20 text-left space-y-4 animate-slide-in">
              <h3 className="font-bold text-zinc-200 flex items-center gap-2 border-b border-white/5 pb-3">
                <Truck className="w-5 h-5 text-violet-400" />
                {editingShippingId ? `Edit Shipment for ${selectedOrderCode}` : `Assign Logistics to ${selectedOrderCode}`}
              </h3>

              <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Miller"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NY-9844-Z"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Heavy Truck">Heavy Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Fulfillment Status
                  </label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value as "PENDING" | "IN_TRANSIT" | "DELIVERED")}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Current Location / Station
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Queens Dispatch Hub"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-2 pt-2 border-t border-white/5">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer text-sm"
                  >
                    {editingShippingId ? "Update Shipment" : "Confirm Assignment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssigning(false);
                      setSelectedOrderId(null);
                      setEditingShippingId(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logistics registry log */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-zinc-200">Active Deliveries ({shippings.length})</h3>
            </div>

            <div className="p-4">
              {shippings.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-12">No active drivers or shipments registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shippings.map((ship) => {
                    const matchedOrder = orders.find((o) => o.id === ship.orderId);
                    return (
                      <div 
                        key={ship.id} 
                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-white/10 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-violet-400 font-mono">{ship.orderCode}</span>
                            <h4 className="font-bold text-zinc-200 text-sm mt-1">{ship.driverName}</h4>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${getShippingStatusBadge(ship.status)}`}>
                            {ship.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{ship.vehicleType} • <span className="font-mono text-zinc-300">{ship.vehicleNumber}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Last Location: <span className="text-zinc-300">{ship.location}</span></span>
                          </div>
                          {matchedOrder && (
                            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                              <Navigation className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                              <span className="text-[10px] text-zinc-500 line-clamp-2">{matchedOrder.shippingAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1.5 justify-end">
                          <button
                            onClick={() => {
                              const order = orders.find((o) => o.id === ship.orderId);
                              if (order) handleOpenAssign(order, ship);
                            }}
                            className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShipping(ship.id)}
                            className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
