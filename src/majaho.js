// import { Deque } from '@blakeembrey/deque';

const cherow = require('cherow');
const Deque = require('@blakeembrey/deque').Deque;
const orderedES6 = require('./orderedES6');
const es6order = orderedES6.resolveClasses();

let c = 0;

const ex = module.exports = {};

const Order = ex.Order = {
    BFS: c++,
    DFSPreOrder: c++,
    DFSPostOrder: c++,
    DFSBoth: c++
};

function logWarning(msg) {
    console.log(msg);
}

// const Form = ex.Form = {
//     ESTree: c++,
//     JSForm: c++
// };

ex.parse = function(source, options) {
    const ourOptions = {
        ranges: true
    };
    for (const child in options) {
        ourOptions[child] = options[child];
    }
    return cherow.parse(source, ourOptions);
}

ex.TreeWalker = function(estree, order) {
    this.estree = estree;
    this.order = order;
    this.q = new Deque();
    this.qAll = {};
    this.first = true;
};

const isNode = function(node) {
    return (
        node !== null &&
        node !== undefined &&
        Object.prototype.hasOwnProperty.call(node, 'type'));
};

const newAccessor = function(parent, parentKey, parentIndex, node, nodeID, order) {
    return {
        parent: parent,
        parentKey: parentKey,
        parentIndex: parentIndex,
        node: node,
        nodeID: nodeID,
        order: order,
        pushOrder: null
    };
}

ex.TreeWalker.prototype[Symbol.iterator] = function*() {
    if (!this.first) {
        throw new Error("cannot iterate twice. make new walker");
    }
    this.first = false;
    const tree = this.estree;
    const order = this.order;
    const nodeOrder = order === Order.BFS ? Order.BFS : Order.DFSPreOrder;
    const q = this.q;
    const qAll = this.qAll;

    let nodeID = 0;
    q.push(newAccessor(null, null, null, tree, nodeID++, nodeOrder));
    if (order === Order.DFSPostOrder || order === Order.DFSBoth) {
        q.push(newAccessor(null, null, null, tree, nodeID++, Order.DFSPostOrder));
    }

    // const sortChildrenBySourceStart = (x) => {
    //     const temp = [];
    //     for (child in x) {
    //         //if (isNode(x[child])) {
    //         if (x[child] !== undefined && x[child] !== null && Object.prototype.hasOwnProperty.call(node, 'start')) {
    //             temp.push(child);    
    //         }
    //         //} else if (Array.isArray(x[child])) {
    //         //}
    //     }
    //     temp.sort((a, b) => a.start - b.start);
    //     return temp;
    // };

    while (q.size > 0) {
        const top = q.popLeft();

        //qAll.push(top);
        // console.log(top);

        if (isNode(top.node) && (top.order === order || order === Order.DFSBoth)) {
            // console.log("yield");
            qAll[top.nodeID] = top;
            yield top.nodeID;
        }

        if (top.order !== Order.DFSPostOrder) {
            
            const orderedProps = es6order[top.node.type];
            
            const allProps = [];
            for (const child in top.node) {
                if (['type', 'start', 'end'].indexOf(child) >= 0) {
                    // console.log("continuing with " + child);
                    continue;
                }
                if (orderedProps.indexOf(child) < 0) {
                    logWarning(
                        'unexpected property on ' + top.node.type + ': ' + child
                        + ', expected one of: ' + orderedProps);
                }
                allProps.push(child);
            }

            console.log("CHILDREN " + top.node.type + ": " + orderedProps + " vs " + allProps);

            for (const child of orderedProps) {
                // console.log(child, top.node[child]);
                if (isNode(top.node[child])) {
                    const newNode = newAccessor(top.nodeID, child, null, top.node[child], nodeID++, nodeOrder);
                    if (order === Order.BFS) {
                        q.push(newNode);
                    } else {
                        if (order === Order.DFSPostOrder || order === Order.DFSBoth) {
                            q.pushLeft(newAccessor(top.nodeID, child, null, top.node[child], nodeID++, Order.DFSPostOrder));
                        }
                        if (order === Order.DFSPreOrder || order === Order.DFSBoth) {
                            q.pushLeft(newNode);
                        }
                    }
                } else if (Array.isArray(top.node[child])) {
                    for (let i = 0; i < top.node[child].length; i++) {
                        if (isNode(top.node[child][i])) {
                            const newNode = newAccessor(top.nodeID, child, i, top.node[child][i], nodeID++, nodeOrder);
                            if (order === Order.BFS) {
                                q.push(newNode);
                            } else {
                                if (order === Order.DFSPostOrder || order === Order.DFSBoth) {
                                    q.pushLeft(newAccessor(top.nodeID, child, i, top.node[child][i], nodeID++, Order.DFSPostOrder));
                                }
                                if (order === Order.DFSPreOrder || order === Order.DFSBoth) {
                                    q.pushLeft(newNode);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

ex.TreeWalker.prototype.getOrder = function(accessor) {
    // console.log("acc", accessor, this.qAll.size);
    return this.qAll[accessor].order;
};

ex.TreeWalker.prototype.getNode = function(accessor) {
    // console.log("acc", accessor, this.qAll.size);
    return this.qAll[accessor].node;
};

// TODO: new BFS walker with depth 1 instead

// ex.TreeWalker.prototype.getChildren = function*(accessor) {
//     const node = this.qAll.peek(accessor).node;
//     for (const child in node) {
//         if (isNode(node[child])) {
//             yield node[child];
//         }
//     }
// }

ex.TreeWalker.prototype.getNodeID = function(accessor) {
    return accessor;
}

ex.TreeWalker.prototype.getParent = function(accessor) {
    const parent = this.qAll[accessor].parent;
    return parent === null ? null : this.qAll[parent].node;
}

ex.TreeWalker.prototype.getParentKey = function(accessor) {
    return this.qAll[accessor].parentKey;
}

ex.TreeWalker.prototype.getPath = function(accessor) {
    let accessorNode = this.qAll[accessor];
    let d = new Deque();
    while (accessorNode !== null) {
        d.pushLeft(accessorNode.parentKey);
        accessorNode = accessorNode.parent === null ? null : this.qAll[accessorNode.parent];
    }
    return d;
};

ex.TreeWalker.prototype.getAncestors = function(accessor) {
    let accessorNode = this.qAll[accessor];
    let d = new Deque();
    while (accessorNode !== null) {
        d.pushLeft(accessorNode.node);
        accessorNode = accessorNode.parent === null ? null : this.qAll[accessorNode.parent];
    }
    return d;
}

ex.toLisp = function(ast) {
    const tokens = [];

    const walker = new ex.TreeWalker(ast, Order.DFSBoth);

    for (const accessor of walker) {
        const node = walker.getNode(accessor);
        const order = walker.getOrder(accessor);
        if (order === Order.DFSPreOrder) {
            const lastToken = tokens[tokens.length - 1];
            if (lastToken == ')') {
                tokens.push(" ");
            }
            tokens.push("(");
            tokens.push(node.type);
            tokens.push(" ");
            // tokens.push(node.type);
            if (node.type === 'Literal') {
                tokens.push(node.value);
            }
            if (node.type === 'Identifier') {
                tokens.push(node.value);
            }
        }
        if (order === Order.DFSPostOrder) {
            tokens.push(")");
        }
    }

    return tokens.join('');
}

// majaho.getPath(accessor);