export interface LayoutVar {
  id: string;
  name: string;
  type: string;
  size: number;
  value: string;
  addr: string;
  line: number;
  /** Bytes exactly as stored, lowest address first (little-endian). */
  bytes: string[];
  /** Variable this one points to, if it is a pointer. */
  target?: string;
  /** Tint used for this variable everywhere: hue, saturation, lightness. */
  hsl: [number, number, number];
  explain: string;
  /** Optional per-element breakdown (arrays). */
  elements?: { label: string; value: string; addr: string }[];
}

export const LAYOUT_CODE = `#include <stdio.h>

int main(void) {
    int    age = 19;
    char   grade = 'A';
    double gpa = 3.5;
    int    scores[3] = {90, 85, 77};
    int   *p = &age;
    return 0;
}`;

export const BASE_ADDR = 0x7ffe4a00;

export const layoutVars: LayoutVar[] = [
  {
    id: "age",
    name: "age",
    type: "int",
    size: 4,
    value: "19",
    addr: "0x7ffe4a00",
    line: 4,
    bytes: ["13", "00", "00", "00"],
    hsl: [222, 75, 55],
    explain:
      "An int takes 4 bytes. 19 in hex is 0x13, and this machine stores the lowest byte first (little-endian), so the bytes read 13 00 00 00.",
  },
  {
    id: "grade",
    name: "grade",
    type: "char",
    size: 1,
    value: "'A'",
    addr: "0x7ffe4a04",
    line: 5,
    bytes: ["41"],
    hsl: [38, 92, 48],
    explain:
      "A char takes 1 byte and holds a number. 'A' is stored as its ASCII code, 65, which is 0x41. Three unused bytes follow it (padding) so the next variable starts at an aligned address.",
  },
  {
    id: "gpa",
    name: "gpa",
    type: "double",
    size: 8,
    value: "3.5",
    addr: "0x7ffe4a08",
    line: 6,
    bytes: ["00", "00", "00", "00", "00", "00", "0c", "40"],
    hsl: [160, 60, 36],
    explain:
      "A double takes 8 bytes and is stored in IEEE 754 format, so 3.5 looks nothing like the number you typed. Its address ends in 8 because 8-byte values sit on multiples of 8.",
  },
  {
    id: "scores",
    name: "scores",
    type: "int[3]",
    size: 12,
    value: "{90, 85, 77}",
    addr: "0x7ffe4a10",
    line: 7,
    bytes: ["5a", "00", "00", "00", "55", "00", "00", "00", "4d", "00", "00", "00"],
    hsl: [275, 60, 58],
    explain:
      "An array is its elements side by side with no gaps: three ints, 12 bytes. The array's address is the address of scores[0], and each next element is 4 bytes higher.",
    elements: [
      { label: "scores[0]", value: "90", addr: "0x7ffe4a10" },
      { label: "scores[1]", value: "85", addr: "0x7ffe4a14" },
      { label: "scores[2]", value: "77", addr: "0x7ffe4a18" },
    ],
  },
  {
    id: "p",
    name: "p",
    type: "int *",
    size: 8,
    value: "0x7ffe4a00",
    addr: "0x7ffe4a20",
    line: 8,
    bytes: ["00", "4a", "fe", "7f", "00", "00", "00", "00"],
    target: "age",
    hsl: [10, 78, 50],
    explain:
      "A pointer is a variable like any other. Its value is an address: here 0x7ffe4a00, which is where age lives. That is all \"p points to age\" means. On a 64-bit machine a pointer takes 8 bytes.",
  },
];

export interface ByteCell {
  /** Variable id, or "pad" for unused alignment bytes. */
  owner: string;
  hex: string;
  /** Index of this byte inside its variable. */
  index: number;
}

/** Flat 40-byte stack picture, lowest address first, padding included. */
export function buildByteMap(): ByteCell[] {
  const out: ByteCell[] = [];
  const pad = (n: number) => {
    for (let i = 0; i < n; i++) out.push({ owner: "pad", hex: "--", index: i });
  };
  const put = (id: string) => {
    const lv = layoutVars.find((x) => x.id === id)!;
    lv.bytes.forEach((hex, index) => out.push({ owner: id, hex, index }));
  };
  put("age");
  put("grade");
  pad(3);
  put("gpa");
  put("scores");
  pad(4);
  put("p");
  return out;
}

export const BYTES_PER_ROW = 8;
