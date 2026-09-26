import { Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonContentProps {
  content: string;
  className?: string;
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "step"; number: number; text: string }
  | { type: "tip"; text: string }
  | { type: "warning"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; alt: string };

function parseContent(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3) });
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: line.slice(4) });
      i++;
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: imageMatch[1] || "Lesson screenshot",
        src: imageMatch[2],
      });
      i++;
      continue;
    }

    const stepMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (stepMatch) {
      blocks.push({
        type: "step",
        number: parseInt(stepMatch[1], 10),
        text: stepMatch[2],
      });
      i++;
      continue;
    }

    if (line.startsWith("> Tip:") || line.startsWith("> tip:")) {
      blocks.push({ type: "tip", text: line.replace(/^>\s*tip:\s*/i, "") });
      i++;
      continue;
    }

    if (line.startsWith("> Warning:") || line.startsWith("> warning:")) {
      blocks.push({
        type: "warning",
        text: line.replace(/^>\s*warning:\s*/i, ""),
      });
      i++;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const listLine = lines[i].trim();
        if (listLine.startsWith("- ") || listLine.startsWith("* ")) {
          items.push(listLine.slice(2));
          i++;
        } else break;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    const orderedListMatch = line.match(/^\d+\.\s/);
    if (orderedListMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const listLine = lines[i].trim();
        const m = listLine.match(/^\d+\.\s+(.+)/);
        if (m) {
          items.push(m[1]);
          i++;
        } else break;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraphLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isSpecialLine(lines[i].trim())) {
      paragraphLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function isSpecialLine(line: string): boolean {
  return (
    line.startsWith("## ") ||
    line.startsWith("### ") ||
    /^!\[[^\]]*\]\([^)]+\)$/.test(line) ||
    /^\d+\.\s/.test(line) ||
    line.startsWith("- ") ||
    line.startsWith("* ") ||
    line.startsWith("> Tip:") ||
    line.startsWith("> tip:") ||
    line.startsWith("> Warning:") ||
    line.startsWith("> warning:")
  );
}

function Callout({
  variant,
  children,
}: {
  variant: "tip" | "warning";
  children: string;
}) {
  const isTip = variant === "tip";

  return (
    <div
      className={cn(
        "my-4 flex gap-3 rounded-md border px-4 py-3",
        isTip
          ? "border-accent/20 bg-accent-muted"
          : "border-warning/30 bg-warning/5",
      )}
      role="note"
    >
      {isTip ? (
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isTip ? "Tip" : "Warning"}
        </p>
        <p className="mt-1 text-sm text-foreground">{children}</p>
      </div>
    </div>
  );
}

function StepBlock({ number, text }: { number: number; text: string }) {
  return (
    <div className="my-3 flex gap-3">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-navy text-xs font-semibold text-navy-foreground"
        aria-hidden="true"
      >
        {number}
      </span>
      <p className="pt-0.5 text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

export function LessonContent({ content, className }: LessonContentProps) {
  const blocks = parseContent(content);

  return (
    <article className={cn("prose-lesson", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={index}>{block.text}</h2>
            ) : (
              <h3 key={index}>{block.text}</h3>
            );

          case "paragraph":
            return <p key={index}>{block.text}</p>;

          case "step":
            return (
              <StepBlock key={index} number={block.number} text={block.text} />
            );

          case "tip":
            return <Callout key={index} variant="tip">{block.text}</Callout>;

          case "warning":
            return <Callout key={index} variant="warning">{block.text}</Callout>;

          case "list":
            if (block.ordered) {
              return (
                <ol key={index}>
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={index}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );

          case "image":
            return (
              <figure
                key={index}
                className="my-6 overflow-hidden rounded-lg border border-border bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  className="mx-auto max-h-[520px] w-auto max-w-full object-contain"
                />
                {block.alt && (
                  <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}
