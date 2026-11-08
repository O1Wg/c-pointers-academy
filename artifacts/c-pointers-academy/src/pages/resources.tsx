import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ExternalLink, FileText, GraduationCap, PlayCircle, SearchX, Wrench, ScrollText } from "lucide-react";
import { resources } from "@/content/resources";
import type { Difficulty, ResourceType } from "@/content/types";
import { DifficultyPill, PageHeader } from "@/components/bits";
import { Chip } from "@/pages/examples";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const TYPES: ResourceType[] = ["book", "tutorial", "docs", "video", "course", "tool"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced"];
const ICON: Record<ResourceType, typeof BookMarked> = { book: BookMarked, tutorial: ScrollText, docs: FileText, video: PlayCircle, course: GraduationCap, tool: Wrench };

export default function ResourcesPage() {
  useSeo("Resources for learning C and pointers", "A curated list of real books, documentation, videos, courses and tools for learning C, pointers and memory debugging.");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const [freeOnly, setFreeOnly] = useState(false);

  const list = useMemo(() => resources.filter((r) => (type === "all" || r.type === type) && (level === "all" || r.level === level) && (!freeOnly || r.free)), [type, level, freeOnly]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="resources" title={<>The shelf next to <span className="highlighter">the desk.</span></>}>
        Books, docs, videos and tools we would actually hand a student. Each one comes with a single reason to open it.
      </PageHeader>

      <div className="mb-10 space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-16 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">type</span>
          {(["all", ...TYPES] as const).map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)} testId={`filter-type-${t}`}>{t}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-16 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">level</span>
          {(["all", ...LEVELS] as const).map((l) => <Chip key={l} active={level === l} onClick={() => setLevel(l)} testId={`filter-res-level-${l}`}>{l}</Chip>)}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" data-testid="checkbox-free-only" />
            Free only
          </label>
        </div>
      </div>

      <p className="mb-4 font-mono text-sm text-muted-foreground" data-testid="text-resource-count">{list.length} resource{list.length === 1 ? "" : "s"}</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="font-display mt-4 text-2xl font-semibold">Nothing on that shelf.</p>
          <button type="button" onClick={() => { setType("all"); setLevel("all"); setFreeOnly(false); }} className="mt-5 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground" data-testid="button-clear-resource-filters">Clear filters</button>
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          <AnimatePresence initial={false}>
            {list.map((r, i) => {
              const Icon = ICON[r.type];
              return (
                <motion.li key={r.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.02 }}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="group grid gap-4 p-5 transition-colors hover:bg-[hsl(var(--accent)/0.1)] sm:grid-cols-[3rem_1fr_auto] sm:p-6" data-testid={`link-resource-${i}`}>
                    <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", r.type === "tool" ? "bg-[hsl(var(--heap))] text-[hsl(var(--heap-ink))]" : r.type === "video" ? "bg-[hsl(var(--pencil)/0.12)] text-[hsl(var(--pencil))]" : "bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))]")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h2 className="text-lg font-bold group-hover:text-primary">{r.title}</h2>
                        <span className="text-sm text-muted-foreground">{r.author}</span>
                      </div>
                      <p className="mt-1.5 leading-relaxed text-foreground/85">{r.why}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize">{r.type}</span>
                        <DifficultyPill level={r.level} />
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", r.free ? "bg-[hsl(var(--accent)/0.5)]" : "bg-muted text-muted-foreground")}>{r.free ? "free" : "paid"}</span>
                        {r.topics.map((t) => <span key={t} className="font-mono text-[11px] text-muted-foreground">#{t.replace(" ", "-")}</span>)}
                      </div>
                    </div>
                    <ExternalLink className="hidden h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                  </a>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
