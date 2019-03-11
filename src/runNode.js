
const fs = require('fs');
const majaho = require('./majaho');

// const source = fs.readFileSync('src/examples/mergeSort.js', 'utf8');
const source = '1 + 2 * 3';

const ast = majaho.parse(source, {});

// console.log(ast);

// const walker = new majaho.TreeWalker(ast, majaho.Order.BFS);
// for (const accessor of walker) {
//     const node = walker.getNode(accessor);
//     // console.log("node", node.type, node);
// }

// const lisp = majaho.toLisp(ast);
// console.log("lisp", lisp);

const parseTSD = require('./parseTSD');

const fname = './node_modules/cherow/dist/types/estree.d.ts';
if (fs.existsSync(fname)) {
    const json = parseTSD(fname, {});
    // const json = parseTSD('./src/test.d.ts', {});
    
    console.log("json", JSON.stringify(json, null, 2));
} else {
    console.log("no such file: ", fname);
}