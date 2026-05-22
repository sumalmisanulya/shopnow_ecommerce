import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ShopNow | Premium E-Commerce Platform",
  description: "A beautiful, premium multi-category e-commerce experience powered by Next.js and Stripe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-[#08080c] text-[#f3f3f7] min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          {/* Global Footer */}
          <footer className="border-t border-white/5 bg-[#050508]/80 py-8 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-500">
                &copy; {new Date().getFullYear()} ShopNow Inc. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/about" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">About</Link>
                <Link href="/contact" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Contact</Link>
                <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

// Since Next.js requires Client Components to have link inside next/link, let's make sure Link is imported
import Link from "next/link";
