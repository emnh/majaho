# majaho

Make JavaScript HomoIconic

Not to be confused with song lyrics majahi, majaho. Although the pun is intended.

Similar in spirit to https://github.com/anko/eslisp .

Also an interesting overview is at http://ceaude.twoticketsplease.de/js-lisps.html .

# Introduction

My foray into lisp territory consists of Clojure and ClojureScript. It was a nice experience, but in the end I didn't succeed in convincing myself that it was the end of my journey because I still couldn't hold my project inside my mind and it felt like I needed to spend more effort translating than just copy-pasting JavaScript. I decided maybe a statically typed language would improve the situation so I tried ReasonML. It was a nice experience as well, but also felt like a lot of mental effort to understand and work on my old code later, plus lots of effort in writing statically typed wrappers around JavaScript. I also wasn't satisfied with the state of macros in ReasonML. They are not native enough, requiring external PPX.

When I am mentally exhausted I tend to script away something simple in JavaScript in JSBin. So I am back with JavaScript, just because it flows more easily from my hands. Also there's no project setup, no editor plugins, compilers to install and so on. But I want macros. I want homoiconicity. And maybe I want static typing, and if I do, I also want full type inference, so I don't actually have to write any types, plus I want to have my static bindings to JavaScript libraries written for me, preferably automatically generated or else by other people (think .ts.d parser to make use of TypeScript binding efforts).

So should I write my own programming language? I decided no, too much effort. Parsing never appealed to me. But maybe I can piggyback on JavaScript syntax? What about macros? I looked at sweet.js, but didn't really appeal to me. Because why? I don't know, it wasn't intuitive, have to learn how to write macros in it. What did appeal to me? Esprima did. Processing JavaScript using the AST. You can just run esprima parser (a few function calls) and then look at the output for what to do with it, then put it back to JavaScript using escodegen (also a few function calls).

But still, I think lisp is the father or mother of all macro processing. Although you still might want to special case the richness of imperative syntax (loops, variables, short circuit operators) somehow, not just rely on everything being pure function calls. So why not just dump esprima AST in s-exp (lisp paranthesized) form and process that using macros, then put it back together as JavaScript? That's exactly what this project is going to investigate.

How to integrate static typing remains an issue though. I haven't seen a good lispy syntax for static typing. But perhaps considering a value propagation syntax will work. Such as (var a (int 0)). On the other hand, everything should be inferred. Maybe just make inference a hard requirement, not allowing to override the types? That might require some usage hacks though: fake usage of variables to infer their types. I think I am gonna go with making 100% code coverage with tests a requirement, and decide that you have to run the code at least once to infer the "static" types, which will be tracked in auxiliary or external data files. It's the only way to deal with the full power of a dynamic language anyway. 100% code coverage will also allow hard tree shaking, or full dead code elimination. If tests do not cover your code, it will be eliminated from the final product. Sounds harsh, but I think I can live with it. At least at the function or class level (exceptions may be hard to cover). Let's see. Uncovered code could be lazily loaded, but how do you interrupt a running synchronous function in JavaScript to wait asynchronously for code to arrive from the server? There's no sleep, so I don't think that's possible. So maybe require idempotency and code retry / reload or alternatively full page reload without expected "dead" code eliminated.

I have higher ambitions than both homoiconicity and inferred static typing as well. I want live coding to be native to the language, with partial code updates and so on. More on that later. Let's build it step by step.

# Dependencies

Let's use [Cherow](https://github.com/cherow/cherow) instead of Esprima since it claims to be much faster and standards compliant.
Let's use [Astring](https://github.com/davidbonnet/astring) instead of Escodegen since it claims the same.
[Immer](https://github.com/mweststrate/immer) will be used for immutable AST.
[three.js](https://github.com/mrdoob/three.js/) will be used as example target foreign interface.

# Implementation

for each node in AST:
 - output (node.type (node.property0 node.property0value) ... (node.propertyN node.propertyNvalue))
 - shorten it to (node.type node.property0value ... node.propertyNvalue) where the properties are implied by node.type
 - let nodeAlias = shortAlias(node.type) and shorten it to (nodeAlias node.property0Value ... node.propertyNvalue)
 - exclude node.type when implied by operator: (binop operator ...) -> (operator ...)

For example:
 - js -> estree -> shortform -> compressed
 - 1 + 2 -> (BinaryExpression (operator +) (left (literal 1)) (right (literal 2))) -> (BinaryExpression + 1 2) -> (+ 1 2)
 
All forms should be considered equivalent and translate back to the same JavaScript.

Every form shall have a name, be equivalent and each macro can specify which form it operates on.
The names are: estree, shortform and compressed.

The rule is that every short alias is generated by the two first letters for each capitalized word in the ESTree definition.
I would recommend that macros operate on the long form, since it's easier to know which node we're operating on,
both for people familiar with estree and intuitively, since the names are quite verbose.
After some thought I don't like the idea of short aliases, let's stick to ESTree names.
I will support alias mapping, but not include any alias mapping by default.
Or perhaps a partial alias mapping with only the most popular node types aliased.

Hmm.. we might want to have the patterns be valid JavaScript, so that we can use them without quoting.
Then all operators should have names. So let it be another form then. For example:
 - BinaryExpression(plus, 1, 2)

Let's call it 'validjsform'. Let it be the canonical form.

# API

The AST will be made immutable using immer.
We should support AST tree transducers with composition somehow for performance.

transformAllESTree: Takes tree as first argument. Walks it.
Transforms nodes matching second argument pattern into third argument pattern.

```javascript
// Declare macro
const myMacro = majaho.macro((tree) => {
    majaho.transformAll(tree, majaho.ESTree, () => BinaryExpression('+', A, B), () => BinaryExpression('-', B, A));
});

// Equivalent macro
const myMacro2 = majaho.macro((tree) => {
    majaho.transformAll(tree, mahajo.JSForm, () => A + B, () => B - A);
});

// Call it on a function at runtime. Decorator pattern so to speak.
// This depends on JS engine supplying the source code for functions in its object.
const newFun = myMacro(() => c + d);

// Or expand macros at compile time for performance and maybe better browser support (?)
// TODO: How to determine if macro can be expanded at compile time?
const fs = require('fs');
const source = fs.readFileSync('source.js');
majaho.expandMacros(source);
fs.writeFileSync('dest.js');

// TODO: commandline tool

// TODO: webpack plugin
```

```javascript
const myMacro = majaho.macro((tree) => {
    for (const accessor of majaho.walkTree(tree, majaho.BFS)) {
        const node = majaho.getNode(accessor);

        const match = mahajo.match(node, majaho.JSForm, () => A + B);
        if (match !== null) {
            majaho.replace(accessor, match, () => B - A);
        }
    }
});

majaho.parse(source, options);
majaho.getNode(accessor);
majaho.getUniqueID(accessor);
majaho.getParent(accessor);
majaho.getParentKey(accessor);
majaho.getPath(accessor);

// constants
majaho.BFS;
majaho.DFSPreOrder;
majaho.DFSPostOrder;
majaho.ESTree;
majaho.JSForm;
```

# Type tracking

```javascript

```

# Value Tracking

Value lifting:
 - for each expression node in AST wrap expression node in lift function
 - for each unwrapped / foreign function call or evaluation in AST wrap function in unlift function


# Description of files

 - src/data/es6.json: From https://github.com/estree/formal/tree/master/formal-data

# Resources
  - http://lisperator.net/pltut/compiler/cps-transformer
  - https://astexplorer.net/
  - http://www.graspjs.com/
  - https://en.wikipedia.org/wiki/Tree_traversal
