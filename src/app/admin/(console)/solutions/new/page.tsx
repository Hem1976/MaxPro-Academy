import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Solution | Admin",
};

export default function NewSolutionPage() {
  return (
    <div className="w-full">
      <AdminPageHeader title="New solution" />
      <ProductForm />
    </div>
  );
}
