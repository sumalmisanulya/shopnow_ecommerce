"use client";

import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MockProduct } from "@/lib/mockData";
import { useToastStore } from "@/store/useToastStore";
import { Plus, Edit, Trash2, Check, X, ShieldAlert } from "lucide-react";

export default function AdminProductsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [products, setProducts] = useState<MockProduct[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("cat-electronics");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Load mock database products from localstorage or initialize with MOCK_PRODUCTS
    const dbProducts = localStorage.getItem("mock_db_products");
    if (dbProducts) {
      setProducts(JSON.parse(dbProducts));
    } else {
      setProducts(MOCK_PRODUCTS);
      localStorage.setItem("mock_db_products", JSON.stringify(MOCK_PRODUCTS));
    }
  }, []);

  const saveProducts = (updatedProds: MockProduct[]) => {
    setProducts(updatedProds);
    localStorage.setItem("mock_db_products", JSON.stringify(updatedProds));
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !description || !price || !stock) {
      showToast("Please fill in all standard fields.", "error");
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);
    const selectedCategory = MOCK_CATEGORIES.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : "Catalog";

    // Standard fallback image if none provided
    const finalImg = imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

    if (isEditing && editingId) {
      // Update
      const updated = products.map((p) => {
        if (p.id === editingId) {
          return {
            ...p,
            name,
            slug,
            description,
            price: priceNum,
            stock: stockNum,
            categoryId,
            categoryName,
            images: [finalImg],
          };
        }
        return p;
      });
      saveProducts(updated);
      showToast("Product updated successfully!", "success");
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Create
      const newProd: MockProduct = {
        id: "prod-" + Math.floor(1000 + Math.random() * 9000),
        name,
        slug,
        description,
        price: priceNum,
        stock: stockNum,
        categoryId,
        categoryName,
        images: [finalImg],
        active: true,
      };
      saveProducts([newProd, ...products]);
      showToast("Product created successfully!", "success");
    }

    // Reset Form
    setName("");
    setSlug("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
  };

  const handleEditClick = (p: MockProduct) => {
    setIsEditing(true);
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setCategoryId(p.categoryId);
    setImageUrl(p.images[0] || "");
  };

  const handleDelete = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    showToast("Product deleted from sandbox.", "info");
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Products Catalog CRUD</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage active catalog items, stock limits, and prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CRUD Form */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 text-left space-y-6">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-violet-400" />
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Keyboard"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. mechanical-keyboard"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-450 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize product specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-950">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer text-sm"
                >
                  {isEditing ? "Save Edits" : "Create Product"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                      setName("");
                      setSlug("");
                      setDescription("");
                      setPrice("");
                      setStock("");
                      setImageUrl("");
                    }}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl border border-white/5 overflow-hidden text-left">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-bold text-zinc-200">Catalog Registry ({products.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-zinc-300">
                <thead className="bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Price</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-zinc-900">
                            <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{p.categoryName}</td>
                      <td className="px-6 py-4 text-center font-semibold text-zinc-200">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stock === 0
                              ? "bg-rose-500/10 text-rose-400"
                              : p.stock <= 5
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
