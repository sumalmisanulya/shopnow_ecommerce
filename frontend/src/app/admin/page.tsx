"use client";

import { useEffect, useState } from "react";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Activity,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  code: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  items: any[];
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnsCount, setReturnsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Load mock orders
    const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
    setOrders(localOrders);

    // Load mock returns
    const localReturns = JSON.parse(localStorage.getItem("mock_returns") || "[]");
    setReturnsCount(localReturns.filter((r: any) => r.status === "PENDING").length);

    // Calculate low stock products (stock <= 5)
    const dbProducts = JSON.parse(localStorage.getItem("mock_db_products") || "[]");
    const catalog = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;
    const lowStock = catalog.filter((p: any) => p.stock <= 5).length;
    setLowStockCount(lowStock);
  }, []);

  // Compute stats
  const totalSales = orders.reduce((sum, ord) => sum + ord.totalPrice, 0);
  const totalOrders = orders.length;

  const statCards = [
    {
      title: "Total Sales",
      value: `$${totalSales.toFixed(2)}`,
      desc: "Simulated order volume",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Orders Logged",
      value: String(totalOrders),
      desc: "Successfully registered transactions",
      icon: ShoppingBag,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
    },
    {
      title: "Low Stock Items",
      value: String(lowStockCount),
      desc: "Items with stock ≤ 5 units",
      icon: AlertTriangle,
      color: lowStockCount > 0 
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse-subtle"
        : "text-zinc-500 bg-zinc-500/10 border-zinc-500/10"
    },
    {
      title: "Pending Returns",
      value: String(returnsCount),
      desc: "Active customer claims",
      icon: RotateCcw,
      color: returnsCount > 0
        ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse-subtle"
        : "text-zinc-500 bg-zinc-500/10 border-zinc-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Overview Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time statistics for operations and metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass p-6 rounded-2xl border ${card.color} text-left`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="p-2 rounded-lg bg-white/5">
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-zinc-100">{card.value}</h3>
                <p className="text-[11px] text-zinc-500 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 lg:col-span-2 text-left space-y-4">
          <h3 className="font-bold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-violet-400" />
            System Performance
          </h3>
          <div className="h-60 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
            <Activity className="w-8 h-8 text-zinc-700 animate-pulse mb-3" />
            <h4 className="text-sm font-semibold text-zinc-400">All Sandbox Systems Operational</h4>
            <p className="text-xs text-zinc-650 mt-1 max-w-xs leading-relaxed">
              API routes, NextAuth credential sessions, Stripe Webhook endpoints, and React PDF engines are initialized and running.
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 lg:col-span-1 text-left flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-200 flex items-center gap-2 mb-4">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all group"
              >
                <span>Add & Edit Products</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all group"
              >
                <span>Assign Driver / Dispatch</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </Link>
            </div>
          </div>
          <div className="bg-violet-600/5 border border-violet-500/10 rounded-xl p-4 mt-6 text-xs text-violet-300 leading-relaxed">
            📦 Tip: Creating mock checkouts as a customer automatically updates the stats and order feeds here in the Admin panel!
          </div>
        </div>
      </div>
    </div>
  );
}
