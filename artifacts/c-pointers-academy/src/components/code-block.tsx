import { useMemo, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { tokenizeLine } from "@/lib/highlight";
import type { Annotation } from "@/content/types";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  title?: string;
  annotations?: Annotation[];
  highlightLine?: number;
  output?: string;
  compact?: boolean;
  className?: string;
  testId?: string;
}

export function CodeBlock({ code, title, annotations = [], highlightLine, output, compact, className, testId }: Props) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const noteIndex = useMemo(() => {
    const m = new Map<number, number>();
    annotations.forEach((a, i) => m.set(a.line, i + 1));
    return m;
  }, [annotations]);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <figure className={cn("overflow-hidden rounded-xl border border-[hsl(var(--code-bg))] shadow-[0_1px_0_hsl(var(--foreground)/0.04),0_12px_30px_-18px_hsl(var(--primary)/0.5)]", className)} data-testid={testId}>
      <div className="code-surface flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2a6c4]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f7c873]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#bfe39a]/70" />
          </span>
          {title && <figcaption className="ml-2 font-mono text-xs text-white/60">{title}</figcaption>}
        </div>
        <button type="button" onClick={copy} className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-white/55 transition hover:bg-white/10 hover:text-white" data-testid="button-copy-code">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div className="code-surface overflow-x-auto py-3">
        <pre className={cn("min-w-max font-mono leading-[1.7]", compact ? "text-[13px]" : "text-[14px]")}>
          {lines.map((line, i) => {
            const n = i + 1;
            const active = highlightLine === n;
            const note = noteIndex.get(n);
            const hovered = hover === n;
            return (
              <div
                key={i}
                onMouseEnter={() => note && setHover(n)}
                onMouseLeave={() => note && setHover(null)}
                className={cn(
                  "relative flex pr-6 transition-colors duration-200",
                  active && "bg-[hsl(var(--accent)/0.16)]",
                  hovered && "bg-white/[0.06]",
                )}
              >
                <span className={cn("absolute left-0 top-0 h-full w-[3px] transition-opacity", active ? "bg-[hsl(var(--accent))] opacity-100" : "opacity-0")} />
                <span className={cn("w-12 shrink-0 select-none pr-4 text-right", active ? "text-[hsl(var(--accent))]" : "text-white/30")}>{n}</span>
                <code className="whitespace-pre">
                  {tokenizeLine(line).map((t, j) => (
                    <span key={j} className={t.cls}>{t.text}</span>
                  ))}
                  {line.length === 0 && " "}
                </code>
                {note && (
                  <span className={cn("ml-4 inline-flex h-5 min-w-5 items-center justify-center self-center rounded-full px-1 font-sans text-[11px] font-bold transition", hovered ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "bg-white/15 text-white/80")}>{note}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
      {output !== undefined && (
        <div className="border-t border-white/10 bg-[hsl(var(--code-bg)/0.92)] px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/40">
            <Terminal className="h-3 w-3" /> output
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-[#bfe39a]">{output}</pre>
        </div>
      )}
      {annotations.length > 0 && (
        <ol className="grid gap-px bg-border">
          {annotations.map((a, i) => (
            <li
              key={i}
              onMouseEnter={() => setHover(a.line)}
              onMouseLeave={() => setHover(null)}
              className={cn("flex gap-3 bg-card px-4 py-2.5 text-[15px] leading-snug transition-colors", hover === a.line && "bg-[hsl(var(--accent)/0.18)]")}
            >
              <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{i + 1}</span>
              <span>
                <span className="mr-2 font-mono text-xs text-muted-foreground">line {a.line}</span>
                {a.note}
              </span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
