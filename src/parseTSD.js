const ts = require('typescript');

function isPrimitive(val) {
    if (typeof val === 'object') {
        return val === null;
    }
    return typeof val !== 'function';
}

function getVisitor() {
    let nodeID = 0;

    const kindMap = {};
    for (const key in ts.SyntaxKind) {
        if (ts.SyntaxKind.hasOwnProperty(key)) {
            kindMap[ts.SyntaxKind[key]] = key;
        }
    }
    
    function translateKind(key) {
        return kindMap[key];
    }

    const ignore = ['pos', 'end', 'flags', 'nodeID', 'modifierFlagsCache', 'parent', 'flowNode'];

    const visitor = parent => node => {
        node.nodeID = nodeID++;
        const jsonNode = parent[node.nodeID] = {};
        ts.forEachChild(node, visitor(jsonNode));
        for (const key in node) {
            if (node.hasOwnProperty(key)) {
                if (ignore.indexOf(key) < 0) {
                    if (isPrimitive(node[key])) {
                        const value = key == 'kind' ? translateKind(node[key]) : node[key];
                        jsonNode[key] = value;
                    } else {
                        if (Array.isArray(node[key])) {
                            jsonNode[key] = [];
                            for (let i = 0; i < node[key].length; i++) {
                                jsonNode[key].push({
                                    '_ref': node[key][i].nodeID
                                });
                            }
                        } else {
                            jsonNode[key] = {
                                '_ref': node[key].nodeID
                            };
                        }
                    }
                }
                // console.log(key);
            }
        }
        // console.log(node);
    };

    return visitor;
}

module.exports = function(filename, options) {
    // const ROOT_NAME = 'root';
    // const node = new TSNode(ROOT_NAME);

    let program = ts.createProgram([filename], options);
    program.getTypeChecker();
    let sourceFiles = program.getSourceFiles();
    let sourceFile = sourceFiles[sourceFiles.length - 1];

    // for (const i in sourceFiles) {
    //     console.log(i, sourceFiles[i].path);
    // }

    const node = {};
    ts.forEachChild(sourceFile, getVisitor()(node));

    return node;
};