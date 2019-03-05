# majaho

Make JavaScript HomoIconic

Not to be confused with song lyrics majahi, majaho. Although the pun is intended.

Similar in spirit to https://github.com/anko/eslisp .

# Introduction

My foray into lisp territory consists of Clojure and ClojureScript. It was a nice experience, but in the end I didn't succeed in convincing myself that it was the end of my journey because I still couldn't hold my project inside my mind and it felt like I needed to spend more effort translating than just copy-pasting JavaScript. I decided maybe a statically typed language would improve the situation so I tried ReasonML. It was a nice experience as well, but also felt like a lot of mental effort to understand and work on my old code later, plus lots of effort in writing statically typed wrappers around JavaScript. I also wasn't satisfied with the state of macros in ReasonML. They are not native enough, requiring external PPX.

When I am mentally exhausted I tend to script away something simple in JavaScript in JSBin. So I am back with JavaScript, just because it flows more easily from my hands. Also there's no project setup, no editor plugins, compilers to install and so on. But I want macros. I want homoiconicity. And maybe I want static typing, and if I do, I also want full type inference, so I don't actually have to write any types, plus I want to have my static bindings to JavaScript libraries written for me, preferably automatically generated or else by other people (think .ts.d parser to make use of TypeScript binding efforts).

So should I write my own programming language? I decided no, too much effort. Parsing never appealed to me. But maybe I can piggyback on JavaScript syntax? What about macros? I looked at sweet.js, but didn't really appeal to me. Because why? I don't know, it wasn't intuitive, have to learn how to write macros in it. What did appeal to me? Esprima did. Processing JavaScript using the AST. You can just run esprima parser (a few function calls) and then look at the output for what to do with it, then put it back to JavaScript using escodegen (also a few function calls).

But still, I think lisp is the father or mother of all macro processing. Although you still might want to special case the richness of imperative syntax (loops, variables, short circuit operators) somehow, not just rely on everything being pure function calls. So why not just dump esprima AST in s-exp (lisp paranthesized) form and process that using macros, then put it back together as JavaScript? That's exactly what this project is going to investigate.

How to integrate static typing remains an issue though. I haven't seen a good lispy syntax for static typing. But perhaps considering a value progation syntax will work. Such as (var a (int 0)). On the other hand, everything should be inferred. Maybe just make inference a hard requirement, not allowing to override the types? That might require some usage hacks though: fake usage of variables to infer their types. I think I am gonna go with making 100% code coverage with tests a requirement, and decide that you have to run the code at least once to infer the "static" types, which will be tracked in auxiliary or external data files. It's the only way to deal with the full power of a dynamic language anyway. 100% code coverage will also allow hard tree shaking, or full dead code elimination. If tests do not cover your code, it will be eliminated from the final product. Sounds harsh, but I think I can live with it. At least at the function or class level (exceptions may be hard to cover). Let's see. Uncovered code could be lazily loaded, but how do you interrupt a running synchronous function in JavaScript to wait asynchronously for code to arrive from the server? There's no sleep, so I don't think that's possible. So maybe require idempotency and code retry / reload or alternatively full page reload without expected "dead" code eliminated.

I have higher ambitions that both homoiconicity and inferred static typing as well. I want live coding to be native to the language, with partial code updates and so on. More on that later. Let's build it step by step.
