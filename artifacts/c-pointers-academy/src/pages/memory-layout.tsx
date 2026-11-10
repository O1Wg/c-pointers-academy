import { Link } from "wouter";
import { ArrowRight, Hash, MapPin, Tag } from "lucide-react";
import { MemoryLayout } from "@/components/memory-layout";
import { PageHeader } from "@/components/bits";
import { useSeo } from "@/lib/seo";

const IDEAS = [
  {
    icon: Tag,
    title: "Variable",
    text: "A name you chose for a spot in memory. The compiler replaces every use of the name with that spot's address, so the name itself does not exist at run time.",
  },
  {
    icon: Hash,
    title: "Value",
    text: "The bytes currently stored in that spot. The type decides how many bytes there are and how to read them: the same four bytes mean 19 as an int and something else as a float.",
  },
  {
    icon: MapPin,
    title: "Address",
    text: "The number of the first byte of the spot. Every byte in memory has one, shown in hex. A pointer is simply a variable whose value is one of these addresses.",
  },
];

export default function MemoryLayoutPage() {
  useSeo(
    "Memory layout: variables, values and addresses",
    "See how C variables sit in memory: each variable's name, value and address, the exact bytes behind it, sizes, alignment padding and what a pointer really stores.",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 md:pt-16">
      <PageHeader eyebrow="memory layout" title={<>Every variable has a <span className="highlighter">value</span> and an address.</>}>
        Five variables, laid out exactly as a computer stores them. Read each one three ways: its name, the value it holds, and the address where it lives.
      </PageHeader>

      <div className="mb-10 grid gap-3 md:grid-cols-3">
        {IDEAS.map((i) => (
          <div key={i.title} className="rounded-2xl border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <i.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">{i.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.text}</p>
          </div>
        ))}
      </div>

      <MemoryLayout />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-display text-xl font-semibold">Why are there unused gaps?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            CPUs read memory fastest when a value starts at an address that is a multiple of its size. After the 1-byte char, the compiler skips ahead so the 8-byte double lands on a multiple of 8. Those skipped bytes are called padding.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-display text-xl font-semibold">Why does 19 look like 13 00 00 00?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            19 is 0x13 in hex. Most computers are little-endian, meaning they store the least significant byte at the lowest address, so the byte 13 comes first and the rest of the int is zeros.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed p-6">
        <p className="font-bold">Ready to see this change as code runs?</p>
        <Link href="/visualizer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" data-testid="link-layout-visualizer">
          Open the visualizer <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/lessons/memory-layout" className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold" data-testid="link-layout-lesson">
          Read the memory lesson <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
