import { Logo } from "@/components/brand/logo";

export function AuthShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="flex justify-center px-6 py-8">
        <Logo variant="full" href="/" priority />
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
          {eyebrow ? (
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {children}
        </div>
      </main>

      <footer className="flex flex-col items-center gap-3 px-6 py-6">
        <Logo variant="academy" href="/" className="max-h-9" />
        <p className="text-center text-xs text-muted-foreground">
          Professional training for Maxpro Infotech solutions
        </p>
      </footer>
    </div>
  );
}
