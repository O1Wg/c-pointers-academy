import { danglingDiagram, linkedListDiagram, passByValueDiagram, ptrToPtrDiagram, swapDiagram } from "./diagrams";
import { c, f, v } from "./mem";
import type { MemDiagram, WorkedExample } from "./types";

const revCells = (chars: string[], changed: number[] = []) =>
  chars.map((ch, i) => c(`'${ch}'`, { id: `w[${i}]`, label: `[${i}]`, changed: changed.includes(i) })).concat([c("'\\0'", { id: "w[4]", label: "[4]" })]);
const revFrame = (chars: string[], l: number, r: number, changed: number[] = [], ch: { l?: boolean; r?: boolean } = {}) =>
  f("main", [
    v("word", "char[5]", "", "0x7ffe1200", { cells: revCells(chars, changed) }),
    v("left", "char *", `0x7ffe120${l}`, "0x7ffe11f8", { ptr: `w[${l}]`, changed: ch.l }),
    v("right", "char *", `0x7ffe120${r}`, "0x7ffe11f0", { ptr: `w[${r}]`, changed: ch.r }),
  ]);

const reverseDiagram: MemDiagram = {
  id: "reverse-string",
  title: "Two pointers meet in the middle",
  code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "stop";
    char *left = word;
    char *right = word + strlen(word) - 1;
    while (left < right) {
        char tmp = *left;
        *left++ = *right;
        *right-- = tmp;
    }
    printf("%s\\n", word);
    return 0;
}`,
  steps: [
    { line: 7, note: "left starts at the first character, right at the last real character (not the terminator).", stack: [revFrame(["s", "t", "o", "p"], 0, 3, [], { l: true, r: true })] },
    { line: 10, note: "tmp saved 's'. *left++ = *right copies 'p' into word[0], then left moves one byte right.", stack: [revFrame(["p", "t", "o", "p"], 1, 3, [0], { l: true })] },
    { line: 11, note: "*right-- = tmp writes the saved 's' into word[3], then right moves one byte left. The outer pair is swapped.", stack: [revFrame(["p", "t", "o", "s"], 1, 2, [3], { r: true })] },
    { line: 10, note: "Second pass: tmp saved 't'. word[1] receives 'o' and left advances to word[2].", stack: [revFrame(["p", "o", "o", "s"], 2, 2, [1], { l: true })] },
    { line: 11, note: "word[2] receives the saved 't' and right retreats to word[1]. Now left > right, so the loop ends. The terminator was never touched.", stack: [f("main", [v("word", "char[5]", "", "0x7ffe1200", { cells: revCells(["p", "o", "t", "s"], [2]) }), v("left", "char *", "0x7ffe1202", "0x7ffe11f8", { ptr: "w[2]" }), v("right", "char *", "0x7ffe1201", "0x7ffe11f0", { ptr: "w[1]", changed: true })])] },
    { line: 13, note: "The array was reversed in place, no second buffer required.", stack: [f("main", [v("word", "char[5]", "", "0x7ffe1200", { cells: revCells(["p", "o", "t", "s"]) })])], output: "pots" },
  ],
};

export const workedExamples: WorkedExample[] = [
  {
    slug: "swap-two-integers",
    title: "Swap two integers with pointers",
    summary: "The canonical first pointer program: a function that really swaps its caller's variables.",
    topics: ["pointers", "functions"],
    difficulty: "beginner",
    problem: "Write a function swap so that after swap(&x, &y) the values of x and y in main are exchanged.",
    steps: [
      { title: "Decide what the function must touch", text: "The values to change live in main's stack frame. A function only gets copies of its arguments, so it needs the addresses of x and y. The parameters must be int *." },
      { title: "Save one value", text: "Writing *a = *b first would destroy the original *a. Store it in a temporary int.", code: "int tmp = *a;" },
      { title: "Write through both pointers", text: "Copy *b into *a, then the saved value into *b. Each write follows an arrow into main's frame.", code: "*a = *b;\n*b = tmp;" },
      { title: "Call with addresses", text: "The caller passes &x and &y. Step through the diagram to see the writes land in main." },
    ],
    diagram: swapDiagram,
    solution: swapDiagram.code,
    output: "x=7 y=3",
    mistakes: [
      { title: "Taking int instead of int *", text: "void swap(int a, int b) compiles and runs but swaps copies. The caller sees no change." },
      { title: "Swapping the pointers", text: "int *t = a; a = b; b = t; swaps the function's local pointer copies, not the integers. Dereference to reach the ints." },
      { title: "Forgetting & at the call site", text: "swap(x, y) passes ints where pointers are expected. Turn on -Wall: the compiler will warn about converting int to pointer." },
    ],
    related: ["pointers-and-functions", "what-is-a-pointer", "control-flow-functions"],
  },
  {
    slug: "reverse-string-in-place",
    title: "Reverse a string in place",
    summary: "Two pointers walk toward each other, swapping characters until they meet.",
    topics: ["strings", "pointers"],
    difficulty: "beginner",
    problem: "Reverse the characters of a writable C string without allocating a second buffer.",
    steps: [
      { title: "Find both ends", text: "left points at the first character. right points at the last character, which is at word + strlen(word) - 1. Do not include the '\\0'." },
      { title: "Swap and move inward", text: "While left < right, swap *left and *right, then move left forward and right backward.", code: "char tmp = *left;\n*left++ = *right;\n*right-- = tmp;" },
      { title: "Stop in the middle", text: "When the pointers meet or cross, every character has been swapped exactly once. Odd-length strings leave the middle character alone." },
    ],
    diagram: reverseDiagram,
    solution: `#include <stdio.h>
#include <string.h>

void reverse(char *s) {
    size_t len = strlen(s);
    if (len < 2) return;
    char *left = s;
    char *right = s + len - 1;
    while (left < right) {
        char tmp = *left;
        *left++ = *right;
        *right-- = tmp;
    }
}

int main(void) {
    char word[] = "stressed";
    reverse(word);
    printf("%s\\n", word);
    return 0;
}`,
    output: "desserts",
    mistakes: [
      { title: "Reversing a string literal", text: "char *w = \"stop\"; reverse(w); writes into read-only memory. Use char w[] = \"stop\";." },
      { title: "Including the terminator", text: "Starting right at s + len moves '\\0' to the front, producing an empty string." },
      { title: "Empty strings", text: "With len == 0, s + len - 1 points before the array. Guard short strings first." },
    ],
    related: ["pointers-and-strings", "arrays-and-strings", "pointer-arithmetic-and-arrays"],
  },
  {
    slug: "max-of-array",
    title: "Find the max of an array by pointer traversal",
    summary: "Walk an array with a pointer instead of an index, and return a pointer to the largest element.",
    topics: ["arrays", "pointers"],
    difficulty: "beginner",
    problem: "Given an int array and its length, return a pointer to the largest element (or NULL for an empty array) using pointer traversal.",
    steps: [
      { title: "Handle the empty case", text: "There is no maximum of zero elements. Returning NULL is the honest answer, and the caller must check it." },
      { title: "Set up the range", text: "best starts at the first element. end is a + n, one past the last element: allowed to hold and compare, never dereferenced.", code: "const int *best = a;\nconst int *end = a + n;" },
      { title: "Walk and compare", text: "Start p at a + 1. Each p++ advances by sizeof(int). When *p beats *best, move best.", code: "for (const int *p = a + 1; p < end; p++)\n    if (*p > *best) best = p;" },
      { title: "Why return a pointer", text: "A pointer tells the caller both the value (*best) and the position (best - a) in one result." },
    ],
    solution: `#include <stdio.h>

const int *max_element(const int *a, size_t n) {
    if (n == 0) return NULL;
    const int *best = a;
    const int *end = a + n;
    for (const int *p = a + 1; p < end; p++) {
        if (*p > *best) best = p;
    }
    return best;
}

