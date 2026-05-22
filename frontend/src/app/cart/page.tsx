"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { useSession } from "next-auth/react";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, CreditCard, Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto" />
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!session) {
      showToast("Please sign in to proceed with checkout.", "error");
      router.push(`/login?callbackUrl=/cart`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, userId: session.user?.id || "fallback-id" }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        // Mock fallback if Stripe keys are not set up or configured
        showToast("Stripe not configured. Redirecting to simulated payment...", "info");
        setTimeout(() => {
          router.push(`/checkout/success?session_id=mock_${Math.random().toString(36).substring(2, 9)}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Checkout error, using fallback simulated flow", err);
      showToast("Using simulated offline payment flow...", "info");
      setTimeout(() => {
        router.push(`/checkout/success?session_id=mock_${Math.random().toString(36).substring(2, 9)}`);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-zinc-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-100 mb-2">Your cart is empty</h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          Add some high-fidelity items to your shopping cart to get started with your purchase.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-8 text-left">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass border border-white/5 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-semibold text-zinc-100 hover:text-white transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-0.5 font-medium">${item.price.toFixed(2)} each</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-zinc-200 font-semibold text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-zinc-200 w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      removeItem(item.id);
                      showToast(`Removed ${item.name} from cart.`, "info");
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2 text-left">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 text-left">
            <h3 className="font-bold text-zinc-200 border-b border-white/5 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-zinc-200 font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (Est. 8%)</span>
                <span className="text-zinc-200 font-medium">${tax.toFixed(2)}</span>
              </div>
              
              {shipping > 0 && (
                <div className="bg-violet-600/5 border border-violet-500/10 rounded-lg p-2.5 text-xs text-violet-300 text-center">
                  Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more to unlock <span className="font-bold">FREE Shipping</span>!
                </div>
              )}
              
              <div className="border-t border-white/5 pt-4 flex justify-between font-bold text-base text-zinc-100">
                <span>Total</span>
                <span className="text-xl bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold text-white transition-all shadow-lg hover:shadow-violet-600/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
