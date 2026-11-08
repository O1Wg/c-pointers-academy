import { foundationLessons } from "./lessons-foundations";
import { pointerLessonsA } from "./lessons-pointers-a";
import { pointerLessonsB } from "./lessons-pointers-b";
import type { Lesson, Module } from "./types";

export const modules: Module[] = [
  { number: 1, title: "C Foundations", tagline: "Compile, store, branch, repeat. The ground everything else stands on." },
  { number: 2, title: "The Memory Model", tagline: "Where your variables actually live, and for how long." },
  { number: 3, title: "Pointers", tagline: "Addresses, arrows, and every way C lets you follow them." },
  { number: 4, title: "Mastery", tagline: "Find the bugs before they find you. Read any declaration." },
];

export const lessons: Lesson[] = [...foundationLessons, ...pointerLessonsA, ...pointerLessonsB].sort((a, b) => a.number - b.number);

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function lessonsInModule(n: number): Lesson[] {
  return lessons.filter((l) => l.module === n);
}
