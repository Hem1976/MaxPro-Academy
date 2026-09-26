"use client";

import { useEffect, useState, useTransition } from "react";
import { Upload, Users } from "lucide-react";
import {
  getExternalUserImportStatus,
  importExternalUsersFromCsv,
  type ExternalUserImportRowResult,
} from "@/actions/external-users";
import { CredentialsEmailPreview } from "@/components/admin/credentials-email-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseExternalUsersCsv } from "@/lib/validations/external-users-csv";

export function ExternalUsersImport() {
  const [previewRows, setPreviewRows] = useState<
    ReturnType<typeof parseExternalUsersCsv>
  >([]);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [results, setResults] = useState<ExternalUserImportRowResult[] | null>(
    null,
  );
  const [summary, setSummary] = useState<{
    created: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [postmarkConfigured, setPostmarkConfigured] = useState(false);
  const [appUrl, setAppUrl] = useState("http://localhost:3000");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getExternalUserImportStatus().then((status) => {
      if (status.success) {
        setPostmarkConfigured(status.data.postmarkConfigured);
        setAppUrl(status.data.appUrl);
      }
    });
  }, []);

  const handleFile = (file: File) => {
    setParseError(null);
    setImportError(null);
    setResults(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setCsvText(text);
      try {
        setPreviewRows(parseExternalUsersCsv(text));
      } catch (error) {
        setPreviewRows([]);
        setParseError(
          error instanceof Error ? error.message : "Could not parse CSV",
        );
      }
    };
    reader.readAsText(file);
  };

  const runImport = () => {
    if (!csvText) return;
    setImportError(null);
    startTransition(async () => {
      const response = await importExternalUsersFromCsv(csvText);
      if (!response.success) {
        setImportError(response.error);
        return;
      }
      setResults(response.data.results);
      setSummary(response.data.summary);
      setPostmarkConfigured(response.data.emailsEnabled);
    });
  };

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "helpdesk@maxproinfotech.com";

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-5 text-accent" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Upload external learners
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Import a CSV with name, email, phone, company, and position.
                Accounts are created and login credentials are emailed via
                Postmark.
              </p>
              <p className="mt-2 text-sm">
                <a
                  href="/templates/external-learners.csv"
                  className="font-medium text-accent hover:underline"
                  download
                >
                  Download CSV template
                </a>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={postmarkConfigured ? "success" : "secondary"}>
                  Postmark {postmarkConfigured ? "connected" : "not configured"}
                </Badge>
              </div>
            </div>
          </div>

          <label
            className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center hover:bg-surface"
          >
            <Upload className="mb-2 size-8 text-muted-foreground" />
            <span className="text-sm font-medium">Choose CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = "";
              }}
            />
          </label>

          {parseError && (
            <p className="mt-3 text-sm text-destructive">{parseError}</p>
          )}

          {previewRows.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Company</th>
                    <th className="py-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.email} className="border-b border-border/60">
                      <td className="py-2 pr-3">{row.fullName}</td>
                      <td className="py-2 pr-3">{row.email}</td>
                      <td className="py-2 pr-3">{row.phone}</td>
                      <td className="py-2 pr-3">{row.company}</td>
                      <td className="py-2">{row.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                type="button"
                className="mt-4"
                disabled={isPending}
                onClick={runImport}
              >
                {isPending
                  ? "Creating accounts & sending email…"
                  : `Import ${previewRows.length} learner(s)`}
              </Button>
            </div>
          )}

          {importError && (
            <p className="mt-3 text-sm text-destructive">{importError}</p>
          )}

          {summary && (
            <div className="mt-5 rounded-md border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">Import complete</p>
              <p className="mt-1 text-muted-foreground">
                Created {summary.created} · Skipped {summary.skipped} · Failed{" "}
                {summary.failed}
              </p>
            </div>
          )}

          {results && results.length > 0 && (
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
              {results.map((row) => (
                <li
                  key={`${row.email}-${row.status}`}
                  className="rounded-md border border-border px-3 py-2"
                >
                  <span className="font-medium">{row.email}</span>
                  <span className="text-muted-foreground"> — {row.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <CredentialsEmailPreview appUrl={appUrl} supportEmail={supportEmail} />
    </div>
  );
}
