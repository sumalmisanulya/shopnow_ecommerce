import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, CreditCard, Loader2 } from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isLoading, setIsLoading] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Delivery states
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + tax;

  const validateCard = () => {
    if (!cardName.trim()) {
      showToast("Please enter the cardholder name.", "error");
      return false;
    }
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanNum)) {
      showToast("Please enter a valid 16-digit card number.", "error");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      showToast("Please enter expiry date in MM/YY format.", "error");
      return false;
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
      showToast("Please enter a valid 3 or 4-digit CVV.", "error");
      return false;
    }
    return true;
  };

  const validateCodDetails = () => {
    if (!shippingName.trim()) {
      showToast("Please enter the receiver's name.", "error");
      return false;
    }
    if (!shippingPhone.trim()) {
      showToast("Please enter your contact phone number.", "error");
      return false;
    }
    if (!shippingAddress.trim()) {
      showToast("Please enter the delivery address.", "error");
      return false;
    }
    if (!shippingCity.trim()) {
      showToast("Please enter the delivery city.", "error");
      return false;
    }
    if (!shippingZip.trim()) {
      showToast("Please enter the ZIP code.", "error");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please sign in to proceed with checkout.", "error");
      navigate(`/login?callbackUrl=/cart`);
      return;
    }

    if (!paymentMethod) {
      showToast("Please select a payment method.", "error");
      return;
    }

    if (paymentMethod === "card") {
      if (!validateCard()) return;
    }

    if (paymentMethod === "cod") {
      if (!validateCodDetails()) return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const payload = {
        paymentMethod: paymentMethod === "cod" ? "CASH_ON_DELIVERY" : "CARD",
        shippingAddress: paymentMethod === "cod" 
          ? `${shippingAddress}, ${shippingCity}, ZIP ${shippingZip}` 
          : "123 Creative Studio, Design District, NY 10001",
        phone: paymentMethod === "cod" ? shippingPhone : "+1 (555) 019-2834",
        userId: user.id,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
        totalPrice: total,
      };

      const res = await fetch(`${backendUrl}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Checkout failed");
      }

      const orderData = await res.json();

      showToast(
        paymentMethod === "card"
          ? "Payment authorized successfully!"
          : "Order confirmed under Cash on Delivery!",
        "success"
      );

      navigate(
        `/checkout/success?session_id=${orderData.id}&payment_method=${paymentMethod}&code=${orderData.code}&total=${orderData.total_price || orderData.totalPrice}&shipping_name=${encodeURIComponent(
          paymentMethod === "cod" ? shippingName : user.name
        )}&shipping_address=${encodeURIComponent(orderData.shipping_address || orderData.shippingAddress)}&phone=${encodeURIComponent(orderData.phone)}`
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An error occurred during checkout.", "error");
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
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-8 text-left font-sans">
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
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-semibold text-zinc-100 hover:text-white transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-0.5 font-medium">LKR {item.price.toFixed(2)} each</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-zinc-200 font-semibold text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-zinc-200 w-16 text-right font-sans">
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      removeItem(item.id);
                      showToast(`Removed ${item.name} from cart.`, "info");
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2 text-left">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 text-left">
            <h3 className="font-bold text-zinc-200 border-b border-white/5 pb-4 font-sans">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-medium">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-zinc-200 font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    `LKR ${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (Est. 8%)</span>
                <span className="text-zinc-200 font-medium">LKR {tax.toFixed(2)}</span>
              </div>
              
              {shipping > 0 && (
                <div className="bg-violet-600/5 border border-violet-500/10 rounded-lg p-2.5 text-xs text-violet-300 text-center font-sans">
                  Add <span className="font-bold">LKR {(100 - subtotal).toFixed(2)}</span> more to unlock <span className="font-bold">FREE Shipping</span>!
                </div>
              )}
              
              <div className="border-t border-white/5 pt-4 flex justify-between font-bold text-base text-zinc-100">
                <span>Total</span>
                <span className="text-xl bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent">
                  LKR {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-4 border-t border-white/5 font-sans">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-violet-600/10 border-violet-500 text-violet-300"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1.5" />
                  <span>Pay with Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                    paymentMethod === "cod"
                      ? "bg-violet-600/10 border-violet-500 text-violet-300"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mb-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="space-y-3 pt-4 border-t border-white/5 animate-fade-in font-sans">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Card Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Card Number"
                      maxLength={19}
                      required
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
                        setCardNumber(formatted);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Expiry (MM/YY)"
                      maxLength={5}
                      required
                      value={cardExpiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 2) {
                          value = value.substring(0, 2) + "/" + value.substring(2, 4);
                        }
                        setCardExpiry(value);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={4}
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Details Form for Cash on Delivery */}
            {paymentMethod === "cod" && (
              <div className="space-y-3 pt-4 border-t border-white/5 animate-fade-in font-sans">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Delivery Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Receiver's Full Name"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Contact Phone Number"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Delivery Address (Street, Apt)"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      required
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold text-white transition-all shadow-lg hover:shadow-violet-600/10 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === "cod" ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Place COD Order
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {paymentMethod === "card" ? "Pay with Card" : "Proceed to Checkout"}
                    </>
                  )}
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
