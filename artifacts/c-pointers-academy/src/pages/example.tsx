import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { getExample, workedExamples } from "@/content/examples";
import { getLesson } from "@/content/lessons";
import { CodeBlock } from "@/components/code-block";
import { MemoryDiagram } from "@/components/memory-diagram";
import { DifficultyPill, Eyebrow } from "@/components/bits";
import { RichText } from "@/components/rich-text";
import { progressActions } from "@/lib/progress";
import { useSeo } from "@/lib/seo";
import NotFound from "@/pages/not-found";

export default function ExamplePage() {
  const params = useParams<{ slug: string }>();
  const ex = getExample(params.slug ?? "");
  if (!ex) return <NotFound />;
  return <ExampleView key={ex.slug} slug={ex.slug} />;
}

function ExampleView({ slug }: { slug: string }) {
  const ex = getExample(slug)!;
  useSeo(ex.title, `${ex.summary} A worked C example with step-by-step reasoning and memory diagrams.`);
  useEffect(() => {
    progressActions.viewExample(slug);
  }, [slug]);
  const idx = workedExamples.findIndex((e) => e.slug === slug);
  const next = workedExamples[(idx + 1) % workedExamples.length];

  return (
    <article className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 md:pt-14">
      <Link href="/examples" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary" data-testid="link-back-examples">
        <ArrowLeft className="h-4 w-4" /> All examples
      </Link>
      <header className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Eyebrow>worked example {String(idx + 1).padStart(2, "0")}</Eyebrow>
        <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.04] sm:text-5xl" data-testid="text-example-title">{ex.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DifficultyPill level={ex.difficulty} />
          {ex.topics.map((t) => <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold">{t}</span>)}
        </div>
      </header>

      <section className="mt-10 rounded-2xl border-l-4 border-[hsl(var(--accent))] bg-card p-6 shadow-sm">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">the problem</p>
        <p className="mt-2 text-xl leading-relaxed" data-testid="text-problem"><RichText text={ex.problem} /></p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">Reasoning, one step at a time</h2>
        <ol className="relative mt-8 space-y-8 border-l-2 border-dashed border-primary/30 pl-8">
          {ex.steps.map((s, i) => (
            <li key={i} className="relative" data-testid={`step-${i}`}>
              <span className="absolute -left-[49px] flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 max-w-3xl leading-relaxed text-foreground/85"><RichText text={s.text} /></p>
              {s.code && <CodeBlock code={s.code} compact className="mt-3 max-w-2xl" />}
            </li>
          ))}
        </ol>
      </section>

      {ex.diagram && (
        <section className="mt-14">
          <h2 className="font-display mb-6 text-3xl font-semibold">Memory, step by step</h2>
          <MemoryDiagram diagram={ex.diagram} />
        </section>
      )}

      <section className="mt-14">
        <h2 className="font-display mb-6 text-3xl font-semibold">The complete solution</h2>
        <CodeBlock code={ex.solution} title="solution.c" output={ex.output} testId="code-solution" />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-3xl font-semibold">Common mistakes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ex.mistakes.map((m, i) => (
            <div key={i} className="rounded-2xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.05)] p-5" data-testid={`mistake-${i}`}>
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
              <h3 className="mt-3 font-bold">{m.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80"><RichText text={m.text} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">related lessons</p>
          <div className="mt-3 space-y-2">
            {ex.related.map((r) => {
              const l = getLesson(r);
              if (!l) return null;
              return (
                <Link key={r} href={`/lessons/${r}`} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition hover:border-primary/40 hover:text-primary" data-testid={`link-related-lesson-${r}`}>
                  <span><span className="mr-2 font-mono text-xs text-muted-foreground">{String(l.number).padStart(2, "0")}</span><span className="font-bold">{l.title}</span></span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
        <Link href={`/examples/${next.slug}`} className="group flex flex-col justify-between rounded-2xl bg-[hsl(var(--code-bg))] p-6 text-[hsl(var(--code-fg))]" data-testid="link-next-example">
          <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-60">next example</span>
          <span className="font-display mt-4 text-2xl font-semibold">{next.title}</span>
          <span className="mt-4 inline-flex items-center gap-2 font-bold text-[hsl(var(--accent))]">Keep going <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>
    </article>
  );
}
