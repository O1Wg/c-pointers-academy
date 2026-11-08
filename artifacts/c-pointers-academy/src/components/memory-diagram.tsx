import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Terminal } from "lucide-react";
import type { HeapBlock, MemCell, MemDiagram, MemFrame, MemVar } from "@/content/types";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

interface Props {
  diagram: MemDiagram;
  autoplay?: boolean;
  hideCode?: boolean;
  large?: boolean;
  className?: string;
  onStepChange?: (i: number) => void;
}

interface Arrow {
  key: string;
  d: string;
  dangling: boolean;
  ex: number;
  ey: number;
}

export function MemoryDiagram({ diagram, autoplay = false, hideCode = false, large = false, className, onStepChange }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const steps = diagram.steps;
  const step = steps[i];
  const hasHeap = useMemo(() => steps.some((s) => s.heap && s.heap.length > 0), [steps]);
  const hasStatics = useMemo(() => steps.some((s) => s.statics && s.statics.length > 0), [steps]);
  const onStepRef = useRef(onStepChange);
  onStepRef.current = onStepChange;

  useEffect(() => {
    setI(0);
  }, [diagram.id]);

  useEffect(() => {
    onStepRef.current?.(i);
  }, [i]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((x) => (x + 1) % steps.length), i === steps.length - 1 ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  const go = useCallback((n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(steps.length - 1, n)));
  }, [steps.length]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={onKey}
      className={cn("group/diagram overflow-hidden rounded-2xl border bg-card outline-none ring-primary/30 focus-visible:ring-4", className)}
      data-testid={`diagram-${diagram.id}`}
      aria-label={`Memory diagram: ${diagram.title}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-[hsl(var(--muted)/0.5)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">memory diagram</p>
          <h3 className="font-display truncate text-lg font-semibold">{diagram.title}</h3>
        </div>
        <Controls i={i} total={steps.length} playing={playing} setPlaying={setPlaying} go={go} />
      </header>

      <div className={cn("grid", !hideCode && "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]")}>
        {!hideCode && (
          <div className="border-b p-3 sm:p-4 lg:border-b-0 lg:border-r">
            <CodeBlock code={diagram.code} highlightLine={step.line} compact />
          </div>
        )}
        <div className="flex min-w-0 flex-col">
          <MemoryCanvas key={diagram.id} stepIndex={i} frames={step.stack} heap={step.heap ?? []} statics={step.statics ?? []} hasHeap={hasHeap} hasStatics={hasStatics} large={large} />
        </div>
      </div>

      <footer className="border-t bg-[hsl(var(--accent)/0.12)] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-md bg-[hsl(var(--code-bg))] px-2 py-0.5 font-mono text-xs font-bold text-[hsl(var(--accent))]">line {step.line}</span>
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="text-[16px] leading-relaxed"
              data-testid="text-step-note"
            >
              {step.note}
            </motion.p>
          </AnimatePresence>
        </div>
        {step.output && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[hsl(var(--code-bg))] px-3 py-2 font-mono text-[13px] text-[#bfe39a]">
            <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
            <pre className="whitespace-pre-wrap">{step.output}</pre>
          </div>
        )}
        <div className="mt-4 flex gap-1" role="tablist" aria-label="Steps">
          {steps.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              aria-label={`Go to step ${n + 1}`}
              className="group/dot h-3 flex-1 py-1"
              data-testid={`button-step-${n + 1}`}
            >
              <span className={cn("block h-1 w-full rounded-full transition-colors", n === i ? "bg-primary" : n < i ? "bg-primary/40" : "bg-foreground/10 group-hover/dot:bg-foreground/25")} />
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}

function Controls({ i, total, playing, setPlaying, go }: { i: number; total: number; playing: boolean; setPlaying: (p: boolean) => void; go: (n: number) => void }) {
  const btn = "inline-flex h-9 items-center justify-center rounded-lg border bg-card px-2.5 text-sm font-bold transition hover:-translate-y-px hover:border-primary/40 hover:text-primary active:translate-y-0 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} onClick={() => go(0)} disabled={i === 0} aria-label="Restart" data-testid="button-step-reset">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step" data-testid="button-step-prev">
        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
      </button>
      <span className="min-w-[4.5rem] text-center font-mono text-sm tabular-nums" data-testid="text-step-counter">
        {i + 1} <span className="text-muted-foreground">/ {total}</span>
      </span>
      <button type="button" className={cn(btn, "border-primary bg-primary text-primary-foreground hover:text-primary-foreground")} onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Next step" data-testid="button-step-next">
        <span className="hidden sm:inline">Step</span> <ChevronRight className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"} data-testid="button-step-play">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MemoryCanvas({ stepIndex, frames, heap, statics, hasHeap, hasStatics, large }: { stepIndex: number; frames: MemFrame[]; heap: HeapBlock[]; statics: MemVar[]; hasHeap: boolean; hasStatics: boolean; large: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const markerId = useId().replace(/:/g, "");

  const measure = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const base = root.getBoundingClientRect();
    setSize({ w: base.width, h: base.height });
    const out: Arrow[] = [];
    root.querySelectorAll<HTMLElement>("[data-ptr-from]").forEach((src) => {
      const to = src.dataset.ptrTo;
      if (!to) return;
      const target = root.querySelector<HTMLElement>(`[data-mem-id="${CSS.escape(to)}"]`);
      if (!target) return;
      const s = src.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const sx = s.right - base.left - 2;
      const sy = s.top + s.height / 2 - base.top;
      const ty = t.top + Math.min(t.height / 2, 22) - base.top;
      let d: string;
      let ex: number;
      if (t.left - base.left > sx + 16) {
        ex = t.left - base.left - 3;
        const mid = (ex - sx) / 2;
        d = `M ${sx} ${sy} C ${sx + mid} ${sy}, ${ex - mid} ${ty}, ${ex} ${ty}`;
      } else {
        ex = t.right - base.left + 3;
        const bulge = 34 + Math.min(80, Math.abs(ty - sy) * 0.25);
        const cx = Math.max(sx, ex) + bulge;
        d = `M ${sx} ${sy} C ${cx} ${sy}, ${cx} ${ty}, ${ex} ${ty}`;
      }
      out.push({ key: `${src.dataset.ptrFrom}->${to}`, d, dangling: src.dataset.dangling === "true", ex, ey: ty });
    });
    setArrows(out);
  }, []);

  useLayoutEffect(() => {
    measure();
    const t = setTimeout(measure, 260);
    return () => clearTimeout(t);
  }, [stepIndex, measure]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const stackFrames = [...frames].reverse();

  return (
    <div ref={ref} className={cn("relative flex-1 p-4 sm:p-5", large && "sm:p-7")}>
      {hasStatics && (
        <Region label="static & code" hint="lives for the whole program" className="mb-5">
          <div className="flex flex-wrap gap-2">
            {statics.map((v) => <VarRow key={v.id} v={v} tone="static" />)}
          </div>
        </Region>
      )}
      <div className={cn("grid gap-5", hasHeap && "sm:grid-cols-2 sm:gap-x-16")}>
        <Region label="stack" hint="top = most recent call">
          <div className="space-y-3">
            {stackFrames.map((fr, idx) => (
              <motion.div
                key={`${fr.fn}-${frames.length - idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("rounded-xl border-2 bg-[hsl(var(--stack))] p-2.5", idx === 0 ? "border-[hsl(var(--stack-ink)/0.55)]" : "border-[hsl(var(--stack-ink)/0.15)] opacity-80")}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="font-mono text-sm font-bold text-[hsl(var(--stack-ink))]">{fr.fn}()</span>
                  {idx === 0 && <span className="rounded-full bg-[hsl(var(--stack-ink))] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--stack))]">running</span>}
                </div>
                <div className="space-y-1.5">
                  {fr.vars.map((v) => <VarRow key={v.id} v={v} tone="stack" />)}
                  {fr.vars.length === 0 && <p className="px-1 text-sm text-muted-foreground">no locals</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </Region>
        {hasHeap && (
          <Region label="heap" hint="lives until free()">
            <div className="space-y-3">
              {heap.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-[hsl(var(--heap-ink)/0.25)] px-3 py-6 text-center text-sm text-muted-foreground">nothing allocated yet</div>
              )}
              {heap.map((b) => <HeapView key={b.id} b={b} />)}
            </div>
          </Region>
        )}
      </div>

      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h} aria-hidden>
        <defs>
          <marker id={`ah-${markerId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--pencil))" />
          </marker>
          <marker id={`ahd-${markerId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
          </marker>
        </defs>
        {arrows.map((a) => (
          <g key={a.key}>
            <motion.path
              d={a.d}
              fill="none"
              stroke={a.dangling ? "hsl(var(--muted-foreground))" : "hsl(var(--pencil))"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={a.dangling ? "5 5" : undefined}
              markerEnd={`url(#${a.dangling ? "ahd" : "ah"}-${markerId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1, d: a.d }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            {a.dangling && (
              <g transform={`translate(${a.ex - 18} ${a.ey - 16})`}>
                <circle r="8" cx="6" cy="6" fill="hsl(var(--destructive))" />
                <path d="M 3 3 L 9 9 M 9 3 L 3 9" stroke="hsl(var(--destructive-foreground))" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Region({ label, hint, children, className }: { label: string; hint: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-dashed border-foreground/15 pb-1">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[11px] italic text-muted-foreground">{hint}</span>
      </div>
      {children}
    </div>
  );
}

function ValueBox({ value, garbage, nul, dangling, changed, isPtr, memId, ptrTo, fromId, wide }: { value: string; garbage?: boolean; nul?: boolean; dangling?: boolean; changed?: boolean; isPtr?: boolean; memId?: string; ptrTo?: string; fromId?: string; wide?: boolean }) {
  return (
    <motion.span
      key={value + String(dangling)}
      initial={changed ? { opacity: 0.2 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      data-mem-id={memId}
      data-ptr-from={ptrTo ? fromId : undefined}
      data-ptr-to={ptrTo}
      data-dangling={dangling ? "true" : undefined}
      className={cn(
        "relative inline-flex min-h-8 items-center justify-center rounded-md border-2 bg-card px-2 font-mono text-[13px] font-bold tabular-nums transition-colors duration-300",
        wide ? "min-w-[6.5rem]" : "min-w-[3rem]",
        garbage && "hatched border-dashed text-muted-foreground",
        nul && "border-dashed border-foreground/30 text-muted-foreground",
        dangling && "border-[hsl(var(--destructive)/0.5)] text-[hsl(var(--destructive))] line-through decoration-2",
        isPtr && !nul && !dangling && !garbage && "border-[hsl(var(--pencil)/0.55)] text-[hsl(var(--pencil))]",
        !isPtr && !garbage && !nul && "border-foreground/20",
        changed && "bg-[hsl(var(--accent)/0.55)] border-[hsl(var(--accent-foreground)/0.5)]",
      )}
    >
      {nul ? (
        <span className="flex items-center gap-1">
          NULL
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="text-muted-foreground"><path d="M6 0 V5 M1 5 H11 M3 8 H9 M5 11 H7" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
      ) : value}
    </motion.span>
  );
}

function CellStrip({ cells, ownerId }: { cells: MemCell[]; ownerId: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((cell, k) => (
        <div key={cell.id ?? k} className="flex flex-col items-center">
          <ValueBox
            value={cell.value}
            garbage={cell.garbage}
            nul={cell.nul}
            dangling={cell.dangling}
            changed={cell.changed}
            isPtr={!!cell.ptr}
            memId={cell.id}
            ptrTo={cell.ptr}
            fromId={cell.id ?? `${ownerId}.${k}`}
          />
          {cell.label && <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{cell.label}</span>}
        </div>
      ))}
    </div>
  );
}

function VarRow({ v, tone }: { v: MemVar; tone: "stack" | "static" }) {
  const isPtr = v.type.includes("*") || !!v.ptr || !!v.nul;
  return (
    <div className={cn("rounded-lg px-1.5 py-1", tone === "static" && "border bg-muted/60 px-2.5 py-2")} data-mem-id={v.cells ? v.id : undefined} data-testid={`mem-var-${v.id}`}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <div className="min-w-[4.5rem]">
          <div className="font-mono text-sm font-bold leading-tight">{v.name}</div>
          <div className="font-mono text-[11px] leading-tight text-muted-foreground">{v.type}</div>
        </div>
        {v.cells ? (
          <CellStrip cells={v.cells} ownerId={v.id} />
        ) : (
          <ValueBox value={v.value} garbage={v.garbage} nul={v.nul} dangling={v.dangling} changed={v.changed} isPtr={isPtr} memId={v.id} ptrTo={v.ptr} fromId={v.id} wide={isPtr} />
        )}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground/80">{v.addr}</span>
      </div>
      {v.note && <p className="mt-1 pl-1 text-xs italic text-[hsl(var(--pencil))]">{v.note}</p>}
      {v.dangling && <p className="mt-1 pl-1 text-xs font-bold text-[hsl(var(--destructive))]">dangling: points at freed memory</p>}
    </div>
  );
}

function HeapView({ b }: { b: HeapBlock }) {
  return (
    <motion.div
      initial={b.changed ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      data-mem-id={b.id}
      className={cn(
        "rounded-xl border-2 p-2.5 transition-colors duration-300",
        b.freed ? "hatched border-dashed border-foreground/25 bg-muted/50" : "border-[hsl(var(--heap-ink)/0.45)] bg-[hsl(var(--heap))]",
      )}
      data-testid={`heap-block-${b.id}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <span className={cn("font-mono text-xs font-bold", b.freed ? "text-muted-foreground line-through" : "text-[hsl(var(--heap-ink))]")}>{b.addr}</span>
        <span className="flex items-center gap-1.5">
          {b.label && (
            <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", b.freed ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]" : "bg-[hsl(var(--heap-ink))] text-[hsl(var(--heap))]")}>{b.label}</span>
          )}
          <span className="font-mono text-[10px] text-muted-foreground">{b.size}</span>
        </span>
      </div>
      <div className={cn(b.freed && "opacity-50")}>
        <CellStrip cells={b.cells} ownerId={b.id} />
      </div>
    </motion.div>
  );
}
