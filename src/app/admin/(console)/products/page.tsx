import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Products | Admin",
};

export default function AdminProductsPage() {
  const products = getProducts({ publishedOnly: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage Maxpro product catalog entries.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4" />
            New product
          </Button>
        </Link>
      </div>

      <DataTable
        data={products}
        keyExtractor={(row) => row.id}
        emptyMessage="No products yet."
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <Link
                href={`/admin/products/${row.id}`}
                className="font-medium text-accent hover:underline"
              >
                {row.name}
              </Link>
            ),
          },
          {
            key: "category",
            header: "Category",
            hideOnMobile: true,
            cell: (row) => row.category ?? "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge variant={row.published ? "success" : "secondary"}>
                {row.published ? "Published" : "Draft"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
