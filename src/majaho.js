import { Deque } from '@blakeembrey/deque';

const cherow = require('cherow');

let c = 0;

export const BFS = c++;
export const DFSPreOrder = c++;
export const DFSPostOrder = c++;

export const ESTree = c++;
export const JSForm = c++;

export function parse(source, options) {
    return cherow.parse(source, options);
}

let majahoID = 0;

export function* walkTree(tree, order) {
    const q = new Deque();

    q.push(tree);

    while (q.length > 0) {
        const top = q.shift();

        if (order === order.DFSPreOrder) {
            yield top.majahoID;
        }

        for (const child in top.node) {
            if (top.node[child] !== null &&
                top.node[child] !== undefined &&
                Object.hasOwnProperty(top.node[child], 'type')) {
                const newNode = {
                    majahoID: majahoID++
                };
                if (order === order.BFS) {
                    q.push(newNode);
                } else {
                    q.unshift(newNode);
                }
            }
        }
        
        yield top.majahoID;
    }
}
// for (let key in cherow.E) {
//     console.log("key", key);
// }