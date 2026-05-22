"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { Lock, Mail, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const showToast = useToastStore((state) => state.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter your credentials.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        showToast("Invalid credentials. Try our quick-access shortcuts below!", "error");
      } else {
        showToast("Logged in successfully!", "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      showToast("Authentication failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: "customer" | "admin") => {
    setIsLoading(true);
    const mockEmail = role === "admin" ? "admin@shopnow.com" : "customer@shopnow.com";
    const mockPass = role === "admin" ? "admin123" : "customer123";

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: mockEmail,
        password: mockPass,
        callbackUrl,
      });

      if (res?.error) {
        showToast("Failed to authenticate shortcut account.", "error");
      } else {
        showToast(`Logged in successfully as ${role.toUpperCase()}!`, "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      showToast("Shortcut login failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10 text-left">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Sign in to your premium account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </button>
      </form>

      {/* Quick shortcuts */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-violet-400" />
          Quick Access Shortcuts (Sandbox)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin("customer")}
            disabled={isLoading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-violet-600/5 hover:bg-violet-600/10 border border-violet-500/10 hover:border-violet-500/20 text-zinc-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
          >
            <span>Customer Login</span>
            <span className="text-[10px] text-zinc-500 mt-1">customer@shopnow.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin("admin")}
            disabled={isLoading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-pink-600/5 hover:bg-pink-600/10 border border-pink-500/10 hover:border-pink-500/20 text-zinc-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
          >
            <span>Admin Login</span>
            <span className="text-[10px] text-zinc-500 mt-1">admin@shopnow.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="glass p-8 rounded-2xl border border-white/5 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
