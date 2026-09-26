import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product ? `${product.name} | Admin` : "Product | Admin" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">Edit product</h1>
      <ProductForm product={product} />
    </div>
  );
}
