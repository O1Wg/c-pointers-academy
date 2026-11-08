import { danglingDiagram, fnPtrDiagram, linkedListDiagram, ptrToPtrDiagram } from "./diagrams";
import type { Lesson } from "./types";

export const pointerLessonsB: Lesson[] = [
  {
    slug: "pointers-to-pointers",
    module: 3,
    number: 12,
    title: "Pointers to Pointers",
    summary: "int ** is an arrow to an arrow. Use it to let a function change the caller's pointer, and to build dynamic 2D arrays.",
    minutes: 22,
    difficulty: "advanced",
    sections: [
      { heading: "One more level of arrow", body: [
        "A pointer is a box, so it has an address too. A **pointer to a pointer** stores that address. If `int *p = &x;` then `int **pp = &p;`. Now `*pp` is p (the arrow) and `**pp` is x (the box at the end of both arrows).",
        "Every `*` you apply follows one arrow. Count the stars, count the arrows.",
      ] },
      { heading: "Changing a caller's pointer", body: [
        "Lesson 8 showed that to change a caller's int, you pass an `int *`. The same rule one level up: to change a caller's `int *`, you pass an `int **`. A function that allocates memory for the caller typically looks like `int make_buffer(int **out, size_t n)` and is called as `make_buffer(&buf, n)`.",
        "If you pass `buf` instead of `&buf`, the function only gets a copy of the pointer. It can malloc into its copy, but the caller's buf stays NULL and the new block leaks.",
      ] },
      { heading: "Dynamic 2D arrays", body: [
        "A grid of rows by cols ints whose size is only known at run time can be built as an array of row pointers: allocate `rows` pointers (an `int **`), then allocate each row. Index it as `grid[r][c]`. Free each row, then the array of row pointers, in the reverse order of allocation.",
        "An alternative is one block of rows * cols ints indexed as `a[r * cols + c]`: one malloc, one free, better cache behaviour.",
      ] },
    ],
    examples: [
      { title: "Allocating through an out-parameter", code: `#include <stdio.h>
#include <stdlib.h>

int make_range(int **out, int n) {
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {
        return 0;
    }
    for (int i = 0; i < n; i++) {
        a[i] = i + 1;
    }
    *out = a;
    return 1;
}

int main(void) {
    int *nums = NULL;
    if (make_range(&nums, 3)) {
        printf("%d %d %d\\n", nums[0], nums[1], nums[2]);
        free(nums);
    }
    return 0;
}`, annotations: [
        { line: 4, note: "int **out: the address of the caller's int * variable." },
        { line: 12, note: "Write the new address into the caller's pointer." },
        { line: 18, note: "Pass &nums, the address of the pointer, not nums." },
        { line: 20, note: "The caller now owns the block and frees it." },
      ], output: "1 2 3" },
      { title: "A rows x cols matrix", code: `#include <stdlib.h>

int **matrix_new(size_t rows, size_t cols) {
    int **m = malloc(rows * sizeof *m);
    if (m == NULL) return NULL;
    for (size_t r = 0; r < rows; r++) {
        m[r] = calloc(cols, sizeof **m);
        if (m[r] == NULL) {
            while (r > 0) free(m[--r]);
            free(m);
            return NULL;
        }
    }
    return m;
}

void matrix_free(int **m, size_t rows) {
    for (size_t r = 0; r < rows; r++) free(m[r]);
    free(m);
}`, annotations: [
        { line: 4, note: "An array of rows pointers. sizeof *m is sizeof(int *)." },
        { line: 7, note: "Each row is its own zeroed block of ints." },
        { line: 9, note: "On partial failure, free the rows already made so nothing leaks." },
        { line: 18, note: "Free rows first, then the spine. Reverse order of allocation." },
      ] },
    ],
    diagrams: [ptrToPtrDiagram],
    takeaways: [
      "Each * follows one arrow: **pp reaches the final value.",
      "To modify a caller's T, pass a T *. For a caller's int *, pass an int **.",
      "Passing a pointer by value lets you change what it points at, not where it points.",
      "Dynamic 2D arrays: allocate the row pointers, then each row; free in reverse.",
    ],
    quiz: [
      { q: "int x = 1; int *p = &x; int **pp = &p; Which expression yields x's value?", options: ["*pp", "**pp", "&pp", "pp"], answer: 1, explain: "*pp is p; **pp follows p to x." },
      { q: "Why does this leave buf as NULL?", code: `void alloc(int *b) { b = malloc(16); }\n...\nint *buf = NULL;\nalloc(buf);`, options: ["malloc failed", "alloc changed its own copy of the pointer", "16 is too small", "buf must be const"], answer: 1, explain: "b is a copy of buf. Assigning to b does not affect buf, and the 16-byte block leaks." },
      { q: "In what order should a row-pointer matrix be freed?", options: ["The spine first, then rows", "Each row, then the spine", "Only the spine", "Order does not matter"], answer: 1, explain: "Freeing the spine first would lose the row pointers you still need to free." },
    ],
  },
  {
    slug: "structs-and-pointers",
    module: 3,
    number: 13,
    title: "Structs and Pointers",
    summary: "Group fields into a struct, reach them through a pointer with ->, and link structs together into a linked list.",
    minutes: 24,
    difficulty: "intermediate",
    sections: [
      { heading: "Structs group related data", body: [
        "A `struct` bundles named fields into one type: `struct Point { int x; int y; };`. Fields are laid out in order, possibly with padding bytes between them so each field is properly aligned. That is why `sizeof` a struct can exceed the sum of its fields.",
        "Structs are copied by value like everything else. Passing a large struct to a function copies all of it, so we usually pass a pointer instead.",
      ] },
      { heading: "The arrow operator", body: [
        "Given `struct Point *pt`, you reach a field with `(*pt).x`. The parentheses are required because `.` binds tighter than `*`. Since this is so common C offers shorthand: `pt->x`. Read `->` as \"follow the arrow, then take the field\".",
      ] },
      { heading: "Self-referential structs", body: [
        "A struct cannot contain itself (it would be infinitely large), but it can contain a pointer to its own type: `struct Node { int value; struct Node *next; };`. Each node points at the next one, and the last points at NULL. That chain is a **singly linked list**.",
        "Unlike an array, nodes are scattered around the heap. Inserting at the front is instant: make a node, point its next at the old head, move head. The cost is that reaching the k-th element means walking k arrows.",
      ] },
      { heading: "Freeing a list", body: [
        "To free a list, walk it but save `next` before freeing the current node, because after `free(cur)` reading `cur->next` would be a use-after-free.",
      ] },
    ],
    examples: [
      { title: "Updating a struct through a pointer", code: `#include <stdio.h>

struct Player {
    char name[16];
    int hp;
};

void take_damage(struct Player *p, int amount) {
    p->hp -= amount;
    if (p->hp < 0) {
        p->hp = 0;
    }
}

int main(void) {
    struct Player hero = {"Lin", 30};
    take_damage(&hero, 12);
    printf("%s has %d hp\\n", hero.name, hero.hp);
    return 0;
}`, annotations: [
        { line: 8, note: "Pass a pointer: no copy, and changes reach the caller." },
        { line: 9, note: "p->hp is (*p).hp." },
        { line: 18, note: "On a struct value (not a pointer), use the dot." },
      ], output: "Lin has 18 hp" },
      { title: "Build, print and free a list", code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

struct Node *push(struct Node *head, int value) {
    struct Node *n = malloc(sizeof *n);
    if (n == NULL) return head;
    n->value = value;
    n->next = head;
    return n;
}

int main(void) {
    struct Node *head = NULL;
    for (int i = 3; i >= 1; i--) head = push(head, i * 10);
    for (struct Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\\n");
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}`, annotations: [
        { line: 6, note: "A pointer to the same struct type: legal, and the basis of linked structures." },
        { line: 13, note: "Link the new node to the old head before returning it as the new head." },
        { line: 20, note: "The standard traversal loop: follow next until NULL." },
        { line: 25, note: "Save next before freeing the node that holds it." },
      ], output: "10 -> 20 -> 30 -> NULL" },
    ],
    diagrams: [linkedListDiagram],
    takeaways: [
      "Structs group fields; padding can make them bigger than the sum of parts.",
      "p->field is shorthand for (*p).field.",
      "Pass structs by pointer to avoid copies and allow modification.",
      "A node holding a pointer to its own type builds a linked list.",
      "When freeing a list, save next before free(cur).",
    ],
    quiz: [
      { q: "Given struct Point *p, which expressions access x?", options: ["p.x and *p.x", "p->x and (*p).x", "*p->x", "p[x]"], answer: 1, explain: "p->x is shorthand for (*p).x. *p.x parses as *(p.x), which is an error for a pointer." },
      { q: "Why can struct Node contain struct Node *next but not struct Node next?", options: ["Pointers are faster", "A struct containing itself would be infinitely large; a pointer has a fixed size", "It can contain both", "Compiler limitation only"], answer: 1, explain: "A pointer is just an address with a known size, so a struct can hold one to its own type." },
      { q: "What is the bug?", code: `for (cur = head; cur; cur = cur->next)\n    free(cur);`, options: ["None", "cur->next is read after cur is freed", "free cannot take a struct pointer", "head is not freed"], answer: 1, explain: "The update cur = cur->next runs after free(cur), reading freed memory. Save next first." },
    ],
  },
  {
    slug: "function-pointers",
    module: 3,
    number: 14,
    title: "Function Pointers",
    summary: "Functions have addresses too. Store one in a variable and you can pass behaviour around: callbacks, dispatch tables, qsort.",
    minutes: 20,
    difficulty: "advanced",
    sections: [
      { heading: "Code lives at an address", body: [
        "A compiled function is a sequence of machine instructions in the code region, and it starts at some address. A **function pointer** stores that address. Calling through it jumps to whatever function it currently points at.",
      ] },
      { heading: "The syntax", body: [
        "`int (*op)(int);` declares op as a pointer to a function taking an int and returning an int. The parentheses around `*op` are essential: `int *op(int);` would declare a function returning `int *`.",
        "A function name decays to a pointer to that function, so `op = twice;` works without `&`, and `op(5)` works without `*`. A `typedef` makes things readable: `typedef int (*UnaryOp)(int);` then `UnaryOp op = twice;`.",
      ] },
      { heading: "Callbacks", body: [
        "Pass a function pointer as an argument and the callee can call back into code you chose. That lets one general algorithm work with many behaviours: apply this to every element, compare these two items, handle this event.",
      ] },
      { heading: "qsort", body: [
        "The standard `qsort` sorts any array. It needs the array's start, element count, element size, and a comparison function `int cmp(const void *a, const void *b)` that returns negative, zero or positive. Inside, cast the `void *` arguments to the real element type.",
        "Avoid `return x - y;` in comparators: it can overflow for large values. Use `(x > y) - (x < y)` instead.",
      ] },
    ],
    examples: [
      { title: "Applying a callback to an array", code: `#include <stdio.h>

typedef int (*Transform)(int);

int square(int x) { return x * x; }
int halve(int x) { return x / 2; }

void map(int *a, size_t n, Transform fn) {
    for (size_t i = 0; i < n; i++) {
        a[i] = fn(a[i]);
    }
}

int main(void) {
    int v[] = {2, 4, 6};
    map(v, 3, square);
    map(v, 3, halve);
    printf("%d %d %d\\n", v[0], v[1], v[2]);
    return 0;
}`, annotations: [
        { line: 3, note: "Transform names the type \"pointer to function int -> int\"." },
        { line: 8, note: "map does not know or care which function it was given." },
        { line: 16, note: "Pass the function by name; it decays to a pointer." },
      ], output: "2 8 18" },
      { title: "Sorting with qsort", code: `#include <stdio.h>
#include <stdlib.h>

int by_descending(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (y > x) - (y < x);
}

int main(void) {
    int scores[] = {58, 91, 73, 91, 66};
    size_t n = sizeof scores / sizeof scores[0];
    qsort(scores, n, sizeof scores[0], by_descending);
    for (size_t i = 0; i < n; i++) printf("%d ", scores[i]);
    printf("\\n");
    return 0;
}`, annotations: [
        { line: 4, note: "qsort hands us pointers to two elements as const void *." },
        { line: 5, note: "Cast to the real element type, then dereference." },
        { line: 7, note: "Overflow-safe three-way comparison, reversed for descending order." },
        { line: 13, note: "The comparator is passed as a function pointer." },
      ], output: "91 91 73 66 58" },
    ],
    diagrams: [fnPtrDiagram],
    takeaways: [
      "A function pointer holds the address of code.",
      "int (*fp)(int) needs the parentheses around *fp.",
      "typedef function pointer types to keep code readable.",
      "Callbacks let one algorithm be reused with different behaviour.",
      "qsort comparators take const void *, cast, and return negative, zero or positive.",
    ],
    quiz: [
      { q: "What does int *f(int); declare?", options: ["A pointer to a function returning int", "A function returning a pointer to int", "An array of pointers", "A pointer to int"], answer: 1, explain: "Without parentheses, () binds first: f is a function taking int and returning int *." },
      { q: "Which line declares p as a pointer to a function taking two ints and returning double?", options: ["double *p(int, int);", "double (*p)(int, int);", "double p*(int, int);", "(double *)p(int, int);"], answer: 1, explain: "Parentheses group *p first, so p is a pointer, then (int, int) makes it a pointer to a function." },
      { q: "A qsort comparator receives its arguments as:", options: ["The element values", "const void * pointers to the elements", "Array indexes", "int *"], answer: 1, explain: "qsort is generic, so it passes const void * pointers to the two elements being compared." },
    ],
  },
  {
    slug: "common-pointer-bugs",
    module: 4,
    number: 15,
    title: "Common Pointer Bugs",
    summary: "The five bugs behind most crashes, what each looks like in memory, and the tools that catch them for you.",
    minutes: 26,
    difficulty: "advanced",
    sections: [
      { heading: "Uninitialised pointers", body: [
        "`int *p; *p = 5;` writes to whatever random address p happened to contain. It may crash, or worse, silently corrupt another variable. Fix: initialise every pointer, to a real address or to NULL.",
      ] },
      { heading: "Dangling pointers", body: [
        "A dangling pointer refers to memory that is no longer valid: a freed heap block, or a local whose function has returned. Reading through it is a **use-after-free** (or use-after-return). It often appears to work in testing because the old bytes are still there, then fails in production once the memory is reused.",
        "Fix: set pointers to NULL after free, be clear about ownership, and never return addresses of locals.",
      ] },
      { heading: "Double free", body: [
        "Calling `free` twice on the same block corrupts the allocator's bookkeeping. It usually happens when two pointers alias one block and both owners think they are responsible. Fix: one owner per block, and NULL the pointer after freeing (free(NULL) is a no-op).",
      ] },
      { heading: "Buffer overflow", body: [
        "Writing past the end of an array or heap block, often through an off-by-one (`<=` instead of `<`) or a string copy into a too-small buffer. Overflows are the classic security vulnerability. Fix: track lengths, use bounded functions like `snprintf`, and remember the `'\\0'` byte.",
      ] },
      { heading: "Memory leaks", body: [
        "Losing the last pointer to a heap block without freeing it. Leaks do not crash; they make a long-running program grow until it is killed. Fix: pair every malloc with a free on every path, including error paths.",
      ] },
      { heading: "Let the tools find them", body: [
        "**AddressSanitizer**: compile with `gcc -g -fsanitize=address` (and add `-fsanitize=undefined` for more). The program stops at the first invalid access and prints the exact line, plus where the memory was allocated and freed. **Valgrind**: run `valgrind --leak-check=full ./prog` on a normal `-g` build. It reports invalid reads and writes and lists every leaked block with its allocation stack.",
        "Use them constantly while learning. They turn \"it crashes sometimes\" into \"line 23 reads 4 bytes from a block freed on line 19\".",
      ] },
    ],
    examples: [
      { title: "Four bugs in one function", code: `#include <stdlib.h>
#include <string.h>

void buggy(void) {
    int *a;
    *a = 1;                       /* uninitialised pointer */

    char name[4];
    strcpy(name, "Ravi");         /* overflow: needs 5 bytes */

    int *b = malloc(sizeof *b);
    free(b);
    free(b);                      /* double free */

    int *c = malloc(100);
    c = NULL;                     /* leak: block lost */
}`, annotations: [
        { line: 6, note: "a holds garbage; this writes to an unknown address." },
        { line: 9, note: "\"Ravi\" plus '\\0' is 5 bytes; name has 4." },
        { line: 13, note: "The second free corrupts the heap. ASan: attempting double-free." },
        { line: 16, note: "The only pointer to the block is overwritten. Valgrind: definitely lost: 100 bytes." },
      ] },
      { title: "The fixed version", code: `#include <stdio.h>
#include <stdlib.h>

void fixed(void) {
    int value = 0;
    int *a = &value;
    *a = 1;

    char name[8];
    snprintf(name, sizeof name, "%s", "Ravi");

    int *b = malloc(sizeof *b);
    free(b);
    b = NULL;
    free(b);                      /* now a harmless no-op */

    int *c = malloc(100);
    free(c);
    c = NULL;
}`, annotations: [
        { line: 6, note: "a points at real storage before it is used." },
        { line: 10, note: "snprintf never writes more than sizeof name bytes, and always terminates." },
        { line: 14, note: "NULL after free makes an accidental second free harmless." },
        { line: 18, note: "Free before dropping the last reference." },
      ] },
    ],
    diagrams: [danglingDiagram],
    takeaways: [
      "Initialise every pointer; NULL is a valid starting value.",
      "After free, NULL the pointer, and remember aliases still dangle.",
      "One owner per heap block prevents double frees and leaks.",
      "Most overflows are off-by-one or a forgotten '\\0'.",
      "Build with -fsanitize=address and run valgrind while you learn.",
    ],
    quiz: [
      { q: "Which tool is enabled with a compiler flag rather than run as a separate program?", options: ["Valgrind", "AddressSanitizer", "gdb", "cdecl"], answer: 1, explain: "AddressSanitizer is built in with -fsanitize=address. Valgrind runs your unmodified binary." },
      { q: "q = p; free(p); p = NULL; What is the state of q?", options: ["NULL", "Valid", "Dangling", "Leaked"], answer: 2, explain: "Setting p to NULL does not affect q, which still holds the freed address." },
      { q: "for (int i = 0; i <= n; i++) a[i] = 0; on an array of n ints is:", options: ["Correct", "An off-by-one buffer overflow", "A memory leak", "A double free"], answer: 1, explain: "i reaches n, and a[n] is one past the end. Use i < n." },
      { q: "A program never crashes but its memory use grows steadily. The likely bug is:", options: ["Use-after-free", "A memory leak", "NULL dereference", "Integer division"], answer: 1, explain: "Leaks do not crash; they accumulate. valgrind --leak-check=full will list them." },
    ],
  },
  {
    slug: "reading-pointer-declarations",
    module: 4,
    number: 16,
    title: "Reading Pointer Declarations",
    summary: "const placement, the right-left rule, and how to decode int (*fp)(int), int *arr[3] and int (*arr)[3] without panic.",
    minutes: 20,
    difficulty: "advanced",
    sections: [
      { heading: "Declarations mirror use", body: [
        "C's declaration syntax follows a principle: a declaration shows how the name is used. `int *p` says \"*p is an int\". `int a[3]` says \"a[i] is an int\". `int (*fp)(int)` says \"(*fp)(x) is an int\". Once you see that, the syntax stops feeling arbitrary.",
      ] },
      { heading: "The right-left rule", body: [
        "Start at the name. Look right: `[N]` reads \"array of N\", `(...)` reads \"function taking ... returning\". When you hit a closing parenthesis or the end, look left: `*` reads \"pointer to\". Keep alternating, leaving each parenthesised group, until you reach the base type.",
        "`int *arr[3]`: arr, right: array of 3, left: pointers to, int. An array of 3 pointers to int. `int (*arr)[3]`: arr, right: blocked by ), left: pointer to, out of the group, right: array of 3, int. A pointer to an array of 3 ints.",
      ] },
      { heading: "const placement", body: [
        "`const` applies to whatever is immediately to its left, or to the right if nothing is on its left. `const int *p` and `int const *p` mean the same thing: a pointer to a constant int. You cannot write `*p = 5`, but you can move p.",
        "`int *const p` is a constant pointer to a modifiable int: `*p = 5` is fine, `p = &other` is not. `const int *const p` locks both. Read right to left: \"p is a const pointer to an int that is const\".",
      ] },
      { heading: "cdecl", body: [
        "The tool cdecl (and the site cdecl.org) translates declarations to English and back. Type `explain int (*(*f)(int))[5]` and it answers: declare f as pointer to function (int) returning pointer to array 5 of int. Use it to check your reading, then try without it.",
      ] },
    ],
    examples: [
      { title: "const in all its positions", code: `int main(void) {
    int a = 1, b = 2;

    const int *p1 = &a;     /* pointer to const int */
    p1 = &b;                /* ok: the pointer can move */
    /* *p1 = 5; */          /* error: target is read-only */

    int *const p2 = &a;     /* const pointer to int */
    *p2 = 5;                /* ok: the target is writable */
    /* p2 = &b; */          /* error: pointer is fixed */

    const int *const p3 = &a;
    /* neither *p3 = 5 nor p3 = &b compiles */
    (void)p3;
    return 0;
}`, annotations: [
        { line: 4, note: "const left of * protects the pointee." },
        { line: 8, note: "const right of * protects the pointer itself." },
        { line: 12, note: "Both locked. Read right to left: const pointer to const int." },
      ] },
      { title: "Three look-alikes", code: `#include <stdio.h>

int inc(int x) { return x + 1; }

int main(void) {
    int x = 1, y = 2, z = 3;
    int row[3] = {7, 8, 9};

    int *arr[3] = {&x, &y, &z};   /* array of 3 pointers to int */
    int (*rowp)[3] = &row;        /* pointer to array of 3 ints */
    int (*fp)(int) = inc;         /* pointer to function int -> int */

    printf("%d %d %d\\n", *arr[1], (*rowp)[2], fp(41));
    printf("%zu %zu\\n", sizeof arr, sizeof rowp);
    return 0;
}`, annotations: [
        { line: 9, note: "[] binds tighter than *, so arr is an array first." },
        { line: 10, note: "Parentheses make rowp a pointer first. rowp + 1 would skip 12 bytes." },
        { line: 13, note: "*arr[1] is *(arr[1]); (*rowp)[2] dereferences then indexes." },
        { line: 14, note: "Three 8-byte pointers (24) versus a single pointer (8) on 64-bit." },
      ], output: "2 9 42\n24 8" },
    ],
    diagrams: [],
    takeaways: [
      "A declaration shows how the name is used in an expression.",
      "Right-left rule: start at the name, go right, then left, leaving parentheses.",
      "const int *p: pointee is read-only. int *const p: pointer is fixed.",
      "int *a[3] is an array of pointers; int (*a)[3] is a pointer to an array.",
      "cdecl.org checks your reading.",
    ],
    quiz: [
      { q: "What is int *arr[3]?", options: ["Pointer to an array of 3 ints", "Array of 3 pointers to int", "Function returning int *", "Pointer to pointer to int"], answer: 1, explain: "Right first: arr is an array of 3; then left: pointers to int." },
      { q: "Given int *const p = &a; which line compiles?", options: ["p = &b;", "*p = 10;", "Both", "Neither"], answer: 1, explain: "p itself is constant, but the int it points to is not." },
      { q: "Which declares fp as a pointer to a function taking int and returning int?", options: ["int *fp(int);", "int (*fp)(int);", "int fp*(int);", "int (fp*)(int);"], answer: 1, explain: "The parentheses group *fp so fp is a pointer first, then (int) makes it a pointer to a function." },
      { q: "const int *p and int const *p are:", options: ["Different: one makes the pointer const", "Identical: pointer to const int", "Both const pointers", "Invalid syntax"], answer: 1, explain: "const applies to int in both, since it is on the same side of the *." },
    ],
  },
];
