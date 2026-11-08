import { useState } from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import type { QuizQuestion } from "@/content/types";
import { progressActions, useProgress } from "@/lib/progress";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

export function Quiz({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [attempt, setAttempt] = useState(0);
  const progress = useProgress();
  const prior = progress.quizzes[slug];

  const answered = answers.filter((a) => a !== null).length;
  const score = answers.reduce<number>((s, a, i) => s + (a === questions[i].answer ? 1 : 0), 0);
  const done = answered === questions.length;

  const choose = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const next = [...answers];
    next[qi] = oi;
    setAnswers(next);
    if (next.every((a) => a !== null)) {
      const s = next.reduce<number>((acc, a, i) => acc + (a === questions[i].answer ? 1 : 0), 0);
      progressActions.recordQuiz(slug, s, questions.length);
    }
  };

  const retake = () => {
    setAnswers(questions.map(() => null));
    setAttempt((a) => a + 1);
  };

  return (
    <div className="space-y-6" key={attempt}>
      {prior && !done && answered === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground" data-testid="text-prior-score">
          Last attempt: <strong className="text-foreground">{prior.score} / {prior.total}</strong>. Take it again any time; your newest score is saved.
        </p>
      )}
      {questions.map((q, qi) => {
        const picked = answers[qi];
        const locked = picked !== null;
        const right = picked === q.answer;
        return (
          <motion.div
            key={qi}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: qi * 0.04 }}
            className="rounded-2xl border bg-card p-5"
            data-testid={`quiz-question-${qi}`}
          >
            <div className="flex gap-3">
              <span className="font-display text-2xl font-semibold leading-none text-primary/40">{String(qi + 1).padStart(2, "0")}</span>
              <p className="text-[17px] font-bold leading-snug">{q.q}</p>
            </div>
            {q.code && <CodeBlock code={q.code} compact className="mt-4" />}
            <div className="mt-4 grid gap-2">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const isAnswer = q.answer === oi;
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    disabled={locked}
                    onClick={() => choose(qi, oi)}
                    animate={locked && isPicked && !right ? { x: [0, -6, 6, -4, 4, 0] } : locked && isPicked && right ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] transition-colors",
                      !locked && "hover:border-primary/50 hover:bg-secondary/60",
                      locked && isAnswer && "border-[hsl(var(--heap-ink))] bg-[hsl(var(--heap))]",
                      locked && isPicked && !right && "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)]",
                      locked && !isAnswer && !isPicked && "opacity-55",
                    )}
                    data-testid={`button-answer-${qi}-${oi}`}
                  >
                    <span className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold",
                      locked && isAnswer && "border-transparent bg-[hsl(var(--heap-ink))] text-[hsl(var(--heap))]",
                      locked && isPicked && !right && "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
                    )}>
                      {locked && isAnswer ? <Check className="h-3.5 w-3.5" /> : locked && isPicked ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                  </motion.button>
                );
              })}
            </div>
            {locked && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-4 rounded-xl px-4 py-3 text-[15px] leading-relaxed", right ? "bg-[hsl(var(--heap))] text-[hsl(var(--heap-ink))]" : "bg-[hsl(var(--accent)/0.22)]")} data-testid={`text-explanation-${qi}`}>
                <strong>{right ? "Exactly. " : "Not quite. "}</strong>
                <span className="text-foreground">{q.explain}</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed px-5 py-4">
        <p className="text-sm" data-testid="text-quiz-score">
          {done ? (
            <>
              <span className="font-display text-3xl font-semibold text-primary">{score}/{questions.length}</span>{" "}
              <span className="ml-2 text-muted-foreground">{score === questions.length ? "Every arrow in the right place." : score >= questions.length / 2 ? "Solid. Re-read the misses and try once more." : "Worth another pass through the diagrams first."}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{answered} of {questions.length} answered</span>
          )}
        </p>
        {answered > 0 && (
          <button type="button" onClick={retake} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-bold hover:text-primary" data-testid="button-quiz-retake">
            <RotateCcw className="h-4 w-4" /> Retake
          </button>
        )}
      </div>
    </div>
  );
}
