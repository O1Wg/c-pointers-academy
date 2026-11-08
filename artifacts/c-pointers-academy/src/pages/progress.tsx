import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { lessons, lessonsInModule, modules } from "@/content/lessons";
import { workedExamples } from "@/content/examples";
import { PageHeader, ProgressBar } from "@/components/bits";
import { progressActions, useProgress } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProgressPage() {
  useSeo("Your progress", "Track completed lessons, quiz scores and worked examples in C & Pointers Academy, and see what to study next.");
  const p = useProgress();
  const { toast } = useToast();
  const next = lessons.find((l) => !p.completed.includes(l.slug));
  const quizEntries = Object.entries(p.quizzes).sort((a, b) => b[1].at - a[1].at);
  const empty = p.completed.length === 0 && quizEntries.length === 0 && p.examplesViewed.length === 0;
  const avg = quizEntries.length ? quizEntries.reduce((s, [, q]) => s + q.score / q.total, 0) / quizEntries.length : 0;

  if (empty) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
        <PageHeader eyebrow="your progress" title="Nothing allocated yet." />
        <div className="grid items-center gap-10 rounded-3xl border-2 border-dashed p-8 sm:p-12 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3" aria-hidden>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold">progress</span>
              <span className="inline-flex h-9 items-center rounded-md border-2 border-dashed border-foreground/30 bg-card px-3 font-mono font-bold text-muted-foreground">NULL</span>
            </div>
            <div className="hatched flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-foreground/20 font-mono text-sm text-muted-foreground">heap: empty</div>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">Your progress pointer is still NULL. Complete a lesson, take a quiz or open an example and this page fills in. Everything is stored in this browser only.</p>
            <Link href={`/lessons/${lessons[0].slug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground" data-testid="link-start-first">
              Start lesson 1: {lessons[0].title} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="your progress" title={<>{p.completed.length === lessons.length ? <>Every lesson done. <span className="highlighter">No leaks.</span></> : <>You are <span className="highlighter">{Math.round((p.completed.length / lessons.length) * 100)}%</span> of the way.</>}</>} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { n: `${p.completed.length}/${lessons.length}`, l: "lessons complete", id: "lessons" },
          { n: quizEntries.length ? `${Math.round(avg * 1000) / 10}%` : "none", l: `average across ${quizEntries.length} quiz${quizEntries.length === 1 ? "" : "zes"}`, id: "quiz" },
          { n: `${p.examplesViewed.length}/${workedExamples.length}`, l: "examples viewed", id: "examples" },
        ].map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl border bg-card p-6" data-testid={`stat-${s.id}`}>
            <p className="font-display text-4xl font-semibold text-primary">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </motion.div>
        ))}
      </div>

      {next && (
        <Link href={`/lessons/${next.slug}`} className="group mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center" data-testid="link-suggested-next">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">suggested next</p>
            <p className="font-display mt-1 text-2xl font-semibold">Lesson {next.number}: {next.title}</p>
            <p className="mt-1 text-sm opacity-80">{next.summary}</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="font-display text-3xl font-semibold">By module</h2>
          <div className="mt-6 space-y-6">
            {modules.map((m) => {
              const ls = lessonsInModule(m.number);
              const done = ls.filter((l) => p.completed.includes(l.slug)).length;
              return (
                <div key={m.number} data-testid={`progress-module-${m.number}`}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-bold">{m.number}. {m.title}</p>
                    <p className="font-mono text-sm text-muted-foreground">{done}/{ls.length}</p>
                  </div>
                  <ProgressBar value={done / ls.length} className="mt-2" />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ls.map((l) => {
                      const c = p.completed.includes(l.slug);
                      return (
                        <Link key={l.slug} href={`/lessons/${l.slug}`} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition hover:border-primary/40", c && "border-primary/30 bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))]")}>
                          {c && <CheckCircle2 className="h-3 w-3" />} {l.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-semibold">Quiz scores</h2>
          {quizEntries.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed p-5 text-muted-foreground">No quizzes taken yet. Each lesson ends with one; they take about two minutes.</p>
          ) : (
            <ul className="mt-6 divide-y rounded-2xl border bg-card">
              {quizEntries.map(([slug, q]) => {
                const l = lessons.find((x) => x.slug === slug);
                if (!l) return null;
                const pct = q.score / q.total;
                return (
                  <li key={slug}>
                    <Link href={`/lessons/${slug}#quiz`} className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-muted/50" data-testid={`row-quiz-${slug}`}>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{l.number}. {l.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(q.at, { addSuffix: true })}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-lg px-2.5 py-1 font-mono text-sm font-bold", pct === 1 ? "bg-[hsl(var(--heap))] text-[hsl(var(--heap-ink))]" : pct >= 0.5 ? "bg-[hsl(var(--accent)/0.4)]" : "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]")}>{q.score}/{q.total}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <h2 className="font-display mt-10 text-3xl font-semibold">Examples viewed</h2>
          {p.examplesViewed.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed p-5 text-muted-foreground">None yet. <Link href="/examples" className="font-bold text-primary">Browse worked examples</Link>.</p>
          ) : (
            <ul className="mt-6 space-y-1.5">
              {p.examplesViewed.map((s) => {
                const e = workedExamples.find((x) => x.slug === s);
                return e ? (
                  <li key={s}><Link href={`/examples/${s}`} className="flex items-center gap-2 text-sm font-bold hover:text-primary"><CheckCircle2 className="h-4 w-4 text-primary" /> {e.title}</Link></li>
                ) : null;
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[hsl(var(--destructive)/0.3)] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-bold">Start over</p>
          <p className="text-sm text-muted-foreground">Clears completed lessons, quiz scores and viewed examples from this browser.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--destructive)/0.5)] px-4 py-2 font-bold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.08)]" data-testid="button-reset-progress">
              <Trash2 className="h-4 w-4" /> Reset progress
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-2xl">free(progress)?</AlertDialogTitle>
              <AlertDialogDescription>This permanently clears your completed lessons, quiz scores and viewed examples. There is no undo.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-reset-cancel">Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={() => { progressActions.reset(); toast({ title: "Progress reset", description: "A clean heap. Start whenever you are ready." }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-reset-confirm">
                Reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
