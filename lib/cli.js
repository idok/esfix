#!/usr/bin/env node
'use strict';
var options = require('./options');

//packages/listsSettings/src/main/controllers/listsSettingsController.js
//processAll();
///Users/idok/Projects/santa-editor/packages/listsEditing/src/main/controller/controller.js
// node lib/fixer2.js /Users/idok/Projects/santa-editor/packages/listsEditing/src/main/controller/controller.js

function execute(args) {
    try {
        var currentOptions;
        var files;

        try {
            currentOptions = options.parse(args);
        } catch (error) {
            console.error(error.message);
            return 1;
        }

//    var rules = require('./rules');
//    console.log(rules);

        files = currentOptions._;

        if (currentOptions.version) { // version from package.json
            console.log('v' + require('../package.json').version);
        } else if (currentOptions.help || !files.length) {
            console.log(options.generateHelp());
        } else {
            // processFile({}, f, f);
            console.log('processing pattern: ' + files[0]);
            var quotesFixer = require('./quotes-fixer');
            quotesFixer.processAll(files[0], null, currentOptions);
            // var f = '/Users/idok/Projects/santa-editor/packages/listsEditing/src/main/model/menu.js';
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    execute: execute
};




