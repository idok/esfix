'use strict';

var fs = require('fs');
//var path = require('path');
//var getArguments = require('./getArguments');
//var packagesUtils = require('./packagesUtils');
//var glob = require('glob');
//var mkdirp = require('mkdirp');
var recast = require('recast');
//var recast = require('recast');
//require("ast-types").visit
var types = recast.types;
var traverse = types.traverse;
var visit = types.visit;
var n = types.namedTypes;
var b = types.builders;
var util = require('util');

/**
 *
 * @param {{base: string, sourceMain: string, report: function(string)}} context
 * @param {string} source
 * @param {string} target
 */
//function run(context, source, target) {
//    stats.changes = 0;
////    console.log('inside run ' + source + ' -> ' + target);
////    console.log('process.cwd() ' + process.cwd());
//    var project = process.cwd();
////    console.log('inside run ' + glob.sync('packages/**/*.js', {cwd: project}));
//
//    //node node_modules/grunt-packages/tasks/bin/packages.js mv core/components/kokoRenderer core/utils/koko
//
//    var sourceIsPackage = source.indexOf('/') === -1;
//    var targetIsPackage = target.indexOf('/') === -1;
//
//    if (sourceIsPackage !== targetIsPackage) {
//        throw new Error(util.format('ERROR: unsupported operation. source is a %s and target is a %s', whatIsIt(sourceIsPackage), whatIsIt(targetIsPackage)));
//    }
//
//    // do physical mv
//    var pkgRoot = packagesUtils.getPackagesRoot(context.cwd, project);
//    var oldPath = packagesUtils.getModulePath(pkgRoot, source, context.sourceMain);
//
//    if (!fs.existsSync(oldPath)) {
//        throw new Error(util.format('ERROR: Invalid source module id. Module %s with file %s could not be found.', source, oldPath));
//    }
//
//    var newPath = packagesUtils.getModulePath(pkgRoot, target, context.sourceMain);
//    context.report(util.format('moving %s -> %s', oldPath, newPath));
//    // create the new path
//    var newDir = path.dirname(newPath);
//    mkdirp.sync(newDir);
//    fs.renameSync(oldPath, newPath);
//
//    // TODO if old path parent dir if empty
////    var oldDir = path.dirname(oldPath);
////    if (oldDir.lis)
//
//    // TODO find out which files we want to process
//    var files = glob.sync('packages/**/*.js', {cwd: project});
//
//    files.forEach(function (f) {
//        processFile(context, f, source, target);
//    });
//
//    context.report(util.format('processed %s files', stats.changes));
//}

/**
 * @param {{base: string, sourceMain: string, report: function(string)}} context
 * @param {string} file
 * @param target
 */
function processFile(context, file, target) {
    var changed = false;
    //require("ast-types").traverse deprecated Please use require("ast-types").visit instead of .traverse for syntax tree manipulation lib/fixer.js:88:5
    console.log('processing ' + file);

    var src = fs.readFileSync(file);
    var ast = recast.parse(src);

    // TODO check how make recast keep quotes style
    visit(ast, function (node) {
        if (node.type === 'Literal') {
//            if (node.raw[0])
            console.log('processing ' + node.raw);
            node.raw = node.raw.replace(/^"([^"]*)"$/mg, "'$1'");
            console.log('processing ' + node.raw);
        }
    });

//    if (changed) {
//        context.report('processing ' + file);
//        stats.changes++;
    var newSource = recast.print(ast).code;
    console.log(newSource);
    fs.writeFileSync(target, newSource);
//    }
}

/**
 * suggest a name for module argument.
 * e.g. my-package => myPackage
 * @param {string} moduleName
 * @return {string}
 */
function suggestName(moduleName) {
    var name = moduleName.split('/').pop();
//    var arr = name.split(/[\-_]/).map(function (i) {
//        return i[0].toUpperCase() + i.slice(1);
//    });
    var arr = name.split(/[\-]/);
//    console.dir(arr);
    for (var i = 0; i < arr.length; i++) {
        if (i !== 0) {
            arr[i] = capitalize(arr[i]);
        }
    }
    return arr.join('');
}

/**
 * make the first letter upper case
 * @param {string} text
 * @return {string}
 */
function capitalize(text) {
    return text[0].toUpperCase() + text.slice(1);
}

//module.exports = {
//    run: run,
//    suggestName: suggestName
//};

processFile({}, '/Users/idok/Projects/grunt-packages/lib/testData/source/test-simple.js', '/Users/idok/Projects/grunt-packages/lib/testData/target/test-simple.js');