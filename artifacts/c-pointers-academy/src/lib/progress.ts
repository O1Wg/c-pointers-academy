import { useSyncExternalStore } from "react";

export interface QuizResult {
  score: number;
  total: number;
  at: number;
}

export interface ProgressState {
  completed: string[];
  quizzes: Record<string, QuizResult>;
  examplesViewed: string[];
  lastLesson: string | null;
  lastVisitedAt: number | null;
}

const KEY = "cpa.progress.v1";
const empty: ProgressState = { completed: [], quizzes: {}, examplesViewed: [], lastLesson: null, lastVisitedAt: null };

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      quizzes: parsed.quizzes && typeof parsed.quizzes === "object" ? parsed.quizzes : {},
      examplesViewed: Array.isArray(parsed.examplesViewed) ? parsed.examplesViewed : [],
      lastLesson: parsed.lastLesson ?? null,
      lastVisitedAt: parsed.lastVisitedAt ?? null,
    };
  } catch {
    return empty;
  }
}

let state: ProgressState = typeof window === "undefined" ? empty : load();
const listeners = new Set<() => void>();

function commit(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export const progressActions = {
  setComplete(slug: string, done: boolean) {
    const has = state.completed.includes(slug);
    if (done === has) return;
    commit({ ...state, completed: done ? [...state.completed, slug] : state.completed.filter((s) => s !== slug) });
  },
  recordQuiz(slug: string, score: number, total: number) {
    commit({ ...state, quizzes: { ...state.quizzes, [slug]: { score, total, at: Date.now() } } });
  },
  viewExample(slug: string) {
    if (state.examplesViewed.includes(slug)) return;
    commit({ ...state, examplesViewed: [...state.examplesViewed, slug] });
  },
  visitLesson(slug: string) {
    if (state.lastLesson === slug) return;
    commit({ ...state, lastLesson: slug, lastVisitedAt: Date.now() });
  },
  reset() {
    commit(empty);
  },
};

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => empty,
  );
}
