import { c, cellsOf, f, h, v } from "./mem";
import type { MemDiagram } from "./types";

/* ------------------------------------------------------------------ */
/* Visualizer presets                                                  */
/* ------------------------------------------------------------------ */

export const swapDiagram: MemDiagram = {
  id: "swap",
  title: "Swap via pointers",
  blurb: "Two addresses go in, two values come out swapped. Watch the arrows reach back into main.",
  code: `#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3;
    int y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\\n", x, y);
    return 0;
}`,
  steps: [
    { line: 10, note: "main's frame holds x and y. x is initialised to 3; y has not been assigned yet, so it holds whatever garbage was in that memory.", stack: [f("main", [v("x", "int", "3", "0x7ffc1a2c", { changed: true }), v("y", "int", "???", "0x7ffc1a28", { garbage: true })])] },
    { line: 11, note: "y gets the value 7. Both variables live in main's stack frame at fixed addresses.", stack: [f("main", [v("x", "int", "3", "0x7ffc1a2c"), v("y", "int", "7", "0x7ffc1a28", { changed: true })])] },
    { line: 3, note: "Calling swap pushes a new frame. The parameters a and b receive copies of the addresses &x and &y, so they point back into main's frame.", stack: [f("main", [v("x", "int", "3", "0x7ffc1a2c"), v("y", "int", "7", "0x7ffc1a28")]), f("swap", [v("a", "int *", "0x7ffc1a2c", "0x7ffc1a08", { id: "swap.a", ptr: "x", changed: true }), v("b", "int *", "0x7ffc1a28", "0x7ffc1a00", { id: "swap.b", ptr: "y", changed: true }), v("tmp", "int", "???", "0x7ffc19fc", { garbage: true })])] },
    { line: 4, note: "*a follows the arrow to x and reads 3. That value is copied into tmp.", stack: [f("main", [v("x", "int", "3", "0x7ffc1a2c"), v("y", "int", "7", "0x7ffc1a28")]), f("swap", [v("a", "int *", "0x7ffc1a2c", "0x7ffc1a08", { id: "swap.a", ptr: "x" }), v("b", "int *", "0x7ffc1a28", "0x7ffc1a00", { id: "swap.b", ptr: "y" }), v("tmp", "int", "3", "0x7ffc19fc", { changed: true })])] },
    { line: 5, note: "*a = *b reads through b (7) and writes through a. The write lands in main's x, not in swap's frame.", stack: [f("main", [v("x", "int", "7", "0x7ffc1a2c", { changed: true }), v("y", "int", "7", "0x7ffc1a28")]), f("swap", [v("a", "int *", "0x7ffc1a2c", "0x7ffc1a08", { id: "swap.a", ptr: "x" }), v("b", "int *", "0x7ffc1a28", "0x7ffc1a00", { id: "swap.b", ptr: "y" }), v("tmp", "int", "3", "0x7ffc19fc")])] },
    { line: 6, note: "*b = tmp writes the saved 3 into main's y. The swap is complete inside main's memory.", stack: [f("main", [v("x", "int", "7", "0x7ffc1a2c"), v("y", "int", "3", "0x7ffc1a28", { changed: true })]), f("swap", [v("a", "int *", "0x7ffc1a2c", "0x7ffc1a08", { id: "swap.a", ptr: "x" }), v("b", "int *", "0x7ffc1a28", "0x7ffc1a00", { id: "swap.b", ptr: "y" }), v("tmp", "int", "3", "0x7ffc19fc")])] },
    { line: 7, note: "swap returns and its frame is popped. a, b and tmp are gone, but the changes they made to x and y remain.", stack: [f("main", [v("x", "int", "7", "0x7ffc1a2c"), v("y", "int", "3", "0x7ffc1a28")])] },
    { line: 13, note: "printf reads the swapped values.", stack: [f("main", [v("x", "int", "7", "0x7ffc1a2c"), v("y", "int", "3", "0x7ffc1a28")])], output: "x=7 y=3" },
  ],
};

const arrMain = (vals: number[], p: { at: number | null; value: string }, sum: string, changed: { p?: boolean; sum?: boolean } = {}) =>
  f("main", [
    v("arr", "int[4]", "", "0x7ffd3e10", { cells: cellsOf("arr", vals) }),
    p.at === null
      ? v("p", "int *", p.value, "0x7ffd3e08", { changed: changed.p, note: "one past the end: legal to hold, never dereference" })
      : v("p", "int *", p.value, "0x7ffd3e08", { ptr: `arr[${p.at}]`, changed: changed.p }),
    v("sum", "int", sum, "0x7ffd3e04", { changed: changed.sum, garbage: sum === "???" }),
  ]);
const A = [10, 20, 30, 40];

