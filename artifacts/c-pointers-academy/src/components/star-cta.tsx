import { Github, Star } from "lucide-react";
import { Eyebrow } from "@/components/bits";

export const REPO_URL = "https://github.com/O1Wg/c-pointers-academy";

export function StarCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" data-testid="section-star">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[hsl(var(--accent))] opacity-20 blur-2xl"
        />
        <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <Eyebrow className="text-[hsl(var(--accent))]">free and open source</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              If you like it, please star it.
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              C & Pointers Academy is free and the code is on GitHub. A star takes one click and helps other students find it.
            </p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-3 rounded-xl bg-[hsl(var(--accent))] px-6 py-4 font-bold text-accent-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            data-testid="link-star-repo"
          >
            <Github className="h-5 w-5" />
            Star it on GitHub
            <Star className="h-5 w-5 transition-transform group-hover:rotate-12 group-hover:fill-current" />
          </a>
        </div>
      </div>
    </section>
  );
}
