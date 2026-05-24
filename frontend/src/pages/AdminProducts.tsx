import { useEffect, useState } from "react";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import type { MockProduct } from "@/lib/mockData";
import { useToastStore } from "@/store/useToastStore";
import { Plus, Edit, Trash2 } from "lucide-react";

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
    const fetchProducts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          // Map categoryId from category_id in case it is snake_case
          const mapped = data.map((p: any) => ({
            ...p,
            categoryId: p.category_id || p.categoryId,
            categoryName: p.categoryName || (p.category ? p.category.name : "Catalog"),
          }));
          setProducts(mapped);
        } else {
          console.error("Failed to fetch products:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !description || !price || !stock) {
      showToast("Please fill in all standard fields.", "error");
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);
    const selectedCategory = MOCK_CATEGORIES.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : "Catalog";
    const finalImg = imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const payload = {
      name,
      slug,
      description,
      price: priceNum,
      stock: stockNum,
      category_id: categoryId,
      images: [finalImg],
    };

    try {
      if (isEditing && editingId) {
        // Update
        const res = await fetch(`${backendUrl}/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updatedProduct = await res.json();
          const updated = products.map((p) => {
            if (p.id === editingId) {
              return {
                ...updatedProduct,
                categoryId: updatedProduct.category_id || updatedProduct.categoryId,
                categoryName,
              };
            }
            return p;
          });
          setProducts(updated);
          showToast("Product updated successfully!", "success");
          setIsEditing(false);
          setEditingId(null);
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Failed to update product.", "error");
        }
      } else {
        // Create
        const res = await fetch(`${backendUrl}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newProduct = await res.json();
          const mappedNew = {
            ...newProduct,
            categoryId: newProduct.category_id || newProduct.categoryId,
            categoryName,
          };
          setProducts([mappedNew, ...products]);
          showToast("Product created successfully!", "success");
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Failed to create product.", "error");
        }
      }

      // Reset Form
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");
    } catch (err) {
      console.error(err);
      showToast("Error saving product.", "error");
    }
  };

  const handleEditClick = (p: MockProduct) => {
    setIsEditing(true);
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setCategoryId(p.categoryId || (p as any).category_id);
    setImageUrl(p.images[0] || "");
  };

  const handleDelete = async (id: string) => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${backendUrl}/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        showToast("Product deleted successfully.", "info");
      } else {
        showToast("Failed to delete product.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting product.", "error");
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 font-sans">Products Catalog CRUD</h1>
        <p className="text-sm text-zinc-500 mt-1 font-sans">Manage active catalog items, stock limits, and prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CRUD Form */}
        <div className="lg:col-span-1 text-left">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2 font-sans">
              <Plus className="w-4.5 h-4.5 text-violet-400" />
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
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
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. mechanical-keyboard"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-400 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
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
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                    Price (LKR)
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
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
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
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-950">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
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
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="lg:col-span-2 text-left">
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-bold text-zinc-200 font-sans">Catalog Registry ({products.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-zinc-300">
                <thead className="bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider text-left font-sans">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Price</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
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
                        LKR {p.price.toFixed(2)}
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
                            className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
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