export const arrayTraversalDiagram: MemDiagram = {
  id: "array-traversal",
  title: "Array traversal with pointer arithmetic",
  blurb: "p++ moves 4 bytes, not 1. Watch p walk across the array one int at a time.",
  code: `#include <stdio.h>

int main(void) {
    int arr[4] = {10, 20, 30, 40};
    int *p = arr;
    int sum = 0;
    while (p < arr + 4) {
        sum += *p;
        p++;
    }
    printf("sum = %d\\n", sum);
    return 0;
}`,
  steps: [
    { line: 4, note: "arr is 4 ints laid out back to back: 16 contiguous bytes starting at 0x7ffd3e10.", stack: [f("main", [v("arr", "int[4]", "", "0x7ffd3e10", { cells: cellsOf("arr", A, { changed: [0, 1, 2, 3] }) }), v("p", "int *", "???", "0x7ffd3e08", { garbage: true }), v("sum", "int", "???", "0x7ffd3e04", { garbage: true })])] },
    { line: 5, note: "In this expression the array decays to a pointer to its first element, so p = &arr[0].", stack: [arrMain(A, { at: 0, value: "0x7ffd3e10" }, "???", { p: true })] },
    { line: 6, note: "sum starts at 0.", stack: [arrMain(A, { at: 0, value: "0x7ffd3e10" }, "0", { sum: true })] },
    { line: 8, note: "*p reads arr[0] = 10. sum becomes 10.", stack: [arrMain(A, { at: 0, value: "0x7ffd3e10" }, "10", { sum: true })] },
    { line: 9, note: "p++ adds sizeof(int) = 4 bytes. p now holds 0x7ffd3e14, the address of arr[1].", stack: [arrMain(A, { at: 1, value: "0x7ffd3e14" }, "10", { p: true })] },
    { line: 8, note: "*p reads 20. sum becomes 30.", stack: [arrMain(A, { at: 1, value: "0x7ffd3e14" }, "30", { sum: true })] },
    { line: 9, note: "p advances to 0x7ffd3e18, the address of arr[2].", stack: [arrMain(A, { at: 2, value: "0x7ffd3e18" }, "30", { p: true })] },
    { line: 8, note: "*p reads 30. sum becomes 60.", stack: [arrMain(A, { at: 2, value: "0x7ffd3e18" }, "60", { sum: true })] },
    { line: 9, note: "p advances to arr[3] at 0x7ffd3e1c.", stack: [arrMain(A, { at: 3, value: "0x7ffd3e1c" }, "60", { p: true })] },
    { line: 8, note: "*p reads 40. sum becomes 100.", stack: [arrMain(A, { at: 3, value: "0x7ffd3e1c" }, "100", { sum: true })] },
    { line: 9, note: "p now equals arr + 4, one past the last element. Comparing it is fine; dereferencing it would be undefined behaviour.", stack: [arrMain(A, { at: null, value: "0x7ffd3e20" }, "100", { p: true })] },
    { line: 11, note: "The loop condition p < arr + 4 is false, so the loop ends and we print the total.", stack: [arrMain(A, { at: null, value: "0x7ffd3e20" }, "100")], output: "sum = 100" },
  ],
};

export const mallocFreeDiagram: MemDiagram = {
  id: "malloc-free",
  title: "malloc then free lifecycle",
  blurb: "Ask the heap for memory, check it, use it, give it back, and clear the pointer.",
  code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *nums = malloc(3 * sizeof(int));
    if (nums == NULL) {
        return 1;
    }
    nums[0] = 5;
    nums[1] = 10;
    nums[2] = 15;
    printf("%d\\n", nums[1]);
    free(nums);
    nums = NULL;
    return 0;
}`,
  steps: [
    { line: 5, note: "malloc reserves 12 bytes on the heap and returns their address. The contents are uninitialised garbage.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk", changed: true })])], heap: [h("blk", "0x5591a2b0", "12 B", cellsOf("blk", ["???", "???", "???"], { garbageFrom: 0 }), { label: "malloc(12)", changed: true })] },
    { line: 6, note: "Always check: malloc returns NULL if it cannot satisfy the request. Here it succeeded, so we skip the early return.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk" })])], heap: [h("blk", "0x5591a2b0", "12 B", cellsOf("blk", ["???", "???", "???"], { garbageFrom: 0 }), { label: "malloc(12)" })] },
    { line: 9, note: "nums[0] is *(nums + 0). The write goes into the heap block, not the stack.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk" })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]", changed: true }), c("???", { label: "[1]", garbage: true }), c("???", { label: "[2]", garbage: true })], { label: "malloc(12)" })] },
    { line: 10, note: "nums[1] sits 4 bytes later at 0x5591a2b4.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk" })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]" }), c("10", { label: "[1]", changed: true }), c("???", { label: "[2]", garbage: true })], { label: "malloc(12)" })] },
    { line: 11, note: "All three ints are now initialised.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk" })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]" }), c("10", { label: "[1]" }), c("15", { label: "[2]", changed: true })], { label: "malloc(12)" })] },
    { line: 12, note: "Reading through the pointer works exactly like reading an array.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk" })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]" }), c("10", { label: "[1]" }), c("15", { label: "[2]" })], { label: "malloc(12)" })], output: "10" },
    { line: 13, note: "free returns the block to the allocator. nums still holds the old address, but it is now dangling: using it is undefined behaviour.", stack: [f("main", [v("nums", "int *", "0x5591a2b0", "0x7ffe0c18", { ptr: "blk", dangling: true })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]" }), c("10", { label: "[1]" }), c("15", { label: "[2]" })], { label: "freed", freed: true, changed: true })], output: "10" },
    { line: 14, note: "Setting nums to NULL removes the dangling reference. Any accidental use now fails loudly instead of silently corrupting memory.", stack: [f("main", [v("nums", "int *", "NULL", "0x7ffe0c18", { nul: true, changed: true })])], heap: [h("blk", "0x5591a2b0", "12 B", [c("5", { label: "[0]" }), c("10", { label: "[1]" }), c("15", { label: "[2]" })], { label: "freed", freed: true })], output: "10" },
  ],
};

const node = (id: string, addr: string, value: string, next: string | null | "garbage", o: { changedValue?: boolean; changedNext?: boolean; isNew?: boolean } = {}) =>
  h(id, addr, "16 B", [
    c(value, { id: `${id}.value`, label: "value", changed: o.changedValue, garbage: value === "???" }),
    next === "garbage"
      ? c("???", { id: `${id}.next`, label: "next", garbage: true })
      : next === null
        ? c("NULL", { id: `${id}.next`, label: "next", nul: true, changed: o.changedNext })
        : c(next === "n1" ? "0x55e0a010" : next === "n2" ? "0x55e0a030" : "0x55e0a050", { id: `${id}.next`, label: "next", ptr: next, changed: o.changedNext }),
  ], { label: "struct Node", changed: o.isNew });
const N1 = "0x55e0a010", N2 = "0x55e0a030", N3 = "0x55e0a050";
const llMain = (head: string | null, n: string | null, i: string, ch: { head?: boolean; n?: boolean; i?: boolean } = {}) =>
  f("main", [
    head ? v("head", "struct Node *", head === "n1" ? N1 : head === "n2" ? N2 : N3, "0x7ffc5e18", { ptr: head, changed: ch.head }) : v("head", "struct Node *", "NULL", "0x7ffc5e18", { nul: true, changed: ch.head }),
    v("i", "int", i, "0x7ffc5e14", { changed: ch.i }),
    n ? v("n", "struct Node *", n === "n1" ? N1 : n === "n2" ? N2 : N3, "0x7ffc5e08", { ptr: n, changed: ch.n }) : v("n", "struct Node *", "???", "0x7ffc5e08", { garbage: true }),
  ]);

export const linkedListDiagram: MemDiagram = {
  id: "linked-list",
  title: "Building a 3-node linked list",
  blurb: "Each node is its own heap block. Prepending to head links them into a chain.",
  code: `#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

int main(void) {
    struct Node *head = NULL;
    for (int i = 3; i >= 1; i--) {
        struct Node *n = malloc(sizeof *n);
        n->value = i * 10;
        n->next = head;
        head = n;
    }
    return 0;
}`,
  steps: [
    { line: 9, note: "An empty list is just a NULL head pointer. No nodes exist yet.", stack: [f("main", [v("head", "struct Node *", "NULL", "0x7ffc5e18", { nul: true, changed: true })])] },
    { line: 11, note: "i = 3. malloc creates a 16-byte node on the heap (4-byte int, 4 bytes padding, 8-byte pointer). Its fields are garbage.", stack: [llMain(null, "n1", "3", { n: true, i: true })], heap: [node("n1", N1, "???", "garbage", { isNew: true })] },
    { line: 12, note: "n->value is shorthand for (*n).value. The node gets 30.", stack: [llMain(null, "n1", "3")], heap: [node("n1", N1, "30", "garbage", { changedValue: true })] },
    { line: 13, note: "n->next = head copies NULL. This node is currently the end of the list.", stack: [llMain(null, "n1", "3")], heap: [node("n1", N1, "30", null, { changedNext: true })] },
    { line: 14, note: "head now points at the new node. The list is: 30.", stack: [llMain("n1", "n1", "3", { head: true })], heap: [node("n1", N1, "30", null)] },
    { line: 11, note: "i = 2. A second node is allocated somewhere else on the heap. Nodes are not contiguous like an array.", stack: [llMain("n1", "n2", "2", { n: true, i: true })], heap: [node("n1", N1, "30", null), node("n2", N2, "???", "garbage", { isNew: true })] },
    { line: 12, note: "The new node stores 20.", stack: [llMain("n1", "n2", "2")], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "garbage", { changedValue: true })] },
    { line: 13, note: "Its next points at the old head, the 30 node. Order matters: link first, then move head.", stack: [llMain("n1", "n2", "2")], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1", { changedNext: true })] },
    { line: 14, note: "head moves to the new node. The list is: 20 -> 30.", stack: [llMain("n2", "n2", "2", { head: true })], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1")] },
    { line: 11, note: "i = 1. A third node is allocated.", stack: [llMain("n2", "n3", "1", { n: true, i: true })], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1"), node("n3", N3, "???", "garbage", { isNew: true })] },
    { line: 12, note: "It stores 10.", stack: [llMain("n2", "n3", "1")], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1"), node("n3", N3, "10", "garbage", { changedValue: true })] },
    { line: 13, note: "Its next points at the 20 node.", stack: [llMain("n2", "n3", "1")], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1"), node("n3", N3, "10", "n2", { changedNext: true })] },
    { line: 14, note: "head points at 10. Following next pointers from head gives 10 -> 20 -> 30 -> NULL.", stack: [llMain("n3", "n3", "1", { head: true })], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1"), node("n3", N3, "10", "n2")] },
    { line: 16, note: "The loop ends; n and i go out of scope but the nodes live on in the heap. A real program must walk the list and free every node before losing head.", stack: [f("main", [v("head", "struct Node *", N3, "0x7ffc5e18", { ptr: "n3" })])], heap: [node("n1", N1, "30", null), node("n2", N2, "20", "n1"), node("n3", N3, "10", "n2")] },
  ],
};

export const danglingDiagram: MemDiagram = {
  id: "dangling",
  title: "Dangling pointer after free",
  blurb: "Two pointers, one block. Freeing through one leaves the other pointing at nothing.",
  code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int));
    *p = 42;
    int *q = p;
    free(p);
    p = NULL;
    printf("%d\\n", *q);   /* BUG */
    return 0;
}`,
  steps: [
    { line: 5, note: "p points at a fresh 4-byte heap block.", stack: [f("main", [v("p", "int *", "0x5602e2a0", "0x7ffd8810", { ptr: "blk", changed: true }), v("q", "int *", "???", "0x7ffd8808", { garbage: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("???", { garbage: true })], { label: "malloc(4)", changed: true })] },
    { line: 6, note: "Writing through p stores 42 in the block.", stack: [f("main", [v("p", "int *", "0x5602e2a0", "0x7ffd8810", { ptr: "blk" }), v("q", "int *", "???", "0x7ffd8808", { garbage: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("42", { changed: true })], { label: "malloc(4)" })] },
    { line: 7, note: "q = p copies the address. Now two pointers alias the same block. Copying a pointer never copies the data.", stack: [f("main", [v("p", "int *", "0x5602e2a0", "0x7ffd8810", { ptr: "blk" }), v("q", "int *", "0x5602e2a0", "0x7ffd8808", { ptr: "blk", changed: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("42")], { label: "malloc(4)" })] },
    { line: 8, note: "free(p) releases the block. Both p and q still hold 0x5602e2a0, and both are now dangling.", stack: [f("main", [v("p", "int *", "0x5602e2a0", "0x7ffd8810", { ptr: "blk", dangling: true }), v("q", "int *", "0x5602e2a0", "0x7ffd8808", { ptr: "blk", dangling: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("42")], { label: "freed", freed: true, changed: true })] },
    { line: 9, note: "p = NULL protects p, but q was never told. Clearing one alias does not clear the others.", stack: [f("main", [v("p", "int *", "NULL", "0x7ffd8810", { nul: true, changed: true }), v("q", "int *", "0x5602e2a0", "0x7ffd8808", { ptr: "blk", dangling: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("42")], { label: "freed", freed: true })] },
    { line: 10, note: "Reading *q is a use-after-free: undefined behaviour. It might print 42, print garbage, or crash. AddressSanitizer reports heap-use-after-free right here.", stack: [f("main", [v("p", "int *", "NULL", "0x7ffd8810", { nul: true }), v("q", "int *", "0x5602e2a0", "0x7ffd8808", { ptr: "blk", dangling: true, changed: true })])], heap: [h("blk", "0x5602e2a0", "4 B", [c("42")], { label: "freed", freed: true })], output: "??? (undefined behaviour)" },
  ],
};

export const ptrToPtrDiagram: MemDiagram = {
  id: "pointer-to-pointer",
  title: "Pointer-to-pointer modifying a caller's pointer",
  blurb: "To change main's pointer from inside a function, hand the function the pointer's address.",
  code: `#include <stdlib.h>

void make_buffer(int **out, int n) {
    *out = malloc(n * sizeof(int));
    if (*out != NULL) {
        (*out)[0] = 99;
    }
}

int main(void) {
    int *buf = NULL;
    make_buffer(&buf, 4);
    free(buf);
    return 0;
}`,
  steps: [
    { line: 11, note: "buf starts as NULL in main's frame.", stack: [f("main", [v("buf", "int *", "NULL", "0x7ffe2210", { nul: true, changed: true })])] },
    { line: 3, note: "make_buffer receives &buf. out is an int ** whose arrow points at main's buf variable itself, not at any int.", stack: [f("main", [v("buf", "int *", "NULL", "0x7ffe2210", { nul: true })]), f("make_buffer", [v("out", "int **", "0x7ffe2210", "0x7ffe21e8", { ptr: "buf", changed: true }), v("n", "int", "4", "0x7ffe21e4", { changed: true })])] },
    { line: 4, note: "*out = malloc(...) writes the new heap address into whatever out points at: main's buf. buf now points at the heap.", stack: [f("main", [v("buf", "int *", "0x55c1f2a0", "0x7ffe2210", { ptr: "blk", changed: true })]), f("make_buffer", [v("out", "int **", "0x7ffe2210", "0x7ffe21e8", { ptr: "buf" }), v("n", "int", "4", "0x7ffe21e4")])], heap: [h("blk", "0x55c1f2a0", "16 B", cellsOf("blk", ["???", "???", "???", "???"], { garbageFrom: 0 }), { label: "malloc(16)", changed: true })] },
    { line: 6, note: "(*out)[0] follows two arrows: out to buf, then buf to the block. The parentheses matter because [] binds tighter than *.", stack: [f("main", [v("buf", "int *", "0x55c1f2a0", "0x7ffe2210", { ptr: "blk" })]), f("make_buffer", [v("out", "int **", "0x7ffe2210", "0x7ffe21e8", { ptr: "buf" }), v("n", "int", "4", "0x7ffe21e4")])], heap: [h("blk", "0x55c1f2a0", "16 B", [c("99", { label: "[0]", changed: true }), c("???", { label: "[1]", garbage: true }), c("???", { label: "[2]", garbage: true }), c("???", { label: "[3]", garbage: true })], { label: "malloc(16)" })] },
    { line: 8, note: "make_buffer returns. Its frame disappears, but the change to buf survives because it was written into main's memory.", stack: [f("main", [v("buf", "int *", "0x55c1f2a0", "0x7ffe2210", { ptr: "blk" })])], heap: [h("blk", "0x55c1f2a0", "16 B", [c("99", { label: "[0]" }), c("???", { label: "[1]", garbage: true }), c("???", { label: "[2]", garbage: true }), c("???", { label: "[3]", garbage: true })], { label: "malloc(16)" })] },
    { line: 13, note: "main owns the buffer now and frees it. buf is left dangling, but main is about to return so it is never used again.", stack: [f("main", [v("buf", "int *", "0x55c1f2a0", "0x7ffe2210", { ptr: "blk", dangling: true })])], heap: [h("blk", "0x55c1f2a0", "16 B", [c("99", { label: "[0]" }), c("???", { label: "[1]", garbage: true }), c("???", { label: "[2]", garbage: true }), c("???", { label: "[3]", garbage: true })], { label: "freed", freed: true, changed: true })] },
  ],
};

export const visualizerPresets: MemDiagram[] = [swapDiagram, arrayTraversalDiagram, mallocFreeDiagram, linkedListDiagram, danglingDiagram, ptrToPtrDiagram];

/* ------------------------------------------------------------------ */
/* Lesson-specific diagrams                                            */
/* ------------------------------------------------------------------ */

export const typesDiagram: MemDiagram = {
  id: "types-sizes",
  title: "Three variables, three sizes",
  code: `#include <stdio.h>

int main(void) {
    char grade = 'A';
    int count = 42;
    double ratio = 0.75;
    printf("%zu %zu %zu\\n", sizeof grade, sizeof count, sizeof ratio);
    return 0;
}`,
  steps: [
    { line: 4, note: "A char takes exactly 1 byte. 'A' is stored as the number 65.", stack: [f("main", [v("grade", "char", "'A' (65)", "0x7ffd001f", { changed: true })])] },
    { line: 5, note: "An int is usually 4 bytes. The compiler aligns it on a 4-byte boundary, which is why its address ends in 8.", stack: [f("main", [v("grade", "char", "'A' (65)", "0x7ffd001f"), v("count", "int", "42", "0x7ffd0018", { changed: true })])] },
    { line: 6, note: "A double takes 8 bytes and stores the value in IEEE 754 binary floating-point format.", stack: [f("main", [v("grade", "char", "'A' (65)", "0x7ffd001f"), v("count", "int", "42", "0x7ffd0018"), v("ratio", "double", "0.75", "0x7ffd0010", { changed: true })])] },
    { line: 7, note: "sizeof reports sizes in bytes. %zu is the correct format for a size_t.", stack: [f("main", [v("grade", "char", "'A' (65)", "0x7ffd001f"), v("count", "int", "42", "0x7ffd0018"), v("ratio", "double", "0.75", "0x7ffd0010")])], output: "1 4 8" },
  ],
};

export const passByValueDiagram: MemDiagram = {
  id: "pass-by-value",
  title: "Why the change does not escape",
  code: `#include <stdio.h>

void add_one(int n) {
    n = n + 1;
}

int main(void) {
    int score = 9;
    add_one(score);
    printf("%d\\n", score);
    return 0;
}`,
  steps: [
    { line: 8, note: "score lives in main's frame with the value 9.", stack: [f("main", [v("score", "int", "9", "0x7ffc8a1c", { changed: true })])] },
    { line: 3, note: "Calling add_one copies the value 9 into a brand new variable n in a brand new frame. n and score are different boxes.", stack: [f("main", [v("score", "int", "9", "0x7ffc8a1c")]), f("add_one", [v("n", "int", "9", "0x7ffc89fc", { changed: true })])] },
    { line: 4, note: "n becomes 10. Only add_one's box changed; score is untouched.", stack: [f("main", [v("score", "int", "9", "0x7ffc8a1c")]), f("add_one", [v("n", "int", "10", "0x7ffc89fc", { changed: true })])] },
    { line: 5, note: "add_one returns and its frame, including n, is discarded.", stack: [f("main", [v("score", "int", "9", "0x7ffc8a1c")])] },
    { line: 10, note: "score is still 9. To change it, add_one would need score's address, which is lesson 8.", stack: [f("main", [v("score", "int", "9", "0x7ffc8a1c")])], output: "9" },
  ],
};

const nameCells = (first: string, ch = false) => [
  c(first, { label: "[0]", changed: ch }), c("'d'", { label: "[1]" }), c("'a'", { label: "[2]" }), c("'\\0'", { label: "[3]" }), c("'\\0'", { label: "[4]" }), c("'\\0'", { label: "[5]" }),
];
export const arraysStringsDiagram: MemDiagram = {
  id: "arrays-strings",
  title: "Arrays are contiguous boxes",
  code: `#include <stdio.h>

int main(void) {
    char name[6] = "Ada";
    name[0] = 'E';
    int marks[3] = {71, 88, 64};
    marks[1] = marks[1] + 5;
    printf("%s %d\\n", name, marks[1]);
    return 0;
}`,
  steps: [
    { line: 4, note: "name gets 6 bytes. \"Ada\" fills 3, the terminator '\\0' fills the 4th, and the remaining bytes are zero-filled.", stack: [f("main", [v("name", "char[6]", "", "0x7ffe4a10", { cells: nameCells("'A'"), changed: true })])] },
    { line: 5, note: "Arrays of char are writable. name[0] is the byte at the very start of the array.", stack: [f("main", [v("name", "char[6]", "", "0x7ffe4a10", { cells: nameCells("'E'", true) })])] },
    { line: 6, note: "marks is 3 ints = 12 contiguous bytes. marks[i] lives at the start address + i * 4.", stack: [f("main", [v("name", "char[6]", "", "0x7ffe4a10", { cells: nameCells("'E'") }), v("marks", "int[3]", "", "0x7ffe4a00", { cells: cellsOf("marks", [71, 88, 64], { changed: [0, 1, 2] }) })])] },
    { line: 7, note: "marks[1] is read (88), 5 is added, and the result is written back to the same box.", stack: [f("main", [v("name", "char[6]", "", "0x7ffe4a10", { cells: nameCells("'E'") }), v("marks", "int[3]", "", "0x7ffe4a00", { cells: cellsOf("marks", [71, 93, 64], { changed: [1] }) })])] },
    { line: 8, note: "%s prints characters until it reaches '\\0'. Without the terminator it would keep reading past the array.", stack: [f("main", [v("name", "char[6]", "", "0x7ffe4a10", { cells: nameCells("'E'") }), v("marks", "int[3]", "", "0x7ffe4a00", { cells: cellsOf("marks", [71, 93, 64]) })])], output: "Eda 93" },
  ],
};

const statics5 = (counter: string, ch = false) => [
  v("counter", "int", counter, "0x601040", { changed: ch }),
  v("greeting", "const char *", "0x402004", "0x601048", { ptr: "lit5" }),
  v("\"hi\"", "char[3] (read-only)", "", "0x402004", { id: "lit5", cells: [c("'h'"), c("'i'"), c("'\\0'")] }),
];
export const layoutDiagram: MemDiagram = {
  id: "memory-layout",
  title: "One program, four regions",
  code: `#include <stdio.h>
#include <stdlib.h>

int counter = 0;
const char *greeting = "hi";

int main(void) {
    int local = 5;
    int *heap_val = malloc(sizeof(int));
    *heap_val = local * 2;
    counter++;
    free(heap_val);
    return 0;
}`,
  steps: [
    { line: 8, note: "Globals exist before main runs, in the static data region. The string literal \"hi\" lives in read-only data. local is pushed onto main's stack frame.", statics: statics5("0"), stack: [f("main", [v("local", "int", "5", "0x7ffcb21c", { changed: true }), v("heap_val", "int *", "???", "0x7ffcb210", { garbage: true })])] },
    { line: 9, note: "malloc carves 4 bytes out of the heap. Notice the heap address is far from both the stack and the static region.", statics: statics5("0"), stack: [f("main", [v("local", "int", "5", "0x7ffcb21c"), v("heap_val", "int *", "0x55a4c2a0", "0x7ffcb210", { ptr: "blk5", changed: true })])], heap: [h("blk5", "0x55a4c2a0", "4 B", [c("???", { garbage: true })], { label: "malloc(4)", changed: true })] },
    { line: 10, note: "The computed value 10 is written into the heap block through the pointer.", statics: statics5("0"), stack: [f("main", [v("local", "int", "5", "0x7ffcb21c"), v("heap_val", "int *", "0x55a4c2a0", "0x7ffcb210", { ptr: "blk5" })])], heap: [h("blk5", "0x55a4c2a0", "4 B", [c("10", { changed: true })], { label: "malloc(4)" })] },
    { line: 11, note: "counter is a global, so it is modified in the static region. It would keep its value across function calls.", statics: statics5("1", true), stack: [f("main", [v("local", "int", "5", "0x7ffcb21c"), v("heap_val", "int *", "0x55a4c2a0", "0x7ffcb210", { ptr: "blk5" })])], heap: [h("blk5", "0x55a4c2a0", "4 B", [c("10")], { label: "malloc(4)" })] },
    { line: 12, note: "The heap block is released. The stack frame vanishes when main returns; the static region lasts until the program exits.", statics: statics5("1"), stack: [f("main", [v("local", "int", "5", "0x7ffcb21c"), v("heap_val", "int *", "0x55a4c2a0", "0x7ffcb210", { ptr: "blk5", dangling: true })])], heap: [h("blk5", "0x55a4c2a0", "4 B", [c("10")], { label: "freed", freed: true, changed: true })] },
  ],
};

export const stackFramesDiagram: MemDiagram = {
  id: "stack-frames",
  title: "Frames pushed and popped",
  code: `#include <stdio.h>

int square(int v) {
    int result = v * v;
    return result;
}

int sum_squares(int a, int b) {
    int total = square(a) + square(b);
    return total;
}

int main(void) {
    int answer = sum_squares(2, 3);
    printf("%d\\n", answer);
    return 0;
}`,
  steps: [
    { line: 14, note: "main starts. answer has a slot in main's frame but no value yet.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })])] },
    { line: 8, note: "sum_squares is called with copies of 2 and 3. A new frame is pushed on top of main's.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })]), f("sum_squares", [v("a", "int", "2", "0x7ffd69fc", { changed: true }), v("b", "int", "3", "0x7ffd69f8", { changed: true }), v("total", "int", "???", "0x7ffd69f4", { garbage: true })])] },
    { line: 4, note: "square(a) pushes a third frame. Three functions are active; only the top one is running.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })]), f("sum_squares", [v("a", "int", "2", "0x7ffd69fc"), v("b", "int", "3", "0x7ffd69f8"), v("total", "int", "???", "0x7ffd69f4", { garbage: true })]), f("square", [v("v", "int", "2", "0x7ffd69dc", { id: "v1", changed: true }), v("result", "int", "4", "0x7ffd69d8", { id: "r1", changed: true })])] },
    { line: 5, note: "square returns 4 and its frame is popped. result no longer exists; only its value was handed back.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })]), f("sum_squares", [v("a", "int", "2", "0x7ffd69fc"), v("b", "int", "3", "0x7ffd69f8"), v("total", "int", "???", "0x7ffd69f4", { garbage: true })])] },
    { line: 4, note: "square(b) pushes a fresh frame, reusing the same addresses the previous square frame had.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })]), f("sum_squares", [v("a", "int", "2", "0x7ffd69fc"), v("b", "int", "3", "0x7ffd69f8"), v("total", "int", "???", "0x7ffd69f4", { garbage: true })]), f("square", [v("v", "int", "3", "0x7ffd69dc", { id: "v2", changed: true }), v("result", "int", "9", "0x7ffd69d8", { id: "r2", changed: true })])] },
    { line: 9, note: "Both calls returned. total = 4 + 9 = 13.", stack: [f("main", [v("answer", "int", "???", "0x7ffd6a1c", { garbage: true })]), f("sum_squares", [v("a", "int", "2", "0x7ffd69fc"), v("b", "int", "3", "0x7ffd69f8"), v("total", "int", "13", "0x7ffd69f4", { changed: true })])] },
    { line: 14, note: "sum_squares returns 13; its frame is popped and the value is stored in answer.", stack: [f("main", [v("answer", "int", "13", "0x7ffd6a1c", { changed: true })])] },
    { line: 15, note: "Only main's frame remains.", stack: [f("main", [v("answer", "int", "13", "0x7ffd6a1c")])], output: "13" },
  ],
};

export const firstPointerDiagram: MemDiagram = {
  id: "first-pointer",
  title: "Your first pointer",
  code: `#include <stdio.h>

int main(void) {
    int age = 19;
    int *p = &age;
    printf("%d\\n", *p);
    *p = 20;
    int *nothing = NULL;
    printf("%d\\n", age);
    return 0;
}`,
  steps: [
    { line: 4, note: "age is an ordinary int box at address 0x7ffe9b2c holding 19.", stack: [f("main", [v("age", "int", "19", "0x7ffe9b2c", { changed: true })])] },
    { line: 5, note: "&age produces the address 0x7ffe9b2c. p is a box whose value is that address, drawn as an arrow to age.", stack: [f("main", [v("age", "int", "19", "0x7ffe9b2c"), v("p", "int *", "0x7ffe9b2c", "0x7ffe9b20", { ptr: "age", changed: true })])] },
    { line: 6, note: "*p means: follow the arrow and read what is there. It reads 19.", stack: [f("main", [v("age", "int", "19", "0x7ffe9b2c"), v("p", "int *", "0x7ffe9b2c", "0x7ffe9b20", { ptr: "age" })])], output: "19" },
    { line: 7, note: "*p = 20 follows the arrow and writes. age changes even though the name age never appears on this line.", stack: [f("main", [v("age", "int", "20", "0x7ffe9b2c", { changed: true }), v("p", "int *", "0x7ffe9b2c", "0x7ffe9b20", { ptr: "age" })])], output: "19" },
    { line: 8, note: "NULL is a pointer that deliberately points nowhere. Dereferencing it crashes (usually a segfault), so check before you follow.", stack: [f("main", [v("age", "int", "20", "0x7ffe9b2c"), v("p", "int *", "0x7ffe9b2c", "0x7ffe9b20", { ptr: "age" }), v("nothing", "int *", "NULL", "0x7ffe9b18", { nul: true, changed: true })])], output: "19" },
    { line: 9, note: "age reads 20, confirming the write through p.", stack: [f("main", [v("age", "int", "20", "0x7ffe9b2c"), v("p", "int *", "0x7ffe9b2c", "0x7ffe9b20", { ptr: "age" }), v("nothing", "int *", "NULL", "0x7ffe9b18", { nul: true })])], output: "19\n20" },
  ],
};

const lit10 = [v("\"cat\"", "char[4] (read-only)", "", "0x402010", { id: "lit10", cells: [c("'c'"), c("'a'"), c("'t'"), c("'\\0'")] })];
const buf10 = () => v("buf", "char[4]", "", "0x7ffc3a14", { cells: [c("'d'", { id: "buf[0]", label: "[0]" }), c("'o'", { id: "buf[1]", label: "[1]" }), c("'g'", { id: "buf[2]", label: "[2]" }), c("'\\0'", { id: "buf[3]", label: "[3]" })] });
const s10 = (i: number | null, ch = true) => [f("main", [
  v("lit", "const char *", "0x402010", "0x7ffc3a18", { ptr: "lit10" }),
  buf10(),
  i === null ? v("p", "char *", "???", "0x7ffc3a08", { garbage: true }) : v("p", "char *", `0x7ffc3a1${4 + i}`.replace("0x7ffc3a18", "0x7ffc3a18").replace("0x7ffc3a110", "0x7ffc3a1a"), "0x7ffc3a08", { ptr: `buf[${i}]`, changed: ch }),
])];
export const stringsDiagram: MemDiagram = {
  id: "pointer-strings",
  title: "Walking a string",
  code: `#include <stdio.h>

int main(void) {
    const char *lit = "cat";
    char buf[4] = "dog";
    char *p = buf;
    while (*p != '\\0') {
        p++;
    }
    printf("%ld\\n", (long)(p - buf));
    return 0;
}`,
  steps: [
    { line: 4, note: "\"cat\" is a string literal stored in read-only memory. lit just points at its first character.", statics: lit10, stack: [f("main", [v("lit", "const char *", "0x402010", "0x7ffc3a18", { ptr: "lit10", changed: true })])] },
    { line: 5, note: "buf is a real array on the stack. \"dog\" is copied into it, terminator included, so buf is writable.", statics: lit10, stack: [f("main", [v("lit", "const char *", "0x402010", "0x7ffc3a18", { ptr: "lit10" }), buf10(), v("p", "char *", "???", "0x7ffc3a08", { garbage: true })])] },
    { line: 6, note: "p starts at buf[0]. A char is 1 byte, so p++ will move exactly one byte.", statics: lit10, stack: s10(0) },
    { line: 8, note: "*p is 'd', not '\\0', so p advances to buf[1].", statics: lit10, stack: s10(1) },
    { line: 8, note: "*p is 'o'; advance to buf[2].", statics: lit10, stack: s10(2) },
    { line: 8, note: "*p is 'g'; advance to buf[3].", statics: lit10, stack: s10(3) },
    { line: 7, note: "*p is '\\0', so the loop stops. p sits on the terminator.", statics: lit10, stack: s10(3, false) },
    { line: 10, note: "Subtracting two pointers into the same array gives the number of elements between them: the string's length.", statics: lit10, stack: s10(3, false), output: "3" },
  ],
};

const code14 = [
  v("twice", "int (int)", "machine code", "0x401136", { id: "fn.twice" }),
  v("negate", "int (int)", "machine code", "0x401150", { id: "fn.negate" }),
];
export const fnPtrDiagram: MemDiagram = {
  id: "function-pointers",
  title: "A pointer to code",
  code: `#include <stdio.h>

int twice(int x) { return 2 * x; }
int negate(int x) { return -x; }

int main(void) {
    int (*op)(int) = twice;
    int a = op(5);
    op = negate;
    int b = op(5);
    printf("%d %d\\n", a, b);
    return 0;
}`,
  steps: [
    { line: 7, note: "Functions live in the code (text) region. op stores the address of twice, so its arrow points into code, not data.", statics: code14, stack: [f("main", [v("op", "int (*)(int)", "0x401136", "0x7ffe7c18", { ptr: "fn.twice", changed: true })])] },
    { line: 8, note: "op(5) jumps to whatever function op points at. twice returns 10.", statics: code14, stack: [f("main", [v("op", "int (*)(int)", "0x401136", "0x7ffe7c18", { ptr: "fn.twice" }), v("a", "int", "10", "0x7ffe7c14", { changed: true })])] },
    { line: 9, note: "Reassigning op changes which code will run. The call site stays the same.", statics: code14, stack: [f("main", [v("op", "int (*)(int)", "0x401150", "0x7ffe7c18", { ptr: "fn.negate", changed: true }), v("a", "int", "10", "0x7ffe7c14")])] },
    { line: 10, note: "The identical expression op(5) now calls negate and returns -5.", statics: code14, stack: [f("main", [v("op", "int (*)(int)", "0x401150", "0x7ffe7c18", { ptr: "fn.negate" }), v("a", "int", "10", "0x7ffe7c14"), v("b", "int", "-5", "0x7ffe7c10", { changed: true })])] },
    { line: 11, note: "Same variable, two behaviours. That is the core idea behind callbacks.", statics: code14, stack: [f("main", [v("op", "int (*)(int)", "0x401150", "0x7ffe7c18", { ptr: "fn.negate" }), v("a", "int", "10", "0x7ffe7c14"), v("b", "int", "-5", "0x7ffe7c10")])], output: "10 -5" },
  ],
};
