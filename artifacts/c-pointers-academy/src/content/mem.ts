import type { HeapBlock, MemCell, MemFrame, MemVar } from "./types";

export function v(name: string, type: string, value: string, addr: string, o: Partial<MemVar> = {}): MemVar {
  return { id: o.id ?? name, name, type, value, addr, ...o };
}

export function c(value: string, o: Partial<MemCell> = {}): MemCell {
  return { value, ...o };
}

export function f(fn: string, vars: MemVar[]): MemFrame {
  return { fn, vars };
}

export function h(id: string, addr: string, size: string, cells: MemCell[], o: Partial<HeapBlock> = {}): HeapBlock {
  return { id, addr, size, cells, ...o };
}

/** Build an int array's cells with ids like `${prefix}[i]`. */
export function cellsOf(prefix: string, values: (string | number)[], o: { changed?: number[]; garbageFrom?: number } = {}): MemCell[] {
  return values.map((val, i) => ({
    id: `${prefix}[${i}]`,
    label: `[${i}]`,
    value: String(val),
    changed: o.changed?.includes(i),
    garbage: o.garbageFrom !== undefined && i >= o.garbageFrom,
  }));
}
