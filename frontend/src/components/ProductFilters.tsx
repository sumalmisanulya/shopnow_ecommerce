"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mockData";

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state initialized from searchParams
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const currentCategory = searchParams.get("category") || "";

  // Update query params helper
  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "" || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    startTransition(() => {
      router.push("/products");
    });
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="font-bold text-zinc-200 flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-400" />
          Filter Catalog
        </h3>
        {(search || minPrice || maxPrice || inStock || currentCategory) && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateFilters("search", e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 pl-9 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Categories list */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Category
        </label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => updateFilters("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              currentCategory === ""
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/20 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Categories
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateFilters("category", cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentCategory === cat.slug
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20 font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price filter inputs */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Price Range ($)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              updateFilters("minPrice", e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          <span className="text-zinc-600 text-sm">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              updateFilters("maxPrice", e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Availability check */}
      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="inStockOnly"
          checked={inStock}
          onChange={(e) => {
            setInStock(e.target.checked);
            updateFilters("inStock", e.target.checked);
          }}
          className="w-4 h-4 rounded border-white/10 bg-white/5 text-violet-600 focus:ring-violet-500"
        />
        <label htmlFor="inStockOnly" className="text-sm text-zinc-300 cursor-pointer select-none">
          In Stock Only
        </label>
      </div>

      {isPending && (
        <div className="text-xs text-zinc-500 text-center animate-pulse">
          Applying updates...
        </div>
      )}
    </div>
  );
}
