import type { Metadata } from "next";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { Badge } from "@/components/ui/badge";
import { getAnnouncements } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Announcements | Admin",
};

export default function AdminAnnouncementsPage() {
  const announcements = getAnnouncements(false);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">Announcements</h1>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          New announcement
        </h2>
        <AnnouncementForm />
      </div>

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
        {announcements.map((announcement) => (
          <div key={announcement.id} className="space-y-3">
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
