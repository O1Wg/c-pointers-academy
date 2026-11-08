import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check, Clock } from "lucide-react";
import { lessons, lessonsInModule, modules } from "@/content/lessons";
import { DifficultyPill, PageHeader, ProgressBar } from "@/components/bits";
import { useProgress } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function LessonsPage() {
  useSeo("Curriculum: 16 lessons on C and pointers", "The full C & Pointers Academy curriculum: C foundations, the memory model, pointers in depth, and mastery of pointer bugs and declarations.");
  const progress = useProgress();
  const total = lessons.reduce((s, l) => s + l.minutes, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="curriculum" title={<>Sixteen lessons. <span className="highlighter">One clear picture</span> of memory.</>}>
        About {Math.round(total / 60 * 10) / 10} hours end to end. Take them in order; every lesson leans on the boxes and arrows from the one before.
      </PageHeader>

      <div className="mb-14 flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:gap-6">
        <p className="shrink-0 font-bold" data-testid="text-overall-progress">{progress.completed.length} of {lessons.length} complete</p>
        <ProgressBar value={progress.completed.length / lessons.length} />
      </div>

      <div className="space-y-16">
        {modules.map((m) => {
          const ls = lessonsInModule(m.number);
          return (
            <section key={m.number} data-testid={`section-module-${m.number}`}>
              <div className="mb-5 flex items-baseline gap-4 border-b-2 border-foreground/80 pb-3">
                <span className="font-display text-5xl font-semibold leading-none text-primary/25">{m.number}</span>
                <div>
                  <h2 className="font-display text-3xl font-semibold">{m.title}</h2>
                  <p className="text-muted-foreground">{m.tagline}</p>
                </div>
              </div>
              <ol className="divide-y">
                {ls.map((l, i) => {
                  const done = progress.completed.includes(l.slug);
                  const quiz = progress.quizzes[l.slug];
                  return (
                    <motion.li key={l.slug} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/lessons/${l.slug}`} className="group grid grid-cols-[2.75rem_1fr] gap-4 rounded-xl px-2 py-5 transition-colors hover:bg-card sm:grid-cols-[3.5rem_1fr_auto] sm:px-4" data-testid={`link-lesson-${l.slug}`}>
                        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition", done ? "border-primary bg-primary text-primary-foreground" : "bg-card group-hover:border-primary/50")}>
                          {done ? <Check className="h-5 w-5" /> : String(l.number).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold transition-colors group-hover:text-primary">{l.title}</h3>
                          <p className="mt-1 max-w-2xl leading-relaxed text-muted-foreground">{l.summary}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 sm:hidden">
                            <DifficultyPill level={l.difficulty} />
                            <span className="font-mono text-xs text-muted-foreground">{l.minutes} min</span>
                          </div>
                        </div>
                        <div className="hidden flex-col items-end gap-2 sm:flex">
                          <DifficultyPill level={l.difficulty} />
                          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {l.minutes} min</span>
                          {quiz && <span className="font-mono text-xs font-bold text-primary" data-testid={`text-quiz-${l.slug}`}>quiz {quiz.score}/{quiz.total}</span>}
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
