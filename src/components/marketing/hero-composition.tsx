import { Play, CheckCircle2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

const SIDEBAR_MODULES = [
  { title: "Getting Started", lessons: 4, active: true, completed: 2 },
  { title: "Customers", lessons: 2, active: false, completed: 0 },
  { title: "Sales Orders", lessons: 2, active: false, completed: 0 },
] as const;

export function HeroComposition() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            Rockey Fundamentals
          </span>
        </div>

        <div className="flex flex-col sm:flex-row">
          <aside className="w-full border-b border-border bg-surface sm:w-36 sm:border-b-0 sm:border-r lg:w-44">
            <div className="px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                Course outline
              </p>
            </div>
            <ul className="px-2 pb-3">
              {SIDEBAR_MODULES.map((module) => (
                <li
                  key={module.title}
                  className={`mb-1 rounded-md px-2.5 py-2 text-xs ${
                    module.active
                      ? "bg-accent-muted text-navy"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="font-medium">{module.title}</span>
                  <span className="mt-0.5 block text-[10px] text-muted">
                    {module.completed}/{module.lessons} lessons
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 p-4 lg:p-5">
            <div className="relative aspect-video overflow-hidden rounded-md bg-navy">
              <div className="absolute inset-0 bg-linear-to-br from-navy to-accent/80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Play className="size-5 fill-white text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                <div className="h-full w-[38%] bg-white/90" />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">
                Introduction to Rockey
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Module 1 · Lesson 3 of 4
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Course progress</span>
                <span className="font-medium text-navy">38%</span>
              </div>
              <ProgressBar value={38} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 hidden rounded-md border border-border bg-card px-3 py-2 shadow-sm lg:block">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="size-3.5 text-success" />
          <span className="text-muted-foreground">Lesson completed</span>
        </div>
      </div>
    </div>
  );
}
