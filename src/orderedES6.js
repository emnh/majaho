// const fs = require('fs');

const es6 = require('./data/es6.json');

function resolveProps(es6, cls) {
    const props = [];
    // console.log("resolving", cls);
    // Resolve properties
    for (const prop in es6[cls].props) {
        if (prop !== 'type') {
            props.push(prop);    
        }
    }
    
    // Resolve base properties
    if (es6[cls].base !== undefined) {
        for (const base of es6[cls].base) {
            if (base === 'Node') {
                continue;
            }
            // console.log("base", base);
            const baseProps = resolveProps(es6, base);
            for (const prop of baseProps) {
                props.push(prop);
            }
        }
    }
    return props;
}

module.exports.resolveClasses = function() {
    // const es6 = JSON.parse(fs.readFileSync('src/data/es6.json', 'utf8'));
    const classProps = {};
    for (const cls in es6) {
        classProps[cls] = resolveProps(es6, cls);
        // console.log("cls", cls, classProps[cls]);
    }
    // console.log(JSON.stringify(classProps, null, 2));
    return classProps;
}

module.exports.resolveClasses();