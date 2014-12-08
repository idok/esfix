'use strict';
var fs = require('fs');
var recast = require('recast');
var types = recast.types;
//var n = types.namedTypes;
var b = types.builders;
//var visit = recast.visit;
var glob = require('glob');

//recast.types.namedTypes

function visitLoop(loop) {
    loop.body = fix(loop.body);
    this.genericVisit(loop);
}

function fix(clause) {
    if (clause) {
        if (clause.type !== Syntax.BlockStatement) {
            clause = b.blockStatement([clause]);
        }
    }
    return clause;
}

function fixLiteral(node) {
    console.log('processing ' + node.raw);
    var updated = node.raw.replace(/^"([^"]*)"$/mg, "'$1'");
//    node.raw = node.raw.replace(/^"([^"]*)"$/mg, "'$1'");
    console.log('processing ' + updated);
    updated = "'koko'";
//    return b.literal(updated);
    return b.breakStatement();
//    return node;
}

//require('recast').run(function (ast, callback) {
//    callback(new Orthodontist().visit(ast));
//});

//transformer(parse(code, options), function(node) {
//    writeback(print(node, options).code);
//});

var QUOTE_SETTINGS = {
    double: {
        quote: '"',
        alternateQuote: "'",
        description: 'doublequote'
    },
    single: {
        quote: "'",
        alternateQuote: '"',
        description: 'singlequote'
    }
};

/**
 * Validate that a string passed in is surrounded by the specified character
 * @param  {string} val The text to check.
 * @param  {string} character The character to see if it's surrounded by.
 * @returns {boolean} True if the text is surrounded by the character, false if not.
 */
function isSurroundedBy(val, character) {
    return val[0] === character && val[val.length - 1] === character;
}

function isValid(val, settings, avoidEscape) {
    var result = isSurroundedBy(val, settings.quote);
    if (!result && avoidEscape) {
        result = isSurroundedBy(val, settings.alternateQuote) && val.indexOf(settings.quote) >= 0;
    }
    return result;
}

function checkIsValid(val) {
    return isValid(val, QUOTE_SETTINGS.single, true);
}

function flip(val) {
    //'"aaa"'.replace(/(^['"]|['"]$)$/mg, "\"");
    return QUOTE_SETTINGS.single.quote + val.substring(1, val.length - 1) + QUOTE_SETTINGS.single.quote;
}

function replaceWith(input, start, end, replaceText) {
    var a = input.slice(0, start);
    var c = input.slice(end);
    return a + replaceText + c;
}

/**
 * @param context
 * @param {string} src
 * @return {string}
 */
function processFileString(context, src) {
    src = src.replace(/\r\n/g, '\n');
    var ast = recast.parse(src, {range: true});

    var lits = [];

    recast.visit(ast, {
        visitLiteral: function (path) {
            var node = path.value;
//            if (typeof node.value === 'string' && /^"([^"^']*)"$/mg.test(node.raw)) {
//                var lit = node.raw.replace(/^"([^"^']*)"$/mg, "'$1'");
//                lits.push({start: node.range[0], end: node.range[1], replaceText: lit});
//            }
            if (typeof node.value === 'string' && !checkIsValid(node.raw)) {
                var lit = flip(node.raw);
                lits.push({start: node.range[0], end: node.range[1], replaceText: lit});
            }
//            this.visitor.names.push(node.name);
//            node.value = 'asdasd';
//            path.value = fixLiteral(node);
//            node.original = b.literal('updated');
//            path.value = b.literal('updated');
//            path.value.raw = "'aa'";
//            path.value.value = '"a"';
            this.traverse(path);
        }
    });

    lits = lits.reverse();
    var sourceCode = src.toString();
    lits.forEach(function (i) {
//        var pre = sourceCode.substring(0, i.start + 1);
//        var post = sourceCode.substring(i.end + 1);
////        console.log(pre);
////        console.log(post);
        console.log(i.start + ', ' + i.end);
//        sourceCode = pre + i.replaceText + post;
        sourceCode = replaceWith(sourceCode, i.start, i.end, i.replaceText);
    });

//    if (currentOptions.dryRun) {
//        console.log('-----------------------------------');
//        console.log(sourceCode);
//        console.log('-----------------------------------');
//    } else {
//        fs.writeFileSync(target, sourceCode);
//    }

//    recast.visit(ast, visitor);
//    var newSource = recast.print(ast).code;
//    console.log('-----------------------------------');
//    console.log(newSource);
//    console.log('-----------------------------------');
    if (lits.length > 0) {
        return sourceCode;
    }
    return null;
}

function processFile(context, file, target, currentOptions) {
    var util = require('./util');
    var src = util.readFileSync(file);
    var sourceCode = processFileString(context, src);

    if (currentOptions.dryRun) {
        console.log('-----------------------------------');
        console.log(sourceCode);
        console.log('-----------------------------------');
    } else if (sourceCode) {
        fs.writeFileSync(target, sourceCode);
        console.log('wrote file');
    } else {
        console.log('no changes in file ' + file);
    }

//    recast.visit(ast, visitor);
//    var newSource = recast.print(ast).code;
//    console.log('-----------------------------------');
//    console.log(newSource);
//    console.log('-----------------------------------');
}

//processFile({}, '/Users/idok/Projects/grunt-packages/lib/testData/source/test-simple.js', '/Users/idok/Projects/grunt-packages/lib/testData/target/test-simple.js');
function processAll(pattern, cwd, currentOptions) {
    var files = glob.sync(pattern);

//    var files = glob.sync(pattern, {cwd: cwd});

    files.forEach(function (f) {
        console.log('processing file: ' + f);
        processFile({}, f, f, currentOptions);
    });
}

//packages/listsSettings/src/main/controllers/listsSettingsController.js
//processAll();
///Users/idok/Projects/santa-editor/packages/listsEditing/src/main/controller/controller.js
// node lib/fixer2.js /Users/idok/Projects/santa-editor/packages/listsEditing/src/main/controller/controller.js

module.exports = {
    processAll: processAll,
    processFile: processFile,
    processFileString: processFileString
};