"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, User, ChevronDown, Menu, X, LogOut, Shield, Settings, ShoppingBag } from "lucide-react";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Books", slug: "books" },
  { name: "Sports", slug: "sports" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Cart items count
  const cartItems = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Close dropdowns on path change
  useEffect(() => {
    setIsOpen(false);
    setIsCatOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              ShopNow
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/" ? "text-white" : "text-zinc-400"
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCatOpen(!isCatOpen);
                  setIsProfileOpen(false);
                }}
                className="flex items-center text-sm font-medium transition-colors hover:text-white text-zinc-400 gap-1 focus:outline-none"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`} />
              </button>

              {isCatOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl glass border border-white/5 shadow-2xl p-1 animate-slide-in">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                  >
                    All Products
                  </Link>
                  <div className="h-px bg-white/5 my-1" />
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname.startsWith("/products") && !pathname.includes("category") ? "text-white" : "text-zinc-400"
              }`}
            >
              Shop All
            </Link>
            
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/about" ? "text-white" : "text-zinc-400"
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/contact" ? "text-white" : "text-zinc-400"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white ring-2 ring-zinc-950 animate-pulse-subtle">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsCatOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-sm font-medium text-zinc-200 focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                    {session.user?.name?.slice(0, 2) || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{session.user?.name || "Profile"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl glass border border-white/5 shadow-2xl p-1 animate-slide-in">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-zinc-200">{session.user?.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors mt-1"
                    >
                      <User className="w-4 h-4" />
                      My Dashboard
                    </Link>

                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 hover:text-violet-200 transition-colors mt-1"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="h-px bg-white/5 my-1" />

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/cart"
              className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass border-b border-white/5 animate-slide-in px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === "/" ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="block px-2 py-1 text-sm rounded hover:bg-white/5 text-zinc-400 hover:text-white"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="block px-2 py-1 text-sm rounded hover:bg-white/5 text-zinc-400 hover:text-white"
              >
                All Products
              </Link>
            </div>
          </div>

          <Link
            href="/about"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === "/about" ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === "/contact" ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Contact
          </Link>

          <div className="h-px bg-white/5 my-2" />

          {session ? (
            <div className="space-y-1 pt-1">
              <div className="px-3 py-2">
                <p className="text-xs text-zinc-400">Signed in as</p>
                <p className="text-sm font-semibold truncate text-zinc-200">{session.user?.name || session.user?.email}</p>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-base font-medium"
              >
                <User className="w-5 h-5" />
                My Dashboard
              </Link>

              {session.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-violet-300 hover:text-violet-200 bg-violet-600/5 text-base font-medium"
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 text-base font-medium text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2.5 text-base font-semibold rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