int main(void) {
    int temps[] = {14, 22, 19, 27, 21};
    const int *m = max_element(temps, 5);
    if (m != NULL) {
        printf("max %d at index %td\\n", *m, m - temps);
    }
    return 0;
}`,
    output: "max 27 at index 3",
    mistakes: [
      { title: "Starting best at 0", text: "Initialising a max to 0 fails for all-negative arrays. Start from the first real element." },
      { title: "Using <= end", text: "p <= end dereferences one past the last element." },
      { title: "sizeof inside the function", text: "sizeof a / sizeof a[0] inside max_element gives pointer size divided by int size, not the length. Pass n." },
    ],
    related: ["pointer-arithmetic-and-arrays", "arrays-and-strings"],
  },
  {
    slug: "strlen-and-strcpy",
    title: "Implement strlen and strcpy with pointers",
    summary: "Rebuild two standard library classics to see exactly how C strings are processed.",
    topics: ["strings", "pointers"],
    difficulty: "intermediate",
    problem: "Write my_strlen(const char *s) and my_strcpy(char *dst, const char *src) without using <string.h>.",
    steps: [
      { title: "strlen: walk to the terminator", text: "Move a pointer p forward until *p is '\\0'. The length is p - s, the number of chars between them.", code: "const char *p = s;\nwhile (*p) p++;\nreturn (size_t)(p - s);" },
      { title: "strcpy: copy including the terminator", text: "Copy one char at a time. The loop must copy '\\0' too, or dst will not be a valid string.", code: "while ((*d++ = *src++) != '\\0') ;" },
      { title: "Read the compact loop slowly", text: "*d++ = *src++ copies the char, then advances both pointers. The assignment's value is the copied char, so the loop stops right after copying '\\0'." },
      { title: "Return dst", text: "The real strcpy returns its destination so calls can be chained. Keep the original dst in a separate variable since d moves." },
    ],
    solution: `#include <stdio.h>
#include <stddef.h>

size_t my_strlen(const char *s) {
    const char *p = s;
    while (*p != '\\0') p++;
    return (size_t)(p - s);
}

char *my_strcpy(char *dst, const char *src) {
    char *d = dst;
    while ((*d++ = *src++) != '\\0') {
        /* copy until the terminator has been copied */
    }
    return dst;
}

