import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let product = null;
  try {
    const res = await fetch(`${backendUrl}/api/products/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      product = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch product from backend:", error);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
