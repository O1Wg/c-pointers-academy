import { arraysStringsDiagram, layoutDiagram, passByValueDiagram, stackFramesDiagram, typesDiagram } from "./diagrams";
import type { Lesson } from "./types";

export const foundationLessons: Lesson[] = [
  {
    slug: "hello-c",
    module: 1,
    number: 1,
    title: "Hello, C",
    summary: "Write, compile and run your first C program, and learn what the compiler actually does with your source file.",
    minutes: 12,
    difficulty: "beginner",
    sections: [
      { heading: "C is compiled, not interpreted", body: [
        "When you write Python, an interpreter reads your file and runs it line by line. C works differently. A program called a **compiler** (usually `gcc` or `clang`) reads your whole `.c` file once and translates it into machine code, producing an executable file. You then run that executable directly.",
        "That extra step is where much of C's speed comes from, and it is also why many mistakes are caught before your program ever runs. Learn to read compiler warnings: they are free help.",
      ] },
      { heading: "The compile cycle", body: [
        "Behind one `gcc hello.c -o hello` command there are four stages. The **preprocessor** handles lines starting with `#`, pasting in header files like `stdio.h`. The **compiler** turns the result into assembly. The **assembler** turns assembly into an object file of machine code. The **linker** joins your object file with library code (such as the real implementation of `printf`) to make the final executable.",
        "You rarely run these stages one by one, but knowing they exist explains errors. \"undefined reference to `foo`\" is a linker error: the code compiled, but nobody supplied the body of `foo`.",
      ] },
      { heading: "main and printf", body: [
        "Every C program starts executing at a function called `main`. Its return value is handed to the operating system: `0` means success, anything else signals failure.",
        "`printf` prints formatted text. The first argument is a format string; each `%` placeholder is replaced by the next argument. `%d` prints an int, `%f` a double, `%c` a char, `%s` a string, and `\\n` ends the line. Using the wrong placeholder for a type is undefined behaviour, so match them carefully.",
      ] },
      { heading: "Turn warnings on", body: [
        "Always compile with `-Wall -Wextra`. These flags enable warnings for code that is legal but almost certainly wrong, like using a variable before giving it a value. Treat every warning as a bug report until you understand it.",
      ] },
    ],
    examples: [
      { title: "hello.c", code: `#include <stdio.h>

int main(void) {
    printf("Hello, C!\\n");
    return 0;
}`, annotations: [
        { line: 1, note: "Preprocessor directive: pastes in declarations for printf and friends." },
        { line: 3, note: "Execution begins here. void means main takes no arguments." },
        { line: 4, note: "\\n is a newline. Without it the prompt would appear on the same line." },
        { line: 5, note: "Return 0 to tell the operating system the program succeeded." },
      ], output: "Hello, C!" },
      { title: "Compiling and running from a terminal", code: `/* In a terminal: */
/*   gcc -Wall -Wextra -std=c17 hello.c -o hello  */
/*   ./hello                                       */

#include <stdio.h>

int main(void) {
    int year = 1972;
    double version = 17.0;
    printf("C was born in %d; we use C%.0f\\n", year, version);
    return 0;
}`, annotations: [
        { line: 2, note: "-Wall -Wextra enable warnings; -std=c17 picks the language standard; -o names the output." },
        { line: 3, note: "./ runs the executable from the current directory." },
        { line: 10, note: "%d is replaced by year, %.0f by version with zero decimal places." },
      ], output: "C was born in 1972; we use C17" },
    ],
    diagrams: [],
    takeaways: [
      "C source is compiled into a native executable before it runs.",
      "The build has four stages: preprocess, compile, assemble, link.",
      "Execution starts at main; returning 0 signals success.",
      "printf placeholders must match their argument types exactly.",
      "Compile with -Wall -Wextra and read every warning.",
    ],
    quiz: [
      { q: "Which stage pastes the contents of stdio.h into your file?", options: ["The linker", "The preprocessor", "The assembler", "The operating system"], answer: 1, explain: "Lines beginning with # are handled by the preprocessor before compilation proper begins." },
      { q: "You see \"undefined reference to `area`\". What most likely happened?", options: ["A syntax error on the line calling area", "The linker could not find a definition for area", "area returned the wrong type", "printf was used incorrectly"], answer: 1, explain: "\"undefined reference\" comes from the linker: the call compiled, but no object file supplied the function's body." },
      { q: "What does return 0; at the end of main communicate?", options: ["The program printed nothing", "The program succeeded", "main has no return type", "Memory was freed"], answer: 1, explain: "main's return value becomes the process exit status, and 0 conventionally means success." },
      { q: "Which placeholder prints an int?", options: ["%s", "%f", "%d", "%c"], answer: 2, explain: "%d is for int. %f is for double, %s for strings and %c for single characters." },
    ],
  },
  {
    slug: "variables-types-sizes",
    module: 1,
    number: 2,
    title: "Variables, Types and Sizes",
    summary: "Every variable is a box of bytes with a type that says how big the box is and how to read it.",
    minutes: 16,
    difficulty: "beginner",
    sections: [
      { heading: "A variable is a named box of bytes", body: [
        "When you write `int count = 42;` the compiler sets aside some bytes of memory, remembers that the name `count` refers to them, and stores the bit pattern for 42 there. The **type** decides two things: how many bytes the box uses and how to interpret the bits inside.",
        "This is the single most useful mental model in C. Everything later, including pointers, is just more boxes with more interesting contents.",
      ] },
      { heading: "The basic types", body: [
        "`char` is exactly 1 byte and holds small integers, which is how characters are stored: `'A'` is just 65. `int` is the natural integer for the machine, almost always 4 bytes today. `float` is a 4-byte floating-point number and `double` is an 8-byte one with more precision; prefer `double` unless you have a reason not to.",
        "The standard only guarantees minimum sizes, so code that cares about exact widths uses `int32_t`, `uint8_t` and friends from `<stdint.h>`.",
      ] },
      { heading: "sizeof tells you the truth", body: [
        "`sizeof` is an operator that gives the size of a type or expression in bytes, computed at compile time. Its result has type `size_t`, which you print with `%zu`.",
        "Never hard-code sizes like 4 when you mean \"the size of an int\". Write `sizeof(int)` or, better, `sizeof x` for a variable x, so the code stays correct if the type changes.",
      ] },
      { heading: "Uninitialised means garbage", body: [
        "A local variable that you declare but do not assign holds whatever bits were left in that memory. Reading it is undefined behaviour. In our diagrams those boxes show `???`. Initialise variables when you declare them and that whole class of bug disappears.",
      ] },
    ],
    examples: [
      { title: "Inspecting sizes", code: `#include <stdio.h>

int main(void) {
    printf("char:   %zu\\n", sizeof(char));
    printf("int:    %zu\\n", sizeof(int));
    printf("float:  %zu\\n", sizeof(float));
    printf("double: %zu\\n", sizeof(double));
    return 0;
}`, annotations: [
        { line: 4, note: "sizeof(char) is 1 by definition, on every platform." },
        { line: 5, note: "Typically 4 on modern desktops, but only guaranteed to be at least 2." },
        { line: 7, note: "%zu is the correct format for size_t, the type sizeof produces." },
      ], output: "char:   1\nint:    4\nfloat:  4\ndouble: 8" },
      { title: "Characters are numbers", code: `#include <stdio.h>

int main(void) {
    char letter = 'A';
    int code = letter;
    char next = letter + 1;
    printf("%c is %d, next is %c\\n", letter, code, next);
    int whole = 7 / 2;
    double exact = 7 / 2.0;
    printf("%d %.1f\\n", whole, exact);
    return 0;
}`, annotations: [
        { line: 5, note: "A char converts to int silently; 'A' becomes 65." },
        { line: 6, note: "Arithmetic on chars works because they are small integers. 'A' + 1 is 'B'." },
        { line: 8, note: "Integer division truncates: 7 / 2 is 3, not 3.5." },
        { line: 9, note: "Make one operand a double to get floating-point division." },
      ], output: "A is 65, next is B\n3 3.5" },
    ],
    diagrams: [typesDiagram],
    takeaways: [
      "A variable is a named box of bytes; its type sets the size and the interpretation.",
      "char is 1 byte, int is usually 4, double is 8. Use sizeof instead of guessing.",
      "Characters are small integers, so 'A' + 1 == 'B'.",
      "Integer division truncates toward zero.",
      "Uninitialised locals contain garbage. Initialise on declaration.",
    ],
    quiz: [
      { q: "What does sizeof(char) evaluate to?", options: ["It depends on the platform", "1", "2", "8"], answer: 1, explain: "The C standard defines sizeof(char) as exactly 1. Every other size is measured in units of char." },
      { q: "What is printed?", code: `int x = 9 / 4;\nprintf("%d", x);`, options: ["2.25", "2", "3", "Undefined"], answer: 1, explain: "Both operands are int, so integer division truncates 2.25 to 2." },
      { q: "What is the value of an uninitialised local int?", options: ["Always 0", "Always -1", "Indeterminate; reading it is undefined behaviour", "The value of the previous variable"], answer: 2, explain: "Local variables are not zeroed. They contain whatever bits were left in that memory, and reading them is undefined behaviour." },
      { q: "Which format specifier matches a size_t?", options: ["%d", "%zu", "%lf", "%p"], answer: 1, explain: "%zu is the portable specifier for size_t." },
    ],
  },
  {
    slug: "control-flow-functions",
    module: 1,
    number: 3,
    title: "Control Flow and Functions",
    summary: "Branches, loops and functions, plus the rule that explains half of all beginner confusion: C passes arguments by value.",
    minutes: 18,
    difficulty: "beginner",
    sections: [
      { heading: "Deciding and repeating", body: [
        "`if`, `else if` and `else` choose between paths. In C any nonzero value counts as true and zero counts as false, so `if (count)` means \"if count is not zero\".",
        "`while` repeats while a condition holds, `for` packs initialisation, condition and update into one line, and `do ... while` always runs its body at least once. `break` leaves a loop early; `continue` skips to the next iteration.",
      ] },
      { heading: "Functions", body: [
        "A function has a return type, a name, a parameter list and a body. Declare it before you use it, either by defining it above the caller or by writing a prototype such as `int add(int a, int b);`.",
        "Functions let you name an idea once and reuse it. Short functions with clear names are the cheapest debugging tool you have.",
      ] },
      { heading: "Pass-by-value: the copy rule", body: [
        "When you call `add_one(score)`, C does not hand the function `score`. It evaluates `score`, gets a value like 9, and copies that value into the parameter, which is a brand new local variable in the function's own stack frame.",
        "So when the function changes its parameter, it changes its own copy. When it returns, the copy is thrown away and the caller's variable is exactly as it was. Every argument in C, without exception, is passed this way. Pointers do not break the rule; they work with it, by making the copied value an address. That is lesson 8.",
      ] },
    ],
    examples: [
      { title: "Loops and branches", code: `#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 15; i++) {
        if (i % 15 == 0) {
            printf("FizzBuzz\\n");
        } else if (i % 3 == 0) {
            printf("Fizz\\n");
        } else if (i % 5 == 0) {
            printf("Buzz\\n");
        } else {
            printf("%d\\n", i);
        }
    }
    return 0;
}`, annotations: [
        { line: 4, note: "init; condition; update. i only exists inside the loop." },
        { line: 5, note: "Check the most specific case first, or 15 would print Fizz." },
        { line: 6, note: "% is remainder. i % 15 == 0 means i is divisible by 15." },
      ] },
      { title: "A function returns a new value instead", code: `#include <stdio.h>

int add_one(int n) {
    return n + 1;
}

int main(void) {
    int score = 9;
    score = add_one(score);
    printf("%d\\n", score);
    return 0;
}`, annotations: [
        { line: 3, note: "n is a copy. We don't try to modify the caller's variable." },
        { line: 4, note: "Return the computed value instead." },
        { line: 9, note: "The caller decides to store the result. This is the cleanest fix when there is one output." },
      ], output: "10" },
    ],
    diagrams: [passByValueDiagram],
    takeaways: [
      "Zero is false; every other value is true.",
      "Declare or define a function before calling it.",
      "Every argument is copied into a fresh parameter variable.",
      "Changing a parameter never changes the caller's variable.",
      "Return a value, or pass an address (lesson 8), to send results back.",
    ],
    quiz: [
      { q: "What is printed?", code: `void reset(int x) { x = 0; }\n\nint main(void) {\n    int v = 5;\n    reset(v);\n    printf("%d", v);\n}`, options: ["0", "5", "Undefined", "Compile error"], answer: 1, explain: "reset receives a copy of 5. It zeroes its own copy, which is discarded on return. v is still 5." },
      { q: "Which loop always runs its body at least once?", options: ["for", "while", "do ... while", "None of them"], answer: 2, explain: "do ... while checks the condition after the body." },
      { q: "In C, which values does if treat as true?", options: ["Only 1", "Any nonzero value", "Only positive values", "Only the keyword true"], answer: 1, explain: "Any nonzero value is true. Zero (including a NULL pointer) is false." },
    ],
  },
  {
    slug: "arrays-and-strings",
    module: 1,
    number: 4,
    title: "Arrays and Strings",
    summary: "Arrays are boxes placed side by side. Strings are char arrays that end in a zero byte. C never checks your bounds.",
    minutes: 20,
    difficulty: "beginner",
    sections: [
      { heading: "Contiguous memory", body: [
        "`int marks[3];` reserves room for three ints placed one directly after another: 12 bytes with no gaps. `marks[0]` is at the start, `marks[1]` is 4 bytes later, `marks[2]` 8 bytes later. In general element `i` lives at start + i * sizeof(element).",
        "That simple formula is why indexing is instant no matter how big the array is, and it is the reason pointer arithmetic (lesson 9) works.",
      ] },
      { heading: "Indexing starts at 0", body: [
        "An array of N elements has valid indexes 0 to N - 1. The index is an offset from the start, so the first element is zero steps away. Loops usually look like `for (int i = 0; i < n; i++)`, with `<` not `<=`.",
      ] },
      { heading: "Strings and the null terminator", body: [
        "C has no string type. A string is a `char` array whose end is marked by the byte `'\\0'` (value 0). `char name[6] = \"Ada\";` stores 'A', 'd', 'a', '\\0' and zero-fills the rest. Functions like `printf(\"%s\")` and `strlen` walk forward until they hit that zero byte.",
        "So a string needs one more byte than its visible length. Forget the terminator and every string function keeps reading into whatever memory comes next.",
      ] },
      { heading: "Out of bounds: C will not stop you", body: [
        "Writing `marks[3] = 1;` compiles and may even appear to work. It writes into whatever memory sits after the array, which may be another variable, a return address, or nothing you are allowed to touch. This is **undefined behaviour**, and it is the root of buffer-overflow security bugs.",
        "The defence is discipline: track the length alongside the array, use `<` in loop conditions, and compile with `-fsanitize=address` while learning so out-of-bounds writes are caught immediately.",
      ] },
    ],
    examples: [
      { title: "Summing an array", code: `#include <stdio.h>

int main(void) {
    int temps[5] = {18, 21, 19, 24, 22};
    int n = sizeof temps / sizeof temps[0];
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += temps[i];
    }
    printf("average: %.1f\\n", total / (double)n);
    return 0;
}`, annotations: [
        { line: 5, note: "Total bytes divided by bytes per element gives 5. Only works on a real array, not a pointer." },
        { line: 7, note: "i < n, never i <= n. temps[5] would be out of bounds." },
        { line: 10, note: "Cast to double so the division keeps its fraction." },
      ], output: "average: 20.8" },
      { title: "A string is a char array", code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "pointer";
    printf("length %zu, bytes %zu\\n", strlen(word), sizeof word);
    word[0] = 'P';
    printf("%s\\n", word);
    return 0;
}`, annotations: [
        { line: 5, note: "Size is inferred as 8: seven letters plus '\\0'." },
        { line: 6, note: "strlen counts characters before '\\0' (7); sizeof counts the whole array (8)." },
        { line: 7, note: "Array elements are writable, including characters of a string stored in an array." },
      ], output: "length 7, bytes 8\nPointer" },
    ],
    diagrams: [arraysStringsDiagram],
    takeaways: [
      "Array elements sit back to back; element i is at start + i * sizeof(element).",
      "Valid indexes run from 0 to N - 1.",
      "A string is a char array terminated by '\\0', so it needs length + 1 bytes.",
      "strlen counts characters; sizeof on an array counts bytes.",
      "C never checks bounds. Out-of-bounds access is undefined behaviour.",
    ],
    quiz: [
      { q: "How many bytes does char s[] = \"hey\"; occupy?", options: ["3", "4", "8", "It depends on the compiler"], answer: 1, explain: "Three characters plus the '\\0' terminator: 4 bytes." },
      { q: "int a[10]; Which index is the last valid one?", options: ["10", "9", "11", "0"], answer: 1, explain: "Indexes run from 0 to 9. a[10] is one past the end." },
      { q: "If int a[4] starts at address 0x1000 and int is 4 bytes, where is a[2]?", options: ["0x1002", "0x1008", "0x1004", "0x1010"], answer: 1, explain: "0x1000 + 2 * 4 = 0x1008." },
      { q: "What happens when you write past the end of an array?", options: ["A runtime error is always raised", "The array grows automatically", "Undefined behaviour: anything can happen", "The write is ignored"], answer: 2, explain: "C performs no bounds checking. The write lands in neighbouring memory, and the behaviour is undefined." },
    ],
  },
  {
    slug: "memory-layout",
    module: 2,
    number: 5,
    title: "How Memory Is Laid Out",
    summary: "Memory is a giant numbered row of bytes, carved into regions for code, globals, the stack and the heap.",
    minutes: 15,
    difficulty: "beginner",
    sections: [
      { heading: "Every byte has an address", body: [
        "Picture memory as one very long street of houses, each holding one byte, each with a house number. That number is the byte's **address**. We write addresses in hexadecimal, like `0x7ffe9b2c`, because they are long and hex maps neatly onto binary.",
        "A variable bigger than one byte occupies several consecutive houses. Its address is the address of the first one.",
      ] },
      { heading: "The four regions", body: [
        "A running program's memory is divided into regions with different rules. The **code** (text) region holds your compiled functions and is read-only. The **static** region holds global and `static` variables, plus string literals in a read-only part; they live for the whole program. The **stack** holds local variables and function parameters; it grows and shrinks automatically as functions are called and return. The **heap** holds memory you request explicitly with `malloc`; it lives until you `free` it.",
        "When you ask \"how long does this value live?\", the answer is \"it depends which region it is in\". That one question will diagnose most pointer bugs you ever meet.",
      ] },
      { heading: "Printing addresses", body: [
        "You can see addresses yourself with `printf(\"%p\", (void *)&x);`. The exact numbers change between runs because of address space layout randomisation, a security feature, but the pattern holds: stack addresses are high, heap addresses are lower, and code and globals are lower still.",
      ] },
    ],
    examples: [
      { title: "Seeing the regions", code: `#include <stdio.h>
#include <stdlib.h>

int global_count = 0;

int main(void) {
    int local = 1;
    int *dyn = malloc(sizeof *dyn);
    printf("code   %p\\n", (void *)main);
    printf("static %p\\n", (void *)&global_count);
    printf("heap   %p\\n", (void *)dyn);
    printf("stack  %p\\n", (void *)&local);
    free(dyn);
    return 0;
}`, annotations: [
        { line: 4, note: "A global: lives in the static region for the entire run." },
        { line: 8, note: "dyn itself is on the stack; the int it points to is on the heap." },
        { line: 9, note: "Casting a function pointer to void * is a common extension for printing; fine on mainstream platforms." },
        { line: 12, note: "%p prints an address. It expects a void *." },
      ], output: "code   0x5581c3a01189\nstatic 0x5581c3a04014\nheap   0x5581c4f2a2a0\nstack  0x7ffd2b6c8a1c" },
      { title: "Multi-byte values span several addresses", code: `#include <stdio.h>

int main(void) {
    int n = 0x11223344;
    unsigned char *b = (unsigned char *)&n;
    for (size_t i = 0; i < sizeof n; i++) {
        printf("%p: %02x\\n", (void *)(b + i), b[i]);
    }
    return 0;
}`, annotations: [
        { line: 5, note: "Viewing an object's bytes through unsigned char * is always allowed." },
        { line: 7, note: "On little-endian machines (x86, most ARM) the lowest byte, 44, comes first." },
      ], output: "0x7ffc...a4: 44\n0x7ffc...a5: 33\n0x7ffc...a6: 22\n0x7ffc...a7: 11" },
    ],
    diagrams: [layoutDiagram],
    takeaways: [
      "Memory is a row of bytes; an address is a byte's position in that row.",
      "Code and string literals are read-only; globals live for the whole program.",
      "Locals live on the stack and vanish when their function returns.",
      "Heap memory lives until you free it.",
      "Use %p with a void * to print addresses.",
    ],
    quiz: [
      { q: "Where does a local variable inside a function normally live?", options: ["Heap", "Stack", "Code region", "Static region"], answer: 1, explain: "Locals and parameters live in the function's stack frame." },
      { q: "Where is the string literal in const char *s = \"hi\"; stored?", options: ["On the stack", "On the heap", "In read-only static data", "Inside the pointer s"], answer: 2, explain: "String literals are stored in a read-only data region for the program's whole run. s, a local, merely points there." },
      { q: "Which memory lives until you explicitly release it?", options: ["Stack", "Heap", "Registers", "Code"], answer: 1, explain: "Heap memory from malloc stays allocated until free is called on it." },
    ],
  },
  {
    slug: "stack-and-function-calls",
    module: 2,
    number: 6,
    title: "The Stack and Function Calls",
    summary: "Each call pushes a frame of locals; each return pops it. Lifetime and scope fall straight out of that picture.",
    minutes: 18,
    difficulty: "intermediate",
    sections: [
      { heading: "Frames", body: [
        "Each time a function is called, a block of stack memory called a **stack frame** is reserved for it. The frame holds the parameters, the local variables and some bookkeeping like the address to return to. When the function returns, the frame is released in one go.",
        "Because frames are always released in the reverse order they were created, the stack behaves like a pile of plates: last on, first off. That is why recursion works: every recursive call gets its own frame with its own copies of the locals.",
      ] },
      { heading: "Scope versus lifetime", body: [
        "**Scope** is where in the source a name can be used: a local is visible from its declaration to the closing brace of its block. **Lifetime** is when the storage exists at run time: for a local, from when its block is entered until it is left.",
        "Usually the two line up. They come apart in a dangerous way when a pointer outlives the variable it points to.",
      ] },
      { heading: "Never return the address of a local", body: [
        "If a function returns `&local`, the caller receives an address inside a frame that has just been popped. The bytes may still look right for a moment, but the next function call will reuse that space. This is a dangling pointer, and compilers warn about it (`-Wreturn-local-addr`).",
        "To hand data back, return it by value, write it through a pointer the caller supplied, or allocate it on the heap.",
      ] },
    ],
    examples: [
      { title: "Recursion makes a tower of frames", code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main(void) {
    printf("%d\\n", factorial(4));
    return 0;
}`, annotations: [
        { line: 3, note: "Each call gets its own n in its own frame." },
        { line: 4, note: "The base case stops the tower from growing forever (which would overflow the stack)." },
        { line: 7, note: "factorial(4) waits for factorial(3), which waits for factorial(2)... then they unwind." },
      ], output: "24" },
      { title: "The dangling local (a bug)", code: `#include <stdio.h>

int *make_number(void) {
    int n = 42;
    return &n;        /* BUG: n dies here */
}

int main(void) {
    int *p = make_number();
    printf("%d\\n", *p);  /* undefined behaviour */
    return 0;
}`, annotations: [
        { line: 4, note: "n lives in make_number's frame." },
        { line: 5, note: "The address escapes, but the frame is popped as the function returns." },
        { line: 10, note: "Reading through p accesses dead stack memory. gcc warns: function returns address of local variable." },
      ] },
    ],
    diagrams: [stackFramesDiagram],
    takeaways: [
      "Every function call pushes a frame; every return pops it.",
      "Locals exist only while their frame does.",
      "Recursion works because each call has its own frame.",
      "Scope is a compile-time idea; lifetime is a run-time idea.",
      "Never return or store the address of a local beyond its function.",
    ],
    quiz: [
      { q: "During factorial(3) (recursive), how many factorial frames exist at the deepest point?", options: ["1", "2", "3", "4"], answer: 2, explain: "factorial(3) calls factorial(2) which calls factorial(1): three frames stacked." },
      { q: "What is wrong with returning &local from a function?", options: ["Nothing; addresses are always valid", "It is a syntax error", "The local's frame is popped, so the pointer dangles", "It leaks memory"], answer: 2, explain: "The local's storage ends when the function returns. The returned pointer refers to dead stack memory." },
      { q: "Which statement about stack frames is true?", options: ["They are freed with free()", "They are released automatically when the function returns", "They persist until the program exits", "They live on the heap"], answer: 1, explain: "Stack frames are managed automatically: pushed on call, popped on return." },
    ],
  },
];
