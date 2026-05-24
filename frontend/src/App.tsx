import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

// Pages
import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import ContactPage from "@/pages/Contact";
import LoginPage from "@/pages/Login";
import ProductsPage from "@/pages/Products";
import ProductDetailPage from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import CheckoutSuccessPage from "@/pages/CheckoutSuccess";
import ProfilePage from "@/pages/Profile";

// Admin Layout and Pages
import AdminLayout from "@/pages/AdminLayout";
import AdminDashboardPage from "@/pages/AdminDashboard";
import AdminProductsPage from "@/pages/AdminProducts";
import AdminOrdersPage from "@/pages/AdminOrders";
import AdminInvoicesPage from "@/pages/AdminInvoices";
import AdminShippingPage from "@/pages/AdminShipping";
import AdminReturnsPage from "@/pages/AdminReturns";
import AdminMessagesPage from "@/pages/AdminMessages";
import AdminSettingsPage from "@/pages/AdminSettings";

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080c] text-[#f3f3f7] antialiased">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 bg-[#050508]/80 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} ShopNow Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="text-xs text-zinc-550 hover:text-zinc-300 transition-colors">About</Link>
            <Link to="/contact" className="text-xs text-zinc-550 hover:text-zinc-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          {/* Main User Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/:slug" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="shipping" element={<AdminShippingPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
