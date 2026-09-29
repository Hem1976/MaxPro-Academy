import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Solutions | Admin",
};

export default function AdminSolutionsPage() {
  const products = getProducts({ publishedOnly: false });

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Solutions"
        description="Products your courses can link to."
      >
        <Link href="/admin/solutions/new">
          <Button size="md">
            <Plus className="size-4" aria-hidden="true" />
            New solution
          </Button>
        </Link>
      </AdminPageHeader>

      <DataTable
        data={products}
        keyExtractor={(row) => row.id}
        emptyMessage="No solutions yet."
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <span className="font-medium text-foreground">{row.name}</span>
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
          {
            key: "actions",
            header: "",
            className: "w-[1%] whitespace-nowrap text-right",
            cell: (row) => (
              <AdminButtonLink
                href={`/admin/solutions/${row.id}`}
                variant="primary"
                aria-label={`Edit ${row.name}`}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </AdminButtonLink>
            ),
          },
        ]}
      />
    </div>
  );
}
