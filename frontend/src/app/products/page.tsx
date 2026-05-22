import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import ProductFilters from "@/components/ProductFilters";

interface ProductItem {
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
  active: boolean;
}

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, search, minPrice, maxPrice, inStock } = params;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const searchParamsObj = new URLSearchParams();
  if (category) searchParamsObj.append("category", category);
  if (search) searchParamsObj.append("search", search);
  if (minPrice) searchParamsObj.append("minPrice", minPrice);
  if (maxPrice) searchParamsObj.append("maxPrice", maxPrice);
  if (inStock) searchParamsObj.append("inStock", inStock);

  let products: ProductItem[] = [];
  try {
    const res = await fetch(`${backendUrl}/api/products?${searchParamsObj.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch products from backend:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
            Catalog Products
          </h1>
        </div>
        <div className="text-sm text-zinc-400">
          Showing <span className="text-zinc-200 font-bold">{products.length}</span> items
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="glass rounded-2xl border border-white/5 p-16 text-center">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-300">No products found</h3>
              <p className="text-sm text-zinc-500 mt-2">
                Try adjusting your filters or search keywords to find what you are looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      sizes="(max-width: 768px) 100vw, 20vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    {product.stock <= 0 ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-white/5 uppercase">
                        Out of stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white uppercase">
                        Low Stock ({product.stock})
                      </span>
                    ) : null}
                    
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-600 text-white tracking-wide">
                      {product.category?.name || product.categoryName || "Catalog"}
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
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
