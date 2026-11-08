export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface MemCell {
  id?: string;
  label?: string;
  value: string;
  ptr?: string;
  nul?: boolean;
  dangling?: boolean;
  garbage?: boolean;
  changed?: boolean;
}

export interface MemVar {
  id: string;
  name: string;
  type: string;
  value: string;
  addr: string;
  ptr?: string;
  nul?: boolean;
  dangling?: boolean;
  garbage?: boolean;
  changed?: boolean;
  cells?: MemCell[];
  note?: string;
}

export interface MemFrame {
  fn: string;
  vars: MemVar[];
}

export interface HeapBlock {
  id: string;
  addr: string;
  size: string;
  label?: string;
  cells: MemCell[];
  freed?: boolean;
  changed?: boolean;
}

export interface MemStep {
  line: number;
  note: string;
  stack: MemFrame[];
  heap?: HeapBlock[];
  statics?: MemVar[];
  output?: string;
}

export interface MemDiagram {
  id: string;
  title: string;
  blurb?: string;
  code: string;
  steps: MemStep[];
}

export interface Annotation {
  line: number;
  note: string;
}

export interface CodeExample {
  title: string;
  code: string;
  annotations?: Annotation[];
  output?: string;
}

export interface Section {
  heading: string;
  body: string[];
}

export interface QuizQuestion {
  q: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Lesson {
  slug: string;
  module: number;
  number: number;
  title: string;
  summary: string;
  minutes: number;
  difficulty: Difficulty;
  sections: Section[];
  examples: CodeExample[];
  diagrams: MemDiagram[];
  takeaways: string[];
  quiz: QuizQuestion[];
}

export interface Module {
  number: number;
  title: string;
  tagline: string;
}

export interface ExampleStep {
  title: string;
  text: string;
  code?: string;
}

export type ExampleTopic = "pointers" | "strings" | "arrays" | "dynamic memory" | "linked lists" | "functions" | "debugging";

export interface WorkedExample {
  slug: string;
  title: string;
  summary: string;
  topics: ExampleTopic[];
  difficulty: Difficulty;
  problem: string;
  steps: ExampleStep[];
  diagram?: MemDiagram;
  solution: string;
  output?: string;
  mistakes: { title: string; text: string }[];
  related: string[];
}

export type ResourceType = "book" | "docs" | "video" | "tool" | "course" | "tutorial";

export interface Resource {
  title: string;
  author: string;
  url: string;
  type: ResourceType;
  level: Difficulty;
  free: boolean;
  topics: string[];
  why: string;
}
