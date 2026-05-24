import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { ShoppingCart, Heart, ShieldCheck, Truck, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  category?: { name: string };
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
        } else {
          console.error("Failed to fetch product:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-xl font-bold text-zinc-300">Product not found</h3>
        <p className="text-sm text-zinc-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="inline-flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 mt-6">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: quantity,
      image: product.images[0],
      stock: product.stock,
    });
    showToast(`Added ${quantity} x ${product.name} to your cart.`, "success");
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;
  const catName = product.category?.name || product.categoryName || "Catalog";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Link to="/products" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-white/5 bg-zinc-900/40">
            <img
              src={selectedImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden glass border transition-all cursor-pointer ${
                    selectedImage === img
                      ? "border-violet-500 ring-2 ring-violet-500/20"
                      : "border-white/5 hover:border-white/15"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-600/10 text-violet-300 border border-violet-500/10">
              {catName}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-zinc-100">LKR {product.price.toFixed(2)}</p>

            {/* Stock Level Indicator */}
            <div className="flex items-center gap-2 text-sm pt-2">
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse">
                  <AlertTriangle className="w-4 h-4" /> Only {product.stock} items left in stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" /> In stock (ready to ship)
                </span>
              )}
            </div>

            <p className="text-zinc-400 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-zinc-400">Qty:</span>
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-zinc-200 font-semibold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-grow flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white transition-all shadow-lg hover:shadow-violet-600/10 cursor-pointer disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="px-4 py-4 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-300 cursor-pointer">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="pt-6">
            <div className="flex border-b border-white/5 gap-6 mb-4">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                  activeTab === "description" ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Overview
                {activeTab === "description" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                  activeTab === "shipping" ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Shipping & Returns
                {activeTab === "shipping" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded" />
                )}
              </button>
            </div>

            <div className="text-sm text-zinc-400 leading-relaxed min-h-24">
              {activeTab === "description" ? (
                <div className="space-y-3">
                  <p>Our products are sourced using top tier manufacturing standards and quality inspection processes.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Premium robust finish material.</li>
                    <li>Designed to provide maximum comfort and utility.</li>
                    <li>Equipped with state of the art safety standard controls.</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Truck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <p>Free standard worldwide shipping on orders above LKR 10,000. Dispatched within 24-48 business hours.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <p>Returns are fully covered. Submit an easy return within 30 days of delivery using your dashboard profile.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
