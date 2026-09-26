import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product | Admin",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">New product</h1>
      <ProductForm />
    </div>
  );
}
