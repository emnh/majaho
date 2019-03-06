
const fs = require('fs');
const majaho = require('./majaho');

const source = fs.readFileSync('src/examples/mergeSort.js', 'utf8');

const ast = majaho.parse(source, {});

for (const accessor of majaho.walkTree(ast)) {
    const node = majaho.getNode(accessor);
    console.log("node", node.type);
}