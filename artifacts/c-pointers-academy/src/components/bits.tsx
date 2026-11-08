import type { ReactNode } from "react";
import type { Difficulty } from "@/content/types";
import { cn } from "@/lib/utils";

const diffStyle: Record<Difficulty, string> = {
  beginner: "bg-[hsl(var(--heap))] text-[hsl(var(--heap-ink))] border-[hsl(var(--heap-ink)/0.25)]",
  intermediate: "bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))] border-[hsl(var(--stack-ink)/0.25)]",
  advanced: "bg-[hsl(var(--pencil)/0.1)] text-[hsl(var(--pencil))] border-[hsl(var(--pencil)/0.3)]",
};

export function DifficultyPill({ level, className }: { level: Difficulty; className?: string }) {
  const dots = level === "beginner" ? 1 : level === "intermediate" ? 2 : 3;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize", diffStyle[level], className)}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-1.5 w-1.5 rounded-full bg-current", i >= dots && "opacity-25")} />
        ))}
      </span>
      {level}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary", className)}>{children}</p>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out" style={{ transform: `scaleX(${Math.max(0, Math.min(1, value))})` }} />
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-10 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">{title}</h1>
      {children && <div className="mt-4 text-lg leading-relaxed text-muted-foreground">{children}</div>}
    </header>
  );
}
