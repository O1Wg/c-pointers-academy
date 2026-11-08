import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Cpu, MousePointerClick, RotateCcw } from "lucide-react";
import { lessons, modules, lessonsInModule } from "@/content/lessons";
import { workedExamples } from "@/content/examples";
import { firstPointerDiagram } from "@/content/diagrams";
import { MemoryDiagram } from "@/components/memory-diagram";
import { DifficultyPill, Eyebrow, ProgressBar } from "@/components/bits";
import { useProgress } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function Home() {
  useSeo("Learn C pointers by seeing memory", "A patient, visual course in C and pointers: 16 lessons, step-through memory diagrams, worked examples and an interactive memory visualizer.");
  const progress = useProgress();
  const last = progress.lastLesson ? lessons.find((l) => l.slug === progress.lastLesson) : undefined;
  const next = lessons.find((l) => !progress.completed.includes(l.slug));
  const resume = last && !progress.completed.includes(last.slug) ? last : next ?? lessons[0];
  const started = progress.completed.length > 0 || !!progress.lastLesson;

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Eyebrow>a course in C, drawn by hand</Eyebrow>
          <h1 className="font-display mt-5 text-[2.9rem] font-semibold leading-[0.98] sm:text-6xl xl:text-7xl">
            Pointers stop being scary when you can <span className="highlighter">see them.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Every lesson here draws the memory for you: the boxes on the stack, the blocks on the heap, and the red-pencil arrows between them. Step through line by line until the picture in your head matches the one on the page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/lessons/${resume.slug}`} className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--primary))] transition hover:-translate-y-0.5" data-testid="link-hero-start">
              {started ? `Continue: ${resume.title}` : "Start with lesson 1"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/visualizer" className="inline-flex items-center gap-2 rounded-xl border-2 bg-card px-5 py-3.5 font-bold transition hover:border-primary/40 hover:text-primary" data-testid="link-hero-visualizer">
              Open the visualizer
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {[
              [String(lessons.length), "lessons"],
              [String(workedExamples.length), "worked examples"],
              [String(lessons.reduce((s, l) => s + l.diagrams.reduce((a, d) => a + d.steps.length, 0), 0)), "diagram steps"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-semibold text-primary">{n}</dt>
                <dd className="text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
          <div className="absolute -inset-3 -z-10 rotate-[1.2deg] rounded-[1.75rem] bg-[hsl(var(--accent)/0.35)]" />
          <MemoryDiagram diagram={firstPointerDiagram} autoplay className="shadow-[0_30px_60px_-30px_hsl(var(--primary)/0.55)]" />
          <p className="mt-3 text-center font-mono text-xs text-muted-foreground">live diagram: press Step, or use the arrow keys</p>
        </motion.div>
      </section>

      {/* CONTINUE */}
      {started && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 rounded-2xl border-2 border-primary/20 bg-[hsl(var(--stack))] p-6 sm:flex-row sm:items-center sm:justify-between" data-testid="card-continue">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><RotateCcw className="h-5 w-5" /></span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[hsl(var(--stack-ink))]">welcome back</p>
                <p className="font-display text-2xl font-semibold">Lesson {resume.number}: {resume.title}</p>
                <p className="text-sm text-muted-foreground">{progress.completed.length} of {lessons.length} lessons complete</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-64">
              <ProgressBar value={progress.completed.length / lessons.length} />
              <Link href={`/lessons/${resume.slug}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground" data-testid="link-continue">
                Pick up where you left off <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* HOW TO READ A DIAGRAM */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>the legend</Eyebrow>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Five marks. That is the whole visual language.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Learn to read these once and every diagram on the site, and most whiteboard explanations you will ever see, become obvious.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "A stack box", d: "A local variable. Name and type on the left, value in the box, address on the right.", el: <span className="inline-flex h-9 min-w-12 items-center justify-center rounded-md border-2 border-foreground/20 bg-card px-2 font-mono font-bold">19</span> },
              { t: "A red-pencil arrow", d: "A pointer. The box holds an address; the arrow shows where that address leads.", el: <svg width="70" height="20" aria-hidden><path d="M2 10 C 25 10, 45 10, 62 10" stroke="hsl(var(--pencil))" strokeWidth="2.5" fill="none" /><path d="M58 4 L 68 10 L 58 16" fill="hsl(var(--pencil))" /></svg> },
              { t: "A heap block", d: "Memory from malloc. Lives until free, no matter which function is running.", el: <span className="inline-flex h-9 items-center rounded-md border-2 border-[hsl(var(--heap-ink)/0.5)] bg-[hsl(var(--heap))] px-3 font-mono text-xs font-bold text-[hsl(var(--heap-ink))]">0x5591a2b0</span> },
              { t: "NULL", d: "A pointer that deliberately points nowhere. Safe to hold, fatal to follow.", el: <span className="inline-flex h-9 items-center rounded-md border-2 border-dashed border-foreground/30 bg-card px-3 font-mono font-bold text-muted-foreground">NULL</span> },
              { t: "Garbage and freed memory", d: "Hatching means \"do not trust this\": uninitialised values, or blocks already given back.", el: <span className="hatched inline-flex h-9 items-center rounded-md border-2 border-dashed border-foreground/25 px-3 font-mono font-bold text-muted-foreground">???</span> },
              { t: "Yellow highlighter", d: "Whatever just changed on this step. Your eye goes there first; so should your attention.", el: <span className="inline-flex h-9 items-center rounded-md border-2 border-[hsl(var(--accent-foreground)/0.5)] bg-[hsl(var(--accent)/0.6)] px-3 font-mono font-bold">20</span> },
            ].map((x, i) => (
              <motion.div key={x.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border bg-card p-5">
                <div className="flex h-10 items-center">{x.el}</div>
                <h3 className="mt-4 font-bold">{x.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING PATH */}
      <section className="border-y bg-[hsl(var(--muted)/0.45)] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>the path</Eyebrow>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">From printf to int (*fp)(int), in sixteen honest steps.</h2>
            </div>
            <Link href="/lessons" className="inline-flex items-center gap-2 font-bold text-primary hover:underline" data-testid="link-all-lessons">See the full curriculum <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ol className="relative mt-14 space-y-10 border-l-2 border-dashed border-primary/30 pl-8 md:pl-12">
            {modules.map((m) => {
              const ls = lessonsInModule(m.number);
              const done = ls.filter((l) => progress.completed.includes(l.slug)).length;
              return (
                <motion.li key={m.number} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45 }} className="relative">
                  <span className={cn("absolute -left-[45px] top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs font-bold md:-left-[61px]", done === ls.length ? "border-primary bg-primary text-primary-foreground" : "border-primary bg-background text-primary")}>{m.number}</span>
                  <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{m.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{m.tagline}</p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{done}/{ls.length} complete</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ls.map((l) => {
                        const c = progress.completed.includes(l.slug);
                        return (
                          <Link key={l.slug} href={`/lessons/${l.slug}`} className={cn("group inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm font-bold transition hover:-translate-y-0.5", c ? "border-primary/30 bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))]" : "bg-card hover:border-primary/40")} data-testid={`link-path-${l.slug}`}>
                            <span className="font-mono text-xs opacity-60">{String(l.number).padStart(2, "0")}</span>
                            {l.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* THREE WAYS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Eyebrow>three ways in</Eyebrow>
        <div className="mt-8 grid gap-4 lg:grid-cols-6">
          <Link href="/lessons" className="group rounded-2xl border bg-card p-7 transition hover:border-primary/40 lg:col-span-3 lg:row-span-2" data-testid="link-way-lessons">
            <BookOpen className="h-7 w-7 text-primary" />
            <h3 className="font-display mt-5 text-3xl font-semibold">Read a lesson</h3>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">Explanations written for a person, annotated code you can hover line by line, a memory diagram wherever memory moves, and a short quiz that tells you why, not just whether.</p>
            <div className="mt-6 space-y-2">
              {lessons.slice(6, 9).map((l) => (
                <div key={l.slug} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                  <span className="font-bold">{l.number}. {l.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{l.minutes} min</span>
                </div>
              ))}
            </div>
          </Link>
          <Link href="/examples" className="group rounded-2xl border bg-card p-7 transition hover:border-primary/40 lg:col-span-3" data-testid="link-way-examples">
            <Cpu className="h-7 w-7 text-[hsl(var(--heap-ink))]" />
            <h3 className="font-display mt-5 text-2xl font-semibold">Work an example</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">Real problems, solved one reasoning step at a time, with the mistakes everyone makes listed honestly.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {workedExamples.slice(0, 4).map((e) => <span key={e.slug} className="rounded-full border px-2.5 py-1 text-xs font-bold">{e.title}</span>)}
            </div>
          </Link>
          <Link href="/visualizer" className="group rounded-2xl border bg-[hsl(var(--code-bg))] p-7 text-[hsl(var(--code-fg))] transition hover:-translate-y-0.5 lg:col-span-3" data-testid="link-way-visualizer">
            <MousePointerClick className="h-7 w-7 text-[hsl(var(--accent))]" />
            <h3 className="font-display mt-5 text-2xl font-semibold">Step through a program</h3>
            <p className="mt-2 leading-relaxed opacity-70">Six small programs, every line traced. Swap, malloc and free, linked lists, dangling pointers.</p>
            <span className="mt-4 inline-flex items-center gap-2 font-bold text-[hsl(var(--accent))]">Open visualizer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>

      {/* PICKED EXAMPLES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border-2 border-dashed p-8 sm:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:items-center">
            <div>
              <Eyebrow>the night before the exam?</Eyebrow>
              <h2 className="font-display mt-3 text-4xl font-semibold leading-tight">Start with the question everybody asks.</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">"Why doesn't my function change my variable?" Once you can draw the answer, half of pointers falls into place.</p>
            </div>
            <div className="space-y-3">
              {["why-doesnt-my-function-change-my-variable", "swap-two-integers", "dangling-pointer-after-free"].map((slug) => {
                const e = workedExamples.find((x) => x.slug === slug);
                if (!e) return null;
                return (
                  <Link key={slug} href={`/examples/${slug}`} className="group flex items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 transition hover:border-primary/40" data-testid={`link-featured-${slug}`}>
                    <div>
                      <p className="font-bold">{e.title}</p>
                      <p className="text-sm text-muted-foreground">{e.summary}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <DifficultyPill level={e.difficulty} className="hidden sm:inline-flex" />
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
