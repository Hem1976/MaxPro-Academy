import { Award, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CertificateCardProps {
  courseName: string;
  issuedDate: string;
  recipientName: string;
  onDownload?: () => void;
  className?: string;
}

export function CertificateCard({
  courseName,
  issuedDate,
  recipientName,
  onDownload,
  className,
}: CertificateCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-md bg-navy text-navy-foreground"
          aria-hidden="true"
        >
          <Award className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{courseName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Awarded to {recipientName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Issued {issuedDate}
          </p>
        </div>
      </div>

      {onDownload && (
        <div className="mt-4 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="size-4" />
            Download certificate
          </Button>
        </div>
      )}
    </div>
  );
}
