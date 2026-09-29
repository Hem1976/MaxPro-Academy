import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product ? `${product.name} | Admin` : "Solution | Admin" };
}

export default async function EditSolutionPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <div className="w-full">
      <AdminPageHeader title="Edit solution" description={product.name} />
      <ProductForm product={product} />
    </div>
  );
}
