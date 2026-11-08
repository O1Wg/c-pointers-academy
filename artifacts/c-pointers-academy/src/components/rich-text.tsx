// Inline markup for prose: **bold** and `code`.
// Bold may contain single asterisks and inline code (C prose is full of `*p`),
// so the bold pattern only treats "**" as a delimiter when it hugs non-space text.
const BOLD = String.raw`\*\*(?=\S)(?:[^*]|\*(?!\*))+?(?<=\S)\*\*`;
const CODE = String.raw`\x60[^\x60]+\x60`;
const TOKEN = new RegExp(`(${CODE}|${BOLD})`, "g");
const CODE_ONLY = new RegExp(`(${CODE})`, "g");

function renderCode(text: string, keyPrefix: string) {
  return text.split(CODE_ONLY).map((p, i) => {
    if (p.length > 1 && p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={`${keyPrefix}-${i}`} className="inline-code">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{p}</span>;
  });
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.length > 1 && p.startsWith("`") && p.endsWith("`")) {
          return (
            <code key={i} className="inline-code">
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-foreground">
              {renderCode(p.slice(2, -2), String(i))}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
