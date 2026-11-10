import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Github, Menu, Moon, Star, Sun, X } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { lessons } from "@/content/lessons";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/lessons", label: "Lessons" },
  { href: "/examples", label: "Examples" },
  { href: "/memory-layout", label: "Memory Layout" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/resources", label: "Resources" },
  { href: "/progress", label: "Progress" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 items-center gap-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-primary bg-card font-mono text-sm font-bold text-primary">*p</span>
        <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden><path d="M0 5 H12 M8 1 L13 5 L8 9" stroke="hsl(var(--pencil))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--accent))] font-mono text-sm font-bold text-accent-foreground">42</span>
      </span>
      <span className="font-display text-lg font-semibold leading-none">
        C <span className="text-[hsl(var(--pencil))]">&amp;</span> Pointers
        <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Academy</span>
      </span>
    </span>
  );
}

function useTheme() {
  const [dark, setDark] = useState(() => typeof window !== "undefined" && localStorage.getItem("cpa.theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cpa.theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const progress = useProgress();
  const pct = Math.round((progress.completed.length / lessons.length) * 100);

  useEffect(() => setOpen(false), [location]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0" data-testid="link-home"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = location === n.href || location.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href} className={cn("relative rounded-lg px-3 py-2 text-[15px] font-bold transition-colors hover:text-primary", active ? "text-primary" : "text-foreground/70")} data-testid={`link-nav-${n.label.toLowerCase()}`}>
                  {n.label}
                  {active && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-[hsl(var(--accent))]" />}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/progress" className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-bold sm:flex" data-testid="link-progress-pill">
              <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                <span className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </span>
              <span className="tabular-nums">{progress.completed.length}/{lessons.length}</span>
            </Link>
            <button type="button" onClick={toggle} aria-label="Toggle dark mode" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card transition hover:text-primary" data-testid="button-theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card md:hidden" data-testid="button-menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-background px-4 py-3 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("block rounded-lg px-3 py-2.5 font-bold", location.startsWith(n.href) ? "bg-secondary text-primary" : "")} data-testid={`link-mobile-${n.label.toLowerCase()}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-24 border-t bg-[hsl(var(--muted)/0.5)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Boxes, arrows and patience. A study companion for anyone who has stared at a segfault and wondered where it all went wrong.</p>
            <p className="mt-5 text-sm text-muted-foreground">
              Created by <span className="font-bold text-foreground" data-testid="text-author">Ahmed Alharbi</span>
              <span className="mx-2 text-border">|</span>
              <a
                href="https://github.com/O1Wg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-foreground hover:text-primary"
                data-testid="link-github"
              >
                <Github className="h-4 w-4" />
                O1Wg
              </a>
            </p>
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Learn</p>
            <ul className="mt-3 space-y-2 text-sm font-bold">
              <li><Link href="/lessons" className="hover:text-primary">Curriculum</Link></li>
              <li><Link href="/examples" className="hover:text-primary">Worked examples</Link></li>
              <li><Link href="/memory-layout" className="hover:text-primary">Memory layout</Link></li>
              <li><Link href="/visualizer" className="hover:text-primary">Memory visualizer</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Keep going</p>
            <ul className="mt-3 space-y-2 text-sm font-bold">
              <li><Link href="/resources" className="hover:text-primary">Resources</Link></li>
              <li><Link href="/progress" className="hover:text-primary">Your progress</Link></li>
              <li>
                <a href="https://github.com/O1Wg/c-pointers-academy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary" data-testid="link-footer-star">
                  <Star className="h-3.5 w-3.5" /> Like it? Star it on GitHub
                </a>
              </li>
            </ul>
            <p className="mt-6 font-mono text-xs text-muted-foreground">return 0; /* exited normally */</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
