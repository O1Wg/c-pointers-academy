import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const [location] = useLocation();
  useEffect(() => {
    document.title = "Page not found | C & Pointers Academy";
  }, []);

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-4xl flex-col justify-center px-4 py-16 sm:px-6">
      <p className="font-mono text-sm text-[hsl(var(--destructive))]">Segmentation fault (core dumped)</p>
      <h1 className="font-display mt-3 text-5xl font-semibold leading-none sm:text-7xl">
        Nothing lives at <span className="highlighter">this address.</span>
      </h1>
      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-6" aria-hidden>
        <div>
          <p className="font-mono text-sm font-bold">page</p>
          <p className="font-mono text-[11px] text-muted-foreground">char *</p>
        </div>
        <span className="inline-flex h-10 items-center rounded-md border-2 border-[hsl(var(--destructive)/0.5)] bg-card px-3 font-mono text-sm font-bold text-[hsl(var(--destructive))] line-through" data-testid="text-bad-path">{location}</span>
        <svg width="90" height="24" viewBox="0 0 90 24"><path d="M2 12 H78" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="5 5" /><path d="M74 6 L84 12 L74 18" fill="hsl(var(--muted-foreground))" /></svg>
        <span className="hatched inline-flex h-16 w-32 items-center justify-center rounded-xl border-2 border-dashed border-foreground/25 font-mono text-sm text-muted-foreground">unmapped</span>
      </div>
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">The link you followed points at memory we never allocated. It happens to the best of us. Let's take you somewhere valid.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground" data-testid="link-404-home">Back to home <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/lessons" className="inline-flex items-center gap-2 rounded-xl border-2 bg-card px-5 py-3 font-bold hover:text-primary" data-testid="link-404-lessons">Browse lessons</Link>
      </div>
    </div>
  );
}
