import { useState } from "react";
import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import { visualizerPresets } from "@/content/diagrams";
import { MemoryDiagram } from "@/components/memory-diagram";
import { PageHeader } from "@/components/bits";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

function initialPreset() {
  if (typeof window === "undefined") return visualizerPresets[0].id;
  const p = new URLSearchParams(window.location.search).get("program");
  return visualizerPresets.some((d) => d.id === p) ? (p as string) : visualizerPresets[0].id;
}

export default function VisualizerPage() {
  useSeo("Interactive C memory visualizer", "Step line by line through small C programs and watch stack frames, heap blocks, addresses and pointer arrows change.");
  const [id, setId] = useState(initialPreset);
  const diagram = visualizerPresets.find((d) => d.id === id) ?? visualizerPresets[0];

  const pick = (next: string) => {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set("program", next);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="memory visualizer" title={<>Pick a program. <span className="highlighter">Step through it.</span></>}>
        Every line, every frame, every arrow. Go forward until something surprises you, then go back one step and look again.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside>
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">programs</p>
          <ul className="flex gap-2 overflow-x-auto pb-2 xl:flex-col xl:overflow-visible xl:pb-0">
            {visualizerPresets.map((d, i) => (
              <motion.li key={d.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="shrink-0 xl:shrink">
                <button
                  type="button"
                  onClick={() => pick(d.id)}
                  className={cn("w-64 rounded-xl border-2 p-3.5 text-left transition xl:w-full", d.id === id ? "border-primary bg-[hsl(var(--stack))]" : "bg-card hover:border-primary/40")}
                  data-testid={`button-preset-${d.id}`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{d.steps.length} steps</span>
                  </span>
                  <span className={cn("mt-1 block font-bold leading-snug", d.id === id && "text-[hsl(var(--stack-ink))]")}>{d.title}</span>
                  {d.blurb && <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{d.blurb}</span>}
                </button>
              </motion.li>
            ))}
          </ul>
          <div className="mt-5 hidden rounded-xl border border-dashed p-4 text-sm text-muted-foreground xl:block">
            <Keyboard className="mb-2 h-4 w-4" />
            Click the diagram, then use <kbd className="inline-code">left</kbd> and <kbd className="inline-code">right</kbd> arrow keys to step.
          </div>
        </aside>
        <MemoryDiagram key={diagram.id} diagram={diagram} large />
      </div>
    </div>
  );
}
