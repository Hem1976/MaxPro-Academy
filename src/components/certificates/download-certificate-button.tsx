"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface DownloadCertificateButtonProps {
  certificateId: string;
  certificateNumber?: string;
}

export function DownloadCertificateButton({
  certificateId,
  certificateNumber,
}: DownloadCertificateButtonProps) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/certificates/${certificateId}/pdf`, {
        credentials: "same-origin",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Certificate PDF could not be generated");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `maxpro-certificate-${certificateNumber ?? certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to download this certificate.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleDownload}
      disabled={pending}
    >
      <Download className="size-4" />
      {pending ? "Preparing PDF…" : "Download PDF"}
    </Button>
  );
}
