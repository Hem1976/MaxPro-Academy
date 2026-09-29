import type { Metadata } from "next";
import { AdminPageHeader, AdminSectionHeader } from "@/components/admin/admin-page-header";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { Badge } from "@/components/ui/badge";
import { getAnnouncements } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Announcements | Admin",
};

export default function AdminAnnouncementsPage() {
  const announcements = getAnnouncements(false);

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Announcements"
        description="Short messages for learners on the site."
      />

      <div className="mb-8">
        <AdminSectionHeader title="Create new" />
        <AnnouncementForm />
      </div>

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="space-y-3 rounded-lg border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{announcement.title}</h3>
              <Badge variant={announcement.published ? "success" : "secondary"}>
                {announcement.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <AnnouncementForm announcement={announcement} />
          </div>
        ))}
      </div>
    </div>
  );
}
