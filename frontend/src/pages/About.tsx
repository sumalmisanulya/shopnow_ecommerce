import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Code, Palette, Laptop } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-left relative z-10">
      <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-violet-600/5 blur-[100px] pointer-events-none" />

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent">
        About ShopNow
      </h1>
      
      <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8">
        ShopNow is a premium sandbox e-commerce website designed to showcase a modern, next-generation shopping platform. Built using React, Vite, Tailwind CSS, Laravel, and MySQL, we focus on delivering fluid user experiences, rich animations, and lightning fast responsiveness.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
          <Palette className="w-8 h-8 text-violet-400" />
          <h3 className="font-bold text-zinc-200">Rich Aesthetics</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Beautiful glassmorphism effects, harmonized dark-mode colors, and subtle micro-animations.
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
          <Code className="w-8 h-8 text-pink-400" />
          <h3 className="font-bold text-zinc-200">Modern Codebase</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Engineered with React SPA Client, Zustand state, Laravel API backend, and MySQL database.
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
          <Laptop className="w-8 h-8 text-amber-400" />
          <h3 className="font-bold text-zinc-200">Sandbox Ready</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Includes fully functional fallback states and mock integrations in case external services are offline.
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse-subtle" />
          Developer Notes
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          This system incorporates role-based authorization to demonstrate different views for standard customers and administrators. You can log in using our sandbox shortcuts to experience order dispatch timelines, driver assignments, returns management, and PDF streaming.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
