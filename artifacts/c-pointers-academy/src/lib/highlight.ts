export interface Token {
  text: string;
  cls?: string;
}

const KW = new Set(["if", "else", "for", "while", "do", "return", "break", "continue", "switch", "case", "default", "sizeof", "typedef", "struct", "union", "enum", "const", "static", "extern", "goto", "volatile", "register", "inline", "restrict"]);
const TY = new Set(["int", "char", "float", "double", "void", "long", "short", "unsigned", "signed", "size_t", "ptrdiff_t", "bool", "int32_t", "uint8_t", "int64_t", "FILE", "IntVec", "Transform", "UnaryOp", "NULL"]);

const RE = /(\/\*.*?\*\/|\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(0x[0-9a-fA-F]+|\b\d+(?:\.\d+)?[fFuUlL]*\b)|([A-Za-z_]\w*)|(->|\+\+|--|[*&])/g;

export function tokenizeLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, cls: "tok-pre" }];
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  RE.lastIndex = 0;
  while ((m = RE.exec(line)) !== null) {
    if (m.index > last) out.push({ text: line.slice(last, m.index) });
    const [t, com, str, num, ident, op] = m;
    if (com) out.push({ text: t, cls: "tok-com" });
    else if (str) out.push({ text: t, cls: "tok-str" });
    else if (num) out.push({ text: t, cls: "tok-num" });
    else if (ident) {
      if (KW.has(ident)) out.push({ text: t, cls: "tok-kw" });
      else if (TY.has(ident)) out.push({ text: t, cls: "tok-ty" });
      else if (/^\s*\(/.test(line.slice(m.index + t.length))) out.push({ text: t, cls: "tok-fn" });
      else out.push({ text: t });
    } else if (op) out.push({ text: t, cls: "tok-op" });
    last = m.index + t.length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}
