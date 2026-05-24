import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  FileText,
  Truck,
  RotateCcw,
  Mail,
  Settings,
  Loader2,
  ArrowLeft
} from "lucide-react";

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/login?callbackUrl=" + pathname);
    } else if (status === "authenticated" && (!user || user.role !== "ADMIN")) {
      navigate("/");
    }
  }, [status, user, navigate, pathname]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080c]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
      </div>
    );
  }

  // Double check authorization
  if (status === "unauthenticated" || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08080c] px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-zinc-200">Access Denied</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm">
          You do not have the required administrative permissions to access this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-violet-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const sidebarLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products CRUD", href: "/admin/products", icon: ShoppingBag },
    { label: "Orders Grid", href: "/admin/orders", icon: ListOrdered },
    { label: "Invoice Audit", href: "/admin/invoices", icon: FileText },
    { label: "Shipping & Drivers", href: "/admin/shipping", icon: Truck },
    { label: "Return Requests", href: "/admin/returns", icon: RotateCcw },
    { label: "Customer Inquiries", href: "/admin/messages", icon: Mail },
    { label: "Shop Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#08080c] text-left">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 shrink-0 border-r border-white/5 bg-[#050508]/60 backdrop-blur-md flex flex-col p-4">
        <div className="pb-6 border-b border-white/5 mb-6 hidden md:block">
          <span className="text-xs font-bold text-violet-400 tracking-widest uppercase font-sans">
            Control Center
          </span>
          <h2 className="text-lg font-extrabold text-zinc-200 mt-1 font-sans">Admin Dashboard</h2>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap font-sans ${
                  isActive
                    ? "bg-violet-600/10 text-violet-300 border border-violet-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Viewport */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto text-left">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
