import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight, Eye, SearchX } from "lucide-react";
import { workedExamples } from "@/content/examples";
import type { Difficulty, ExampleTopic } from "@/content/types";
import { DifficultyPill, PageHeader } from "@/components/bits";
import { useProgress } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const TOPICS: ExampleTopic[] = ["pointers", "strings", "arrays", "dynamic memory", "linked lists", "functions", "debugging"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced"];

export default function ExamplesPage() {
  useSeo("Worked examples in C pointers", "Step-by-step worked C examples: swapping, string reversal, dynamic arrays, linked lists, 2D matrices, qsort and dangling pointers, with memory diagrams.");
  const [topic, setTopic] = useState<ExampleTopic | "all">("all");
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const progress = useProgress();

  const list = useMemo(() => workedExamples.filter((e) => (topic === "all" || e.topics.includes(topic)) && (level === "all" || e.difficulty === level)), [topic, level]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="worked examples" title={<>Watch a problem get <span className="highlighter">solved slowly.</span></>}>
        Each example walks the reasoning one step at a time, shows memory where it moves, and lists the mistakes you are statistically about to make.
      </PageHeader>

      <div className="mb-10 space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-16 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">topic</span>
          {(["all", ...TOPICS] as const).map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(t)} testId={`filter-topic-${t.replace(" ", "-")}`}>{t}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-16 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">level</span>
          {(["all", ...LEVELS] as const).map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)} testId={`filter-level-${l}`}>{l}</Chip>
          ))}
        </div>
      </div>

      <p className="mb-4 font-mono text-sm text-muted-foreground" data-testid="text-example-count">{list.length} example{list.length === 1 ? "" : "s"}</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="font-display mt-4 text-2xl font-semibold">No examples match that pair.</p>
          <p className="mt-1 text-muted-foreground">Like dereferencing NULL: nothing lives at this address.</p>
          <button type="button" onClick={() => { setTopic("all"); setLevel("all"); }} className="mt-5 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground" data-testid="button-clear-filters">Clear filters</button>
        </div>
      ) : (
        <motion.ul layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((e, i) => {
              const seen = progress.examplesViewed.includes(e.slug);
              return (
                <motion.li key={e.slug} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, delay: i * 0.03 }} className={cn(i === 0 && list.length > 2 && "md:col-span-2")}>
                  <Link href={`/examples/${e.slug}`} className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.6)]" data-testid={`card-example-${e.slug}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono text-xs text-muted-foreground">example {String(workedExamples.indexOf(e) + 1).padStart(2, "0")}</span>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <h2 className={cn("font-display mt-2 font-semibold leading-tight group-hover:text-primary", i === 0 && list.length > 2 ? "text-3xl" : "text-2xl")}>{e.title}</h2>
                    <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{e.summary}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <DifficultyPill level={e.difficulty} />
                      {e.topics.map((t) => <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold">{t}</span>)}
                      {seen && <span className="ml-auto flex items-center gap-1 text-xs font-bold text-primary"><Eye className="h-3.5 w-3.5" /> viewed</span>}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

export function Chip({ active, onClick, children, testId }: { active: boolean; onClick: () => void; children: ReactNode; testId: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-full border-2 px-3 py-1 text-sm font-bold capitalize transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/40")} data-testid={testId}>
      {children}
    </button>
  );
}
