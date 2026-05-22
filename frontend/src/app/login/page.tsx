"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { Lock, Mail, Loader2, Eye, EyeOff, X, User } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const showToast = useToastStore((state) => state.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [isRegisteringLoading, setIsRegisteringLoading] = useState(false);

  // Recovery Modal (Credentials Helper only, no OTP)
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

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
        showToast("Invalid credentials. Try registering a new customer account or retrieve demo info!", "error");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = registerName.trim();
    if (!trimmedName) {
      showToast("Please enter your name.", "error");
      return;
    }
    const trimmedEmail = registerEmail.trim();
    if (!trimmedEmail) {
      showToast("Please enter your email.", "error");
      return;
    }
    if (!registerPassword) {
      showToast("Please enter a password.", "error");
      return;
    }

    setIsRegisteringLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: registerPassword,
        }),
      });

      let data: { error?: string } = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || `Server returned status ${res.status}` };
      }

      if (!res.ok) {
        showToast(data.error || "Failed to register.", "error");
      } else {
        showToast("Account created successfully! Logging you in...", "success");
        // Automatically sign in the user
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: trimmedEmail,
          password: registerPassword,
          callbackUrl,
        });

        if (signInRes?.error) {
          showToast("Account created, but automatic sign-in failed. Please sign in manually.", "error");
          setEmail(trimmedEmail);
          setPassword("");
          setIsRegistering(false);
        } else {
          showToast("Logged in successfully!", "success");
          router.push(callbackUrl);
          router.refresh();
        }

        // Reset registration fields
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      showToast(error.message || "Registration failed.", "error");
    } finally {
      setIsRegisteringLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10 text-left">
      {isRegistering ? (
        // Registration Form
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent font-sans">
              Create Account
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-sans">Register your customer credentials</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                New Password (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={registerShowPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  required
                  minLength={6}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setRegisterShowPassword(!registerShowPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {registerShowPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1.5 font-sans leading-relaxed">
                ⚠️ Create a <strong>new password</strong> for this shop account. Do <strong>NOT</strong> enter your personal email password.
              </p>
            </div>

            <button
              type="submit"
              disabled={isRegisteringLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isRegisteringLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsRegistering(false)}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors hover:underline cursor-pointer focus:outline-none font-sans"
            >
              Already have an account? Sign In
            </button>
          </div>
        </>
      ) : (
        // Sign In Form
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent font-sans">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-sans">Sign in to your premium account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(true)}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors hover:underline cursor-pointer focus:outline-none font-sans"
              >
                Forgot password or email?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6 font-sans">
            <button
              onClick={() => setIsRegistering(true)}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors hover:underline cursor-pointer focus:outline-none"
            >
              Don&apos;t have an account? Sign Up
            </button>
          </div>
        </>
      )}

      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md glass border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-slide-in">
            {/* Close Button */}
            <button
              onClick={() => setIsRecoveryOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent mb-4 font-sans">
              Account Recovery (Sandbox)
            </h2>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400 font-sans">
                In Sandbox mode, you can view the default preconfigured accounts here. Click on any account to autofill your details and sign in.
              </p>

              <div className="space-y-3">
                {/* Customer Card */}
                <div
                  onClick={() => {
                    setEmail("customer@shopnow.com");
                    setPassword("customer123");
                    setIsRecoveryOpen(false);
                    showToast("Autofilled customer credentials!", "success");
                  }}
                  className="p-3 rounded-xl border border-violet-500/10 hover:border-violet-500/30 bg-violet-600/5 hover:bg-violet-600/10 transition-all cursor-pointer group text-left font-sans"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-violet-300">Customer Account</span>
                    <span className="text-[10px] bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full font-bold">CUSTOMER</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 mt-1">customer@shopnow.com</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Password: customer123</p>
                  <div className="text-[10px] text-violet-400 group-hover:underline mt-2 text-right">Click to Autofill &rarr;</div>
                </div>

                {/* Admin Card */}
                <div
                  onClick={() => {
                    setEmail("admin@shopnow.com");
                    setPassword("admin123");
                    setIsRecoveryOpen(false);
                    showToast("Autofilled admin credentials!", "success");
                  }}
                  className="p-3 rounded-xl border border-pink-500/10 hover:border-pink-500/30 bg-pink-600/5 hover:bg-pink-600/10 transition-all cursor-pointer group text-left font-sans"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-pink-300">Admin Account</span>
                    <span className="text-[10px] bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 mt-1">admin@shopnow.com</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Password: admin123</p>
                  <div className="text-[10px] text-pink-400 group-hover:underline mt-2 text-right">Click to Autofill &rarr;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
