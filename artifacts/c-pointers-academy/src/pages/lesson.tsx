import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { getLesson, lessons, modules } from "@/content/lessons";
import { workedExamples } from "@/content/examples";
import { CodeBlock } from "@/components/code-block";
import { MemoryDiagram } from "@/components/memory-diagram";
import { RichText } from "@/components/rich-text";
import { Quiz } from "@/components/quiz";
import { DifficultyPill, Eyebrow } from "@/components/bits";
import { progressActions, useProgress } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const lesson = getLesson(params.slug ?? "");
  if (!lesson) return <NotFound />;
  return <LessonView key={lesson.slug} slug={lesson.slug} />;
}

function LessonView({ slug }: { slug: string }) {
  const lesson = getLesson(slug)!;
  const progress = useProgress();
  const { toast } = useToast();
  useSeo(`Lesson ${lesson.number}: ${lesson.title}`, lesson.summary);

  useEffect(() => {
    progressActions.visitLesson(slug);
  }, [slug]);

  const idx = lessons.findIndex((l) => l.slug === slug);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const mod = modules.find((m) => m.number === lesson.module)!;
  const done = progress.completed.includes(slug);
  const related = workedExamples.filter((e) => e.related.includes(slug)).slice(0, 3);

  const toggle = () => {
    progressActions.setComplete(slug, !done);
    if (!done) toast({ title: `Lesson ${lesson.number} complete`, description: next ? `Next up: ${next.title}` : "That was the final lesson. Well done." });
  };

  const toc = [
    ...lesson.sections.map((s, i) => ({ id: `s-${i}`, label: s.heading })),
    { id: "code", label: "Annotated code" },
    ...(lesson.diagrams.length ? [{ id: "diagram", label: "Memory diagram" }] : []),
    { id: "takeaways", label: "Key takeaways" },
    { id: "quiz", label: "Check yourself" },
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 md:pt-14">
      <Link href="/lessons" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary" data-testid="link-back-lessons">
        <ArrowLeft className="h-4 w-4" /> All lessons
      </Link>

      <header className="mt-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Eyebrow>module {mod.number} · {mod.title} · lesson {lesson.number}</Eyebrow>
        <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.02] sm:text-6xl" data-testid="text-lesson-title">{lesson.title}</h1>
        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">{lesson.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <DifficultyPill level={lesson.difficulty} />
          <span className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {lesson.minutes} min</span>
          {done && <span className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> completed</span>}
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-16">
          <div className="prose-lesson max-w-3xl space-y-12">
            {lesson.sections.map((s, i) => (
              <section key={i} id={`s-${i}`} className="scroll-mt-24">
                <h2 className="font-display text-3xl font-semibold">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-[17px] text-foreground/85">
                  {s.body.map((p, j) => <p key={j}><RichText text={p} /></p>)}
                </div>
              </section>
            ))}
          </div>

          <section id="code" className="scroll-mt-24">
            <SectionTitle n="A" title="Annotated code" sub="Hover a numbered note to light up its line." />
            <div className="grid gap-8 xl:grid-cols-2">
              {lesson.examples.map((ex, i) => (
                <CodeBlock key={i} title={ex.title} code={ex.code} annotations={ex.annotations} output={ex.output} testId={`code-example-${i}`} />
              ))}
            </div>
          </section>

          {lesson.diagrams.length > 0 && (
            <section id="diagram" className="scroll-mt-24">
              <SectionTitle n="B" title="Watch the memory" sub="Step forward and back. Click the diagram and use your arrow keys." />
              <div className="space-y-8">
                {lesson.diagrams.map((d) => <MemoryDiagram key={d.id} diagram={d} />)}
              </div>
            </section>
          )}

          <section id="takeaways" className="scroll-mt-24">
            <SectionTitle n="C" title="Key takeaways" />
            <ul className="grid gap-3 md:grid-cols-2">
              {lesson.takeaways.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-xl border bg-card p-4 leading-relaxed">
                  <span className="mt-1 h-3 w-3 shrink-0 rotate-45 bg-[hsl(var(--accent))]" />
                  <span><RichText text={t} /></span>
                </li>
              ))}
            </ul>
          </section>

          <section id="quiz" className="max-w-3xl scroll-mt-24">
            <SectionTitle n="D" title="Check yourself" sub="Answers lock in on first click. Explanations appear right away." />
            <Quiz slug={slug} questions={lesson.quiz} />
          </section>

          <section className="max-w-3xl">
            <button
              type="button"
              onClick={toggle}
              className={cn("flex w-full items-center justify-center gap-3 rounded-2xl border-2 px-6 py-5 text-lg font-bold transition hover:-translate-y-0.5", done ? "border-primary/30 bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))]" : "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_-14px_hsl(var(--primary))]")}
              data-testid="button-mark-complete"
            >
              {done ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
              {done ? "Completed. Click to mark as not done" : "Mark this lesson complete"}
            </button>

            {related.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">practise this</p>
                <div className="mt-3 space-y-2">
                  {related.map((e) => (
                    <Link key={e.slug} href={`/examples/${e.slug}`} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 font-bold transition hover:border-primary/40 hover:text-primary" data-testid={`link-related-example-${e.slug}`}>
                      {e.title} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <nav className="mt-10 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link href={`/lessons/${prev.slug}`} className="group rounded-2xl border bg-card p-5 transition hover:border-primary/40" data-testid="link-prev-lesson">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" /> previous</span>
                  <span className="mt-1 block font-display text-xl font-semibold group-hover:text-primary">{prev.title}</span>
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/lessons/${next.slug}`} className="group rounded-2xl border bg-card p-5 text-right transition hover:border-primary/40" data-testid="link-next-lesson">
                  <span className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">next <ArrowRight className="h-3.5 w-3.5" /></span>
                  <span className="mt-1 block font-display text-xl font-semibold group-hover:text-primary">{next.title}</span>
                </Link>
              ) : (
                <Link href="/progress" className="group rounded-2xl border-2 border-dashed p-5 text-right transition hover:border-primary/40" data-testid="link-finish">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">course finished</span>
                  <span className="mt-1 block font-display text-xl font-semibold group-hover:text-primary">See your progress</span>
                </Link>
              )}
            </nav>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">on this page</p>
              <ul className="mt-3 space-y-1 border-l-2">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth" }); }} className="-ml-[2px] block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={toggle} className={cn("flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition", done ? "border-primary/30 bg-[hsl(var(--stack))] text-[hsl(var(--stack-ink))]" : "hover:border-primary/50")} data-testid="button-aside-complete">
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {done ? "Completed" : "Mark complete"}
            </button>
            {progress.quizzes[slug] && (
              <p className="text-sm text-muted-foreground">Quiz best so far: <strong className="text-foreground">{progress.quizzes[slug].score}/{progress.quizzes[slug].total}</strong></p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

function SectionTitle({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 flex items-end gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--code-bg))] font-mono font-bold text-[hsl(var(--accent))]">{n}</span>
      <div>
        <h2 className="font-display text-3xl font-semibold leading-none">{title}</h2>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
