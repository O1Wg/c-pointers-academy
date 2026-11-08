import { arrayTraversalDiagram, firstPointerDiagram, mallocFreeDiagram, stringsDiagram, swapDiagram } from "./diagrams";
import type { Lesson } from "./types";

export const pointerLessonsA: Lesson[] = [
  {
    slug: "what-is-a-pointer",
    module: 3,
    number: 7,
    title: "What Is a Pointer",
    summary: "A pointer is a variable whose value is an address. & gets an address; * follows one.",
    minutes: 20,
    difficulty: "beginner",
    sections: [
      { heading: "Just another box", body: [
        "You already know a variable is a box with an address. A **pointer** is a box too. The only thing special about it is what it holds: not a number you count with, but the address of another box.",
        "We draw that as an arrow. Whenever you are confused, draw the boxes and the arrows. That habit alone is most of mastering pointers.",
      ] },
      { heading: "Declaring a pointer", body: [
        "`int *p;` declares p as \"a pointer to int\". The `*` in a declaration is part of the type, not an operation. Read it as \"p is a pointer; when you follow it you find an int\".",
        "Watch out: `int *a, b;` makes a a pointer but b a plain int. The star binds to the name, so declare one pointer per line while learning.",
      ] },
      { heading: "& and *", body: [
        "`&x` (address-of) gives you the address of x. `*p` (dereference) means \"go to the address stored in p\". Used on the right of `=`, `*p` reads what is there; on the left, `*p = 20` writes there.",
        "They are opposites: `*&x` is just x. If you remember only one sentence, make it this: **p is the arrow, *p is the box at the end of the arrow.**",
      ] },
      { heading: "NULL", body: [
        "`NULL` is a special pointer value that means \"points to nothing\". It is the honest way to say a pointer is not ready yet. Dereferencing NULL is undefined behaviour that in practice crashes immediately with a segmentation fault, which is far better than silently reading garbage.",
        "Initialise every pointer: either to a real address or to NULL. And check `if (p != NULL)` before following one that might be empty.",
      ] },
    ],
    examples: [
      { title: "Reading and writing through a pointer", code: `#include <stdio.h>

int main(void) {
    int balance = 100;
    int *acct = &balance;
    printf("balance at %p\\n", (void *)acct);
    printf("value %d\\n", *acct);
    *acct -= 30;
    printf("balance now %d\\n", balance);
    return 0;
}`, annotations: [
        { line: 5, note: "acct holds balance's address." },
        { line: 6, note: "Printing the pointer itself shows an address." },
        { line: 7, note: "Dereferencing reads the int at that address: 100." },
        { line: 8, note: "Writes through the pointer. balance becomes 70." },
      ], output: "balance at 0x7ffd5e2c\nvalue 100\nbalance now 70" },
      { title: "Guarding against NULL", code: `#include <stdio.h>

void print_value(const int *p) {
    if (p == NULL) {
        printf("(nothing)\\n");
        return;
    }
    printf("%d\\n", *p);
}

int main(void) {
    int n = 7;
    print_value(&n);
    print_value(NULL);
    return 0;
}`, annotations: [
        { line: 3, note: "const int * promises the function will only read through p." },
        { line: 4, note: "Check before you dereference. NULL compares equal to 0." },
        { line: 14, note: "Passing NULL is safe because the function checks for it." },
      ], output: "7\n(nothing)" },
    ],
    diagrams: [firstPointerDiagram],
    takeaways: [
      "A pointer is a variable holding an address. Draw it as an arrow.",
      "&x gives x's address; *p follows the arrow in p.",
      "In a declaration, * is part of the type: int *p.",
      "p is the arrow; *p is the box at the end of it.",
      "Initialise pointers, use NULL for \"nothing\", and check before dereferencing.",
    ],
    quiz: [
      { q: "After these lines, what is x?", code: `int x = 5;\nint *p = &x;\n*p = *p + 1;`, options: ["5", "6", "The address of x", "Undefined"], answer: 1, explain: "*p reads x (5), adds 1, and writes 6 back through the pointer into x." },
      { q: "In int *a, b; what type is b?", options: ["int *", "int", "int **", "It is a syntax error"], answer: 1, explain: "The * binds to a only. b is a plain int." },
      { q: "What does *&x evaluate to?", options: ["The address of x", "x itself", "A pointer to a pointer", "NULL"], answer: 1, explain: "& takes x's address and * immediately follows it back to x." },
      { q: "What usually happens if you dereference NULL?", options: ["You read 0", "The program crashes with a segfault", "The compiler refuses to compile", "Nothing"], answer: 1, explain: "It is undefined behaviour, but on mainstream systems address 0 is unmapped, so you get an immediate segmentation fault." },
    ],
  },
  {
    slug: "pointers-and-functions",
    module: 3,
    number: 8,
    title: "Pointers and Functions",
    summary: "Pass an address, and the function can reach back into the caller's memory. This is how C emulates pass-by-reference.",
    minutes: 18,
    difficulty: "intermediate",
    sections: [
      { heading: "The copy rule still applies", body: [
        "C always passes arguments by value. When you call `swap(&x, &y)`, the values being copied are the addresses of x and y. The function's parameters a and b are new pointer variables holding those copies.",
        "A copy of an address still leads to the same house. So `*a = ...` inside swap writes into main's x. That is the entire trick behind \"pass-by-reference\" in C.",
      ] },
      { heading: "The classic swap", body: [
        "To swap two ints, the function needs access to both original boxes, so it takes two `int *`. It saves `*a` in a temporary, copies `*b` into `*a`, then writes the temporary into `*b`. Step through the diagram below and watch where each write lands.",
      ] },
      { heading: "Output parameters", body: [
        "A C function can return only one value. When you need several results, pass pointers to where the caller wants them stored. The standard library does this everywhere: `scanf(\"%d\", &n)` writes the parsed number into n.",
        "A common pattern returns a status code (success or failure) and delivers the actual results through output parameters.",
      ] },
      { heading: "const for read-only access", body: [
        "Passing a pointer to a large struct avoids copying it, even if the function only reads it. Mark such parameters `const`, as in `double average(const int *values, size_t n)`, so the compiler stops you from writing through them by accident.",
      ] },
    ],
    examples: [
      { title: "Swap that works", code: `#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3, y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\\n", x, y);
    return 0;
}`, annotations: [
        { line: 3, note: "Parameters are addresses, so the function can reach the caller's ints." },
        { line: 4, note: "Save the original *a before overwriting it." },
        { line: 11, note: "Pass the addresses, not the values." },
      ], output: "x=7 y=3" },
      { title: "Two results through output parameters", code: `#include <stdio.h>

int divide(int a, int b, int *quot, int *rem) {
    if (b == 0) {
        return 0;
    }
    *quot = a / b;
    *rem = a % b;
    return 1;
}

int main(void) {
    int q, r;
    if (divide(17, 5, &q, &r)) {
        printf("17 = 5 * %d + %d\\n", q, r);
    }
    return 0;
}`, annotations: [
        { line: 3, note: "The return value reports success; results travel through pointers." },
        { line: 5, note: "Bail out before writing anything if the input is invalid." },
        { line: 7, note: "Writes into main's q." },
        { line: 14, note: "Only use q and r if divide reported success." },
      ], output: "17 = 5 * 3 + 2" },
    ],
    diagrams: [swapDiagram],
    takeaways: [
      "C only passes by value; passing an address lets the callee reach the original.",
      "Inside the function, write through the pointer: *a = ..., not a = ....",
      "Output parameters let a function deliver several results.",
      "Use const T * for parameters the function only reads.",
    ],
    quiz: [
      { q: "Why does this function fail to swap?", code: `void swap(int a, int b) {\n    int t = a; a = b; b = t;\n}`, options: ["Missing return", "It swaps copies; the caller's variables are untouched", "int cannot be swapped", "t is uninitialised"], answer: 1, explain: "a and b are copies of the caller's values. Swapping copies changes nothing outside." },
      { q: "Inside void set(int *p), which line changes the caller's int to 0?", options: ["p = 0;", "*p = 0;", "&p = 0;", "p* = 0;"], answer: 1, explain: "*p = 0 writes through the pointer. p = 0 would only make the local copy of the pointer NULL." },
      { q: "Why pass &n to scanf rather than n?", options: ["scanf needs to know n's type", "scanf must write into n, so it needs n's address", "It is faster", "To avoid a compiler warning only"], answer: 1, explain: "scanf stores the parsed value through the pointer you give it. Passing n would hand it a meaningless copy of n's value." },
    ],
  },
  {
    slug: "pointer-arithmetic-and-arrays",
    module: 3,
    number: 9,
    title: "Pointer Arithmetic and Arrays",
    summary: "p + 1 moves by one element, not one byte. Arrays decay into pointers, but they are not the same thing.",
    minutes: 22,
    difficulty: "intermediate",
    sections: [
      { heading: "Adding to a pointer scales by type", body: [
        "If p is an `int *` holding 0x1000, then `p + 1` is 0x1004, because the next int starts 4 bytes later. For a `double *` it would be 0x1008, for a `char *` 0x1001. The compiler multiplies by `sizeof(*p)` for you.",
        "Subtracting two pointers into the same array gives the number of elements between them, not bytes. Comparing them with `<` tells you which comes first.",
      ] },
      { heading: "a[i] is *(a + i)", body: [
        "Indexing is defined in terms of pointer arithmetic: `a[i]` means exactly `*(a + i)`. That is why indexing starts at 0: the first element is zero steps from the start.",
      ] },
      { heading: "Array decay", body: [
        "In almost every expression an array's name converts (\"decays\") to a pointer to its first element. `int *p = arr;` is the same as `int *p = &arr[0];`. When you pass an array to a function, the function receives only that pointer.",
        "The exceptions are `sizeof arr` (the whole array's size), `&arr` (a pointer to the whole array) and string initialisers.",
      ] },
      { heading: "Arrays are not pointers", body: [
        "An array is a block of elements; a pointer is a single variable holding an address. You cannot assign to an array name (`arr = other;` does not compile), and `sizeof` gives very different answers. Inside a function, a parameter declared `int a[]` is really `int *a`, so `sizeof a` is just the pointer's size. Always pass the length separately.",
      ] },
      { heading: "Stay inside the array", body: [
        "You may form a pointer to any element or to one past the last element, and compare with it. Dereferencing one-past-the-end, or computing addresses further out, is undefined behaviour.",
      ] },
    ],
    examples: [
      { title: "Iterating with a pointer", code: `#include <stdio.h>

double average(const int *start, const int *end) {
    long total = 0;
    for (const int *p = start; p < end; p++) {
        total += *p;
    }
    return (double)total / (end - start);
}

int main(void) {
    int scores[] = {72, 85, 91, 64};
    size_t n = sizeof scores / sizeof scores[0];
    printf("%.2f\\n", average(scores, scores + n));
    return 0;
}`, annotations: [
        { line: 3, note: "A half-open range: start is included, end is one past the last element." },
        { line: 5, note: "p++ moves to the next int, 4 bytes later." },
        { line: 8, note: "end - start is the element count (4), not a byte count." },
        { line: 14, note: "scores decays to &scores[0]; scores + n is one past the end." },
      ], output: "78.00" },
      { title: "sizeof tells arrays and pointers apart", code: `#include <stdio.h>

void show(int a[]) {
    printf("in function: %zu\\n", sizeof a);
}

int main(void) {
    int data[8] = {0};
    int *p = data;
    printf("array: %zu, pointer: %zu\\n", sizeof data, sizeof p);
    printf("%d %d\\n", data[2] == *(data + 2), 2[data] == data[2]);
    show(data);
    return 0;
}`, annotations: [
        { line: 3, note: "int a[] as a parameter is really int *a." },
        { line: 4, note: "So this prints the size of a pointer (8 on 64-bit), not 32. gcc warns about it." },
        { line: 10, note: "32 bytes for the array, 8 for the pointer." },
        { line: 11, note: "a[i] is *(a + i), and addition commutes, so even 2[data] works. Never write that in real code." },
      ], output: "array: 32, pointer: 8\n1 1\nin function: 8" },
    ],
    diagrams: [arrayTraversalDiagram],
    takeaways: [
      "p + n moves n elements, i.e. n * sizeof(*p) bytes.",
      "a[i] is defined as *(a + i).",
      "Array names decay to a pointer to the first element in most expressions.",
      "Functions receive arrays as pointers, so pass the length too.",
      "One-past-the-end may be held and compared, never dereferenced.",
    ],
    quiz: [
      { q: "double *d holds 0x2000. What is d + 3?", options: ["0x2003", "0x2018", "0x200C", "0x2030"], answer: 1, explain: "A double is 8 bytes, so 3 elements is 24 bytes = 0x18. 0x2000 + 0x18 = 0x2018." },
      { q: "Which expression is identical to arr[4]?", options: ["*arr + 4", "*(arr + 4)", "&arr + 4", "arr * 4"], answer: 1, explain: "Subscripting is defined as *(arr + 4). *arr + 4 would add 4 to the first element's value." },
      { q: "Inside void f(int a[]), sizeof a on a 64-bit system is typically:", options: ["The array's total size", "8, the size of a pointer", "4", "0"], answer: 1, explain: "The parameter is really an int *, so sizeof gives the pointer's size." },
      { q: "int a[5]; int *p = a + 5; Which is allowed?", options: ["*p", "p < a + 5", "p[0] = 1", "*(p + 1)"], answer: 1, explain: "A one-past-the-end pointer may be compared but not dereferenced." },
    ],
  },
  {
    slug: "pointers-and-strings",
    module: 3,
    number: 10,
    title: "Pointers and Strings",
    summary: "char * walks strings one byte at a time. Know the difference between a literal you may not modify and an array you own.",
    minutes: 18,
    difficulty: "intermediate",
    sections: [
      { heading: "A string is reached through a char *", body: [
        "Every string function in C takes a `char *` (or `const char *`) pointing at the first character, then walks forward until it finds `'\\0'`. There is no length stored anywhere; the terminator is the only marker.",
      ] },
      { heading: "Literals versus arrays", body: [
        "`char *a = \"cat\";` makes a point at a string literal stored in read-only memory. Writing `a[0] = 'b';` is undefined behaviour and usually crashes. Write `const char *a = \"cat\";` so the compiler catches the mistake.",
        "`char b[] = \"dog\";` is different: it creates a 4-byte array on the stack and copies the characters in. You own that array and can modify it freely.",
      ] },
      { heading: "Walking with a pointer", body: [
        "The idiom `while (*p != '\\0') p++;` (often shortened to `while (*p) p++;`) moves p to the terminator. Since a char is one byte, each step moves one address. Subtract the start pointer and you have the length.",
      ] },
      { heading: "Copying strings needs space", body: [
        "`=` copies a pointer, never the characters. To copy text you need a destination array big enough for every character plus the terminator, and a function like `strcpy` or, safer, `snprintf`. Copying into a too-small buffer is a buffer overflow.",
      ] },
    ],
    examples: [
      { title: "Counting vowels with a pointer", code: `#include <stdio.h>

int count_vowels(const char *s) {
    int count = 0;
    for (; *s != '\\0'; s++) {
        char ch = *s | 0x20;
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            count++;
        }
    }
    return count;
}

int main(void) {
    printf("%d\\n", count_vowels("Segmentation Fault"));
    return 0;
}`, annotations: [
        { line: 3, note: "const char *: we only read. s is our own copy of the pointer, so moving it is fine." },
        { line: 5, note: "Stop at the terminator; advance one byte each time." },
        { line: 6, note: "Setting bit 0x20 lowercases ASCII letters. A shortcut; tolower() is clearer." },
      ], output: "7" },
      { title: "Literal versus array", code: `#include <stdio.h>
#include <string.h>

int main(void) {
    const char *motto = "keep going";
    char copy[32];
    strcpy(copy, motto);
    copy[0] = 'K';
    printf("%s / %s\\n", motto, copy);
    printf("%zu %zu\\n", sizeof motto, sizeof copy);
    return 0;
}`, annotations: [
        { line: 5, note: "motto points into read-only memory; const stops us from writing through it." },
        { line: 6, note: "copy is a writable 32-byte array on the stack." },
        { line: 7, note: "strcpy copies characters up to and including '\\0'. copy is big enough." },
        { line: 10, note: "sizeof a pointer (8) versus sizeof the array (32)." },
      ], output: "keep going / Keep going\n8 32" },
    ],
    diagrams: [stringsDiagram],
    takeaways: [
      "Strings are reached through a pointer to their first char and end at '\\0'.",
      "String literals are read-only: point at them with const char *.",
      "char buf[] = \"...\" makes a modifiable copy you own.",
      "Assigning a char * copies the address, not the text.",
      "The destination of a string copy needs strlen + 1 bytes.",
    ],
    quiz: [
      { q: "What is wrong here?", code: `char *s = "hello";\ns[0] = 'H';`, options: ["Nothing", "Modifying a string literal is undefined behaviour", "s needs to be an int *", "Missing semicolon"], answer: 1, explain: "s points at a read-only literal. Use char s[] = \"hello\"; to get a writable copy." },
      { q: "After const char *a = \"hi\"; const char *b = a; what was copied?", options: ["The characters h, i and '\\0'", "Only the address", "Nothing; it is an error", "The length"], answer: 1, explain: "Assigning pointers copies the address. Both a and b now point at the same characters." },
      { q: "How many bytes must a buffer have to hold a copy of \"pointer\"?", options: ["7", "8", "6", "16"], answer: 1, explain: "Seven characters plus the '\\0' terminator." },
    ],
  },
  {
    slug: "dynamic-memory",
    module: 3,
    number: 11,
    title: "Dynamic Memory",
    summary: "malloc, calloc, realloc and free: memory whose lifetime you control, and the responsibilities that come with it.",
    minutes: 24,
    difficulty: "intermediate",
    sections: [
      { heading: "Why the heap exists", body: [
        "Stack memory is fast and automatic, but it disappears when the function returns and its size must be known up front. When you need data that outlives a function, or whose size is only known at run time, you request it from the **heap**.",
      ] },
      { heading: "malloc and calloc", body: [
        "`malloc(n)` reserves n bytes and returns a `void *` to the first one. The contents are uninitialised. The idiom `int *a = malloc(count * sizeof *a);` sizes the request from the pointer's own type, so it stays correct if the type changes.",
        "`calloc(count, size)` reserves count * size bytes and zero-fills them. It also checks the multiplication for overflow, which is a nice safety bonus.",
        "Both return NULL if the request cannot be satisfied. Always check before using the result.",
      ] },
      { heading: "realloc", body: [
        "`realloc(p, new_size)` resizes a block. It may grow it in place or move the contents to a new, larger block and free the old one. Because it can fail and return NULL while leaving the original block alive, never write `p = realloc(p, n);` directly. Use a temporary, check it, then assign.",
      ] },
      { heading: "free and ownership", body: [
        "`free(p)` hands the block back. After that, p still holds the old address but must not be used: it is dangling. Setting p to NULL afterwards is a good habit. `free(NULL)` is harmless.",
        "Every successful allocation must be freed exactly once. Forget and you leak memory; free twice and you corrupt the allocator. Decide for every block which part of the program **owns** it, meaning is responsible for freeing it.",
      ] },
    ],
    examples: [
      { title: "An array sized at run time", code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t n = 5;
    int *squares = malloc(n * sizeof *squares);
    if (squares == NULL) {
        fprintf(stderr, "out of memory\\n");
        return 1;
    }
    for (size_t i = 0; i < n; i++) {
        squares[i] = (int)(i * i);
    }
    printf("%d\\n", squares[4]);
    free(squares);
    squares = NULL;
    return 0;
}`, annotations: [
        { line: 6, note: "sizeof *squares is sizeof(int), taken from the pointer itself." },
        { line: 7, note: "Check for failure before touching the memory." },
        { line: 12, note: "Indexing heap memory works exactly like indexing an array." },
        { line: 15, note: "Release the block exactly once." },
        { line: 16, note: "Clear the dangling pointer." },
      ], output: "16" },
      { title: "Growing safely with realloc", code: `#include <stdlib.h>

int grow(int **data, size_t *cap) {
    size_t new_cap = *cap ? *cap * 2 : 4;
    int *tmp = realloc(*data, new_cap * sizeof **data);
    if (tmp == NULL) {
        return 0;
    }
    *data = tmp;
    *cap = new_cap;
    return 1;
}`, annotations: [
        { line: 3, note: "Pointer-to-pointer so we can update the caller's data pointer (lesson 12)." },
        { line: 5, note: "realloc(NULL, n) acts like malloc(n), so this also handles the first allocation." },
        { line: 6, note: "On failure, the old block is still valid and still owned by the caller. Nothing leaks." },
        { line: 9, note: "Only now overwrite the caller's pointer." },
      ] },
    ],
    diagrams: [mallocFreeDiagram],
    takeaways: [
      "Heap memory lives until free, independent of function calls.",
      "Write malloc(count * sizeof *p) and check for NULL.",
      "calloc zero-fills; malloc does not.",
      "Assign realloc's result to a temporary first.",
      "Free every block exactly once, then set the pointer to NULL.",
    ],
    quiz: [
      { q: "What is the risk in p = realloc(p, bigger);?", options: ["None", "If realloc fails, p becomes NULL and the original block leaks", "realloc always moves the data", "It frees p twice"], answer: 1, explain: "On failure realloc returns NULL but leaves the original block allocated. Overwriting p loses the only reference to it." },
      { q: "Which allocation function guarantees zeroed memory?", options: ["malloc", "calloc", "realloc", "free"], answer: 1, explain: "calloc zero-fills the block it returns." },
      { q: "After free(p), what does p contain?", options: ["NULL automatically", "The same old address, now invalid", "0xDEADBEEF", "A new address"], answer: 1, explain: "free does not change the pointer variable. It still holds the old address, which is now dangling." },
      { q: "A function mallocs a buffer, uses it, and returns without freeing or returning it. This is:", options: ["A dangling pointer", "A memory leak", "A double free", "Fine"], answer: 1, explain: "The block is still allocated but no pointer to it remains. That is a leak." },
    ],
  },
];
