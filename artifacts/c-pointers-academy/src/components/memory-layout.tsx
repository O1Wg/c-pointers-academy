import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import {
  BASE_ADDR,
  BYTES_PER_ROW,
  LAYOUT_CODE,
  buildByteMap,
  layoutVars,
  type LayoutVar,
} from "@/content/memory-layout";
import { cn } from "@/lib/utils";

const hex8 = (n: number) => "0x" + n.toString(16).padStart(8, "0");
const tint = (hsl: [number, number, number], a: number) => `hsl(${hsl[0]} ${hsl[1]}% ${hsl[2]}% / ${a})`;

export function MemoryLayout() {
  const [selectedId, setSelectedId] = useState("age");
  const bytes = useMemo(() => buildByteMap(), []);
  const rows = Math.ceil(bytes.length / BYTES_PER_ROW);
  const selected = layoutVars.find((v) => v.id === selectedId)!;
  const target = selected.target ? layoutVars.find((v) => v.id === selected.target) : undefined;

  return (
    <div className="space-y-6" data-testid="memory-layout">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <CodeBlock code={LAYOUT_CODE} title="layout.c" highlightLine={selected.line} className="self-start" testId="code-layout" />

        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="mb-3 grid grid-cols-[1.1fr_1.2fr_1fr] gap-3 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span>Variable</span>
            <span>Value</span>
            <span className="text-right">Address</span>
          </div>
          <div className="space-y-2" role="listbox" aria-label="Variables in memory">
            {layoutVars.map((v) => (
              <VariableRow key={v.id} v={v} active={v.id === selectedId} onSelect={() => setSelectedId(v.id)} />
            ))}
          </div>
          <p className="mt-4 px-1 text-xs leading-relaxed text-muted-foreground">
            Click a variable to see exactly which bytes it owns. Exact addresses change from run to run; the pattern does not.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-[hsl(var(--stack))] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl font-semibold">The same memory, byte by byte</h3>
          <p className="font-mono text-xs text-[hsl(var(--stack-ink))]">each box = 1 byte, shown in hex</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[34rem]">
            <div className="mb-1 grid grid-cols-[6.5rem_repeat(8,minmax(0,1fr))] gap-1.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
              <span>address</span>
              {Array.from({ length: BYTES_PER_ROW }, (_, i) => (
                <span key={i} className="text-center">+{i}</span>
              ))}
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="grid grid-cols-[6.5rem_repeat(8,minmax(0,1fr))] items-center gap-1.5">
                  <span className="font-mono text-xs text-muted-foreground">{hex8(BASE_ADDR + r * BYTES_PER_ROW)}</span>
                  {bytes.slice(r * BYTES_PER_ROW, (r + 1) * BYTES_PER_ROW).map((b, c) => {
                    const idx = r * BYTES_PER_ROW + c;
                    const owner = layoutVars.find((v) => v.id === b.owner);
                    const isSelected = b.owner === selectedId;
                    const isTarget = target && b.owner === target.id;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => owner && setSelectedId(owner.id)}
                        disabled={!owner}
                        title={`${hex8(BASE_ADDR + idx)}${owner ? ` — ${owner.name}` : " — padding (unused)"}`}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-md border-2 font-mono text-sm font-bold transition",
                          !owner && "hatched border-dashed border-foreground/20 text-muted-foreground",
                          owner && !isSelected && !isTarget && "opacity-55 hover:opacity-100",
                          isTarget && "border-dashed",
                        )}
                        style={
                          owner
                            ? {
                                background: tint(owner.hsl, isSelected || isTarget ? 0.34 : 0.14),
                                borderColor: tint(owner.hsl, isSelected || isTarget ? 0.95 : 0.5),
                                boxShadow: isSelected ? `0 0 0 3px ${tint(owner.hsl, 0.25)}` : undefined,
                              }
                            : undefined
                        }
                        data-testid={`byte-${idx}`}
                      >
                        {b.hex}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
          {layoutVars.map((v) => (
            <span key={v.id} className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border-2" style={{ background: tint(v.hsl, 0.34), borderColor: tint(v.hsl, 0.95) }} />
              {v.name}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="hatched h-3 w-3 rounded-sm border-2 border-dashed border-foreground/25" />
            padding (unused)
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border-2 bg-card p-5 sm:p-6"
          style={{ borderColor: tint(selected.hsl, 0.6) }}
          data-testid="layout-detail"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 className="font-display text-2xl font-semibold">
              <span className="font-mono">{selected.name}</span>
            </h3>
            <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-bold">{selected.type}</span>
            <span className="font-mono text-sm text-muted-foreground">
              {selected.size} {selected.size === 1 ? "byte" : "bytes"} starting at {selected.addr}
            </span>
          </div>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{selected.explain}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">bytes</span>
            {selected.bytes.map((b, i) => (
              <span key={i} className="rounded-md border-2 px-2 py-1 font-bold" style={{ background: tint(selected.hsl, 0.2), borderColor: tint(selected.hsl, 0.7) }}>
                {b}
              </span>
            ))}
          </div>

          {selected.elements && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {selected.elements.map((e) => (
                <div key={e.label} className="rounded-lg border bg-background/60 px-3 py-2">
                  <p className="font-mono text-xs text-muted-foreground">{e.label}</p>
                  <p className="font-mono text-lg font-bold">{e.value}</p>
                  <p className="font-mono text-xs text-muted-foreground">{e.addr}</p>
                </div>
              ))}
            </div>
          )}

          {target && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--accent)/0.5)] px-3 py-2 text-sm font-bold">
              <span className="font-mono">{selected.name}</span>
              <ArrowRight className="h-4 w-4" style={{ color: "hsl(var(--pencil))" }} />
              <span className="font-mono">{target.name}</span>
              <span className="font-normal text-muted-foreground">
                (the dashed bytes above: the address {selected.value} is where {target.name} starts)
              </span>
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function VariableRow({ v, active, onSelect }: { v: LayoutVar; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[1.1fr_1.2fr_1fr] items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition hover:-translate-y-px",
        active ? "bg-[hsl(var(--stack))]" : "bg-background/50 hover:bg-[hsl(var(--stack)/0.6)]",
      )}
      style={{ borderColor: active ? tint(v.hsl, 0.9) : "hsl(var(--border))" }}
      data-testid={`row-var-${v.id}`}
    >
      <span className="min-w-0">
        <span className="block font-mono text-[15px] font-bold leading-tight">{v.name}</span>
        <span className="block font-mono text-[11px] text-muted-foreground">{v.type}</span>
      </span>
      <span>
        <span
          className={cn(
            "inline-flex min-h-9 min-w-12 items-center justify-center rounded-md border-2 px-2 font-mono text-sm font-bold",
            active ? "border-[hsl(var(--accent-foreground)/0.5)] bg-[hsl(var(--accent)/0.6)]" : "border-foreground/20 bg-card",
          )}
        >
          {v.value}
        </span>
      </span>
      <span className="text-right font-mono text-xs text-muted-foreground">{v.addr}</span>
    </button>
  );
}
