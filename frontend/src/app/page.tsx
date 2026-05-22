import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = MOCK_CATEGORIES;
  const products = MOCK_PRODUCTS.slice(0, 4); // Show first 4 as featured

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass border border-white/15 text-violet-300 mb-6 animate-pulse-subtle">
          ✨ Redefining Digital Shopping
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8">
          Next-Gen Commerce <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            For Curious Minds.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
          Discover a curated catalog of premium electronics, contemporary fashion, and modern home goods designed with visual elegance and peak utility.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
          >
            Explore Shop
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass hover:bg-white/5 font-semibold text-zinc-200 border border-white/10 transition-all"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-white/5 bg-[#09090f]/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <div className="p-3 rounded-lg bg-violet-600/10 text-violet-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-200">Express Delivery</h3>
              <p className="text-xs text-zinc-400">Insured trackable shipping worldwide</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <div className="p-3 rounded-lg bg-pink-600/10 text-pink-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-200">Secure Payments</h3>
              <p className="text-xs text-zinc-400">100% encrypted checkout with Stripe</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <div className="p-3 rounded-lg bg-amber-600/10 text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-200">Easy Returns</h3>
              <p className="text-xs text-zinc-400">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-sm text-zinc-500 mt-2">Find items customized to your interests</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-violet-400 hover:text-violet-350 transition-colors flex items-center gap-1">
            See all catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative h-40 sm:h-52 rounded-2xl overflow-hidden glass border border-white/5 flex flex-col justify-end p-4 transition-all hover:border-white/15"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              </div>
              <div className="relative z-10 text-left">
                <h3 className="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-zinc-400 mt-1 block group-hover:text-zinc-300">
                  Shop now &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Featured Masterpieces</h2>
          <p className="text-sm sm:text-base text-zinc-500 mt-3 max-w-lg mx-auto">
            Explore our community&apos;s top picks. Made with high quality materials and built to perform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden glass-card"
            >
              {/* Image Container */}
              <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white tracking-wide uppercase">
                  {product.categoryName}
                </span>
              </div>

              {/* Info Container */}
              <div className="p-5 flex-grow flex flex-col justify-between text-left">
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                  <span className="font-bold text-lg text-zinc-200">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors flex items-center gap-0.5">
                    View detail &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