int main(void) {
    char buf[16];
    my_strcpy(buf, "malloc");
    printf("%s has %zu chars\\n", buf, my_strlen(buf));
    return 0;
}`,
    output: "malloc has 6 chars",
    mistakes: [
      { title: "Stopping before copying '\\0'", text: "while (*src) *d++ = *src++; leaves dst unterminated. Add *d = '\\0'; afterwards or use the combined loop." },
      { title: "Too-small destination", text: "strcpy has no idea how big dst is. Ensure it holds my_strlen(src) + 1 bytes, or use snprintf." },
      { title: "Returning the moved pointer", text: "Returning d instead of dst returns a pointer just past the copied terminator." },
    ],
    related: ["pointers-and-strings", "pointer-arithmetic-and-arrays", "common-pointer-bugs"],
  },
  {
    slug: "growable-dynamic-array",
    title: "A growable dynamic array with realloc",
    summary: "Build a vector that doubles its capacity as you push, the backbone of countless C programs.",
    topics: ["dynamic memory", "pointers"],
    difficulty: "intermediate",
    problem: "Create an IntVec type that supports push(value) with amortised constant time, and frees cleanly.",
    steps: [
      { title: "Track three things", text: "data points at the heap block, len counts used slots, cap counts allocated slots. Start with data = NULL and both counts 0." },
      { title: "Grow by doubling", text: "When len == cap, double cap (or start at 4). Doubling means the total copying cost stays linear across all pushes." },
      { title: "Use realloc safely", text: "Assign to a temporary. If it fails, the old block is still valid and still owned by the vector.", code: "int *tmp = realloc(v->data, new_cap * sizeof *tmp);\nif (!tmp) return 0;\nv->data = tmp;" },
      { title: "Never keep old pointers", text: "realloc may move the block. Any pointer into the old data is dangling after a growth. Use indexes, or re-read v->data." },
      { title: "Free once", text: "One free(v->data) releases everything; reset the struct so it can be reused." },
    ],
    diagram: ptrToPtrDiagram,
    solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} IntVec;

int vec_push(IntVec *v, int value) {
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : 4;
        int *tmp = realloc(v->data, new_cap * sizeof *tmp);
        if (tmp == NULL) return 0;
        v->data = tmp;
        v->cap = new_cap;
    }
    v->data[v->len++] = value;
    return 1;
}

void vec_free(IntVec *v) {
    free(v->data);
    v->data = NULL;
    v->len = v->cap = 0;
}

int main(void) {
    IntVec v = {NULL, 0, 0};
    for (int i = 1; i <= 10; i++) vec_push(&v, i * i);
    printf("len %zu cap %zu last %d\\n", v.len, v.cap, v.data[v.len - 1]);
    vec_free(&v);
    return 0;
}`,
    output: "len 10 cap 16 last 100",
    mistakes: [
      { title: "v->data = realloc(v->data, ...)", text: "On failure this overwrites the only pointer with NULL and leaks the block." },
      { title: "Growing by one", text: "Adding one slot per push copies the whole array every time: quadratic cost." },
      { title: "sizeof the pointer", text: "realloc(v->data, new_cap * sizeof v->data) allocates room for pointers, not ints. Use sizeof *v->data." },
    ],
    related: ["dynamic-memory", "pointers-to-pointers", "structs-and-pointers"],
  },
  {
    slug: "build-linked-list",
    title: "Build and print a singly linked list",
    summary: "Allocate nodes, chain them with next pointers, traverse, and free every node.",
    topics: ["linked lists", "dynamic memory", "pointers"],
    difficulty: "intermediate",
    problem: "Build the list 10 -> 20 -> 30 by pushing to the front, print it, then free all nodes without leaks.",
    steps: [
      { title: "Define the node", text: "Each node holds a value and a pointer to the next node. The last node's next is NULL." },
      { title: "Push to the front", text: "Allocate a node, set its value, point its next at the current head, then make it the new head. Pushing 30, 20, 10 in that order yields 10 -> 20 -> 30." },
      { title: "Traverse", text: "Start cur at head and follow cur->next until it becomes NULL.", code: "for (struct Node *cur = head; cur; cur = cur->next)" },
      { title: "Free safely", text: "Save cur->next before freeing cur, because a freed node may not be read." },
    ],
    diagram: linkedListDiagram,
    solution: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

int push_front(struct Node **head, int value) {
    struct Node *n = malloc(sizeof *n);
    if (n == NULL) return 0;
    n->value = value;
    n->next = *head;
    *head = n;
    return 1;
}

void print_list(const struct Node *head) {
    for (const struct Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->value);
    }
    printf("NULL\\n");
}

void free_list(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int main(void) {
    struct Node *head = NULL;
    push_front(&head, 30);
    push_front(&head, 20);
    push_front(&head, 10);
    print_list(head);
    free_list(head);
    return 0;
}`,
    output: "10 -> 20 -> 30 -> NULL",
    mistakes: [
      { title: "Moving head before linking", text: "Setting head = n before n->next = head makes the node point at itself and loses the rest of the list." },
      { title: "Passing head instead of &head", text: "A push_front(struct Node *head, ...) can only change its copy of head. Take struct Node ** or return the new head." },
      { title: "Freeing then reading next", text: "free(cur); cur = cur->next; is a use-after-free." },
    ],
    related: ["structs-and-pointers", "dynamic-memory", "pointers-to-pointers"],
  },
  {
    slug: "insert-delete-linked-list",
    title: "Insert and delete a node in a linked list",
    summary: "Use a pointer-to-pointer cursor so inserting and deleting at the head needs no special case.",
    topics: ["linked lists", "pointers"],
    difficulty: "advanced",
    problem: "In a sorted list, insert a value in order, and delete the first node with a given value.",
    steps: [
      { title: "The trick: point at the link", text: "Instead of a pointer to the current node, keep struct Node **link, a pointer to the pointer that leads to it. Initially link = &head; later link = &(*link)->next." },
      { title: "Insert in order", text: "Advance link while the node it leads to has a smaller value. Then splice: the new node's next takes *link, and *link becomes the new node.", code: "n->next = *link;\n*link = n;" },
      { title: "Delete a value", text: "Advance until *link leads to the target. Save the node, bypass it with *link = victim->next, then free it.", code: "struct Node *victim = *link;\n*link = victim->next;\nfree(victim);" },
      { title: "Why no head special case", text: "When the target is the first node, link is &head, so *link = ... updates head itself. The same code handles every position." },
    ],
    solution: `#include <stdio.h>
#include <stdlib.h>

struct Node { int value; struct Node *next; };

int insert_sorted(struct Node **head, int value) {
    struct Node **link = head;
    while (*link != NULL && (*link)->value < value) {
        link = &(*link)->next;
    }
    struct Node *n = malloc(sizeof *n);
    if (n == NULL) return 0;
    n->value = value;
    n->next = *link;
    *link = n;
    return 1;
}

int delete_value(struct Node **head, int value) {
    for (struct Node **link = head; *link != NULL; link = &(*link)->next) {
        if ((*link)->value == value) {
            struct Node *victim = *link;
            *link = victim->next;
            free(victim);
            return 1;
        }
    }
    return 0;
}

int main(void) {
    struct Node *head = NULL;
    int vals[] = {40, 10, 30, 20};
    for (int i = 0; i < 4; i++) insert_sorted(&head, vals[i]);
    delete_value(&head, 10);
    delete_value(&head, 30);
    for (struct Node *c = head; c; c = c->next) printf("%d ", c->value);
    printf("\\n");
    while (head) { struct Node *nx = head->next; free(head); head = nx; }
    return 0;
}`,
    output: "20 40",
    mistakes: [
      { title: "Freeing before relinking", text: "free(*link); *link = (*link)->next; reads freed memory. Save the victim first." },
      { title: "Losing the previous node", text: "With a plain struct Node *cur you cannot update the previous node's next. Track prev or use the pointer-to-pointer cursor." },
      { title: "Precedence in &(*link)->next", text: "-> binds tighter than &, so &(*link)->next is the address of the next field. The parentheses around *link are required." },
    ],
    related: ["structs-and-pointers", "pointers-to-pointers", "common-pointer-bugs"],
  },
  {
    slug: "2d-matrix-malloc",
    title: "Allocate and free a 2D matrix with malloc",
    summary: "Two layouts for run-time sized grids: an array of row pointers, and a single flat block.",
    topics: ["dynamic memory", "arrays", "pointers"],
    difficulty: "advanced",
    problem: "Allocate a rows x cols matrix of doubles whose size is read at run time, fill it, print it, and free it with no leaks.",
    steps: [
      { title: "Layout A: row pointers", text: "Allocate rows pointers (double **), then one block per row. Index with m[r][c]. Rows may be scattered in the heap." },
      { title: "Layout B: one flat block", text: "Allocate rows * cols doubles in one call. Index with a[r * cols + c]. One malloc, one free, contiguous memory." },
      { title: "Handle partial failure", text: "If row 3 of 5 fails to allocate, free rows 0 to 2 and the spine before returning NULL." },
      { title: "Free in reverse", text: "For layout A, free every row, then the spine. Freeing the spine first loses the row pointers." },
    ],
    solution: `#include <stdio.h>
#include <stdlib.h>

double **matrix_new(size_t rows, size_t cols) {
    double **m = malloc(rows * sizeof *m);
    if (m == NULL) return NULL;
    for (size_t r = 0; r < rows; r++) {
        m[r] = malloc(cols * sizeof *m[r]);
        if (m[r] == NULL) {
            while (r > 0) free(m[--r]);
            free(m);
            return NULL;
        }
    }
    return m;
}

void matrix_free(double **m, size_t rows) {
    if (m == NULL) return;
    for (size_t r = 0; r < rows; r++) free(m[r]);
    free(m);
}

int main(void) {
    size_t rows = 2, cols = 3;
    double **m = matrix_new(rows, cols);
    if (m == NULL) return 1;
    for (size_t r = 0; r < rows; r++)
        for (size_t c = 0; c < cols; c++)
            m[r][c] = r * 10.0 + c;
    for (size_t r = 0; r < rows; r++) {
        for (size_t c = 0; c < cols; c++) printf("%5.1f", m[r][c]);
        printf("\\n");
    }
    matrix_free(m, rows);
    return 0;
}`,
    output: "  0.0  1.0  2.0\n 10.0 11.0 12.0",
    mistakes: [
      { title: "sizeof(double) for the spine", text: "The spine holds pointers. malloc(rows * sizeof(double)) happens to work on some systems and breaks on others. Write sizeof *m." },
      { title: "Freeing only the spine", text: "free(m) alone leaks every row." },
      { title: "Passing to a function expecting double[][3]", text: "A double ** is not compatible with a true 2D array parameter. The memory layouts differ." },
    ],
    related: ["pointers-to-pointers", "dynamic-memory", "arrays-and-strings"],
  },
  {
    slug: "why-doesnt-my-function-change-my-variable",
    title: "Why doesn't my function change my variable?",
    summary: "The most common beginner bug in C, explained with memory boxes, and fixed two ways.",
    topics: ["functions", "pointers", "debugging"],
    difficulty: "beginner",
    problem: "add_one(score) runs, the function clearly adds one, yet score in main is unchanged. Explain why and fix it.",
    steps: [
      { title: "Draw the boxes", text: "score lives in main's frame. When add_one(score) runs, a new frame appears containing n, a separate box holding a copy of 9." },
      { title: "Watch the change", text: "n = n + 1 changes n to 10. score is in a different box and never receives a write." },
      { title: "Watch the frame vanish", text: "On return the frame and n disappear. The 10 is gone with them." },
      { title: "Fix 1: return the result", text: "If there is one output, return it and let the caller assign: score = add_one(score);" },
      { title: "Fix 2: pass the address", text: "If the function must modify in place, take int *n and write *n = *n + 1; Call with add_one(&score)." },
    ],
    diagram: passByValueDiagram,
    solution: `#include <stdio.h>

int plus_one(int n) {
    return n + 1;
}

void add_one(int *n) {
    *n = *n + 1;
}

int main(void) {
    int score = 9;
    score = plus_one(score);
    add_one(&score);
    printf("%d\\n", score);
    return 0;
}`,
    output: "11",
    mistakes: [
      { title: "Thinking arrays prove otherwise", text: "Arrays seem to be modified by functions because the array decays to a pointer. The pointer is still passed by value." },
      { title: "n++ instead of (*n)++", text: "*n++ increments the pointer, not the int, because ++ binds tighter than *. Write (*n)++ or *n += 1." },
      { title: "Globals as a workaround", text: "Making score global hides the problem but makes code harder to reason about. Prefer explicit pointers or return values." },
    ],
    related: ["control-flow-functions", "pointers-and-functions", "stack-and-function-calls"],
  },
  {
    slug: "qsort-comparator",
    title: "Sort with qsort using a comparison function pointer",
    summary: "Sort an array of structs by different keys by handing qsort different comparators.",
    topics: ["functions", "pointers"],
    difficulty: "intermediate",
    problem: "Sort an array of students by grade (descending), breaking ties by name (ascending), using the standard qsort.",
    steps: [
      { title: "Know qsort's contract", text: "qsort(base, count, size, cmp) calls cmp with two const void * pointing at elements. cmp returns negative if the first sorts earlier, positive if later, zero if equal." },
      { title: "Cast back to the element type", text: "Inside the comparator, convert to const struct Student * before using ->.", code: "const struct Student *a = pa, *b = pb;" },
      { title: "Compare without overflow", text: "Use (x > y) - (x < y) for integers. Subtraction can overflow for large or negative values." },
      { title: "Break ties", text: "If grades are equal, fall back to strcmp on names, which already returns negative/zero/positive." },
    ],
    solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Student {
    char name[16];
    int grade;
};

int by_grade_then_name(const void *pa, const void *pb) {
    const struct Student *a = pa;
    const struct Student *b = pb;
    if (a->grade != b->grade) {
        return (b->grade > a->grade) - (b->grade < a->grade);
    }
    return strcmp(a->name, b->name);
}

int main(void) {
    struct Student s[] = {
        {"Noor", 88}, {"Ivan", 93}, {"Aiko", 88}, {"Tomas", 71},
    };
    size_t n = sizeof s / sizeof s[0];
    qsort(s, n, sizeof s[0], by_grade_then_name);
    for (size_t i = 0; i < n; i++) printf("%s %d\\n", s[i].name, s[i].grade);
    return 0;
}`,
    output: "Ivan 93\nAiko 88\nNoor 88\nTomas 71",
    mistakes: [
      { title: "Wrong element size", text: "Passing sizeof(struct Student *) instead of sizeof s[0] makes qsort shuffle garbage." },
      { title: "Casting to the wrong level", text: "For an array of char * (strings), elements are char *, so the comparator receives char ** disguised as void *. Cast to const char * const *." },
      { title: "Returning a bool", text: "Returning a->grade > b->grade gives only 0 or 1, never negative. qsort needs all three outcomes." },
    ],
    related: ["function-pointers", "structs-and-pointers", "reading-pointer-declarations"],
  },
  {
    slug: "dangling-pointer-after-free",
    title: "Detecting and fixing a dangling pointer after free",
    summary: "Two aliases, one free, one crash. Find it with AddressSanitizer and fix it with clear ownership.",
    topics: ["debugging", "dynamic memory", "pointers"],
    difficulty: "advanced",
    problem: "A program frees a buffer through one pointer and later reads it through another. Find the bug with tooling and fix it.",
    steps: [
      { title: "Reproduce under AddressSanitizer", text: "Compile with gcc -g -fsanitize=address prog.c and run. ASan stops on the bad read with heap-use-after-free, showing the read line, the free line and the malloc line." },
      { title: "Draw the aliases", text: "p and q both hold the same heap address. free(p) invalidates the block for every pointer that holds that address, not only p." },
      { title: "Decide who owns the block", text: "Exactly one pointer should own it. Others may borrow it only while the owner keeps it alive." },
      { title: "Fix the order", text: "Finish using q before freeing, then NULL every alias that outlives the free." },
      { title: "Confirm with valgrind", text: "valgrind ./prog should report 0 errors and \"All heap blocks were freed\"." },
    ],
    diagram: danglingDiagram,
    solution: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof *p);
    if (p == NULL) return 1;
    *p = 42;

    int *q = p;           /* q borrows; p owns */
    printf("%d\\n", *q);   /* use while the block is alive */

    free(p);              /* owner releases */
    p = NULL;
    q = NULL;             /* every alias cleared */
    return 0;
}`,
    output: "42",
    mistakes: [
      { title: "NULLing only one alias", text: "p = NULL after free does nothing for q. Every alias must be considered." },
      { title: "\"It printed 42, so it works\"", text: "Use-after-free often reads the stale value successfully. Undefined behaviour can look correct until it does not." },
      { title: "Freeing through the borrower", text: "If q also calls free, you get a double free. Only the owner frees." },
    ],
    related: ["common-pointer-bugs", "dynamic-memory", "stack-and-function-calls"],
  },
];

export function getExample(slug: string): WorkedExample | undefined {
  return workedExamples.find((e) => e.slug === slug);
}
