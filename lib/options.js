/**
 * @fileoverview Options configuration for optionator.
 * @author idok
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var optionator = require('optionator');

//------------------------------------------------------------------------------
// Initialization and Public Interface
//------------------------------------------------------------------------------

// exports 'parse(args)', 'generateHelp()', and 'generateHelpForOption(optionName)'
module.exports = optionator({
    prepend: 'usage: fixer <file/dir> [<args>]',
    concatRepeatedArrays: true,
    mergeRepeatedObjects: true,
    options: [
        {
            heading: 'Options'
        },
        {
            option: 'help',
            alias: 'h',
            type: 'Boolean',
            description: 'Show help.'
        },
        {
            option: 'color',
            alias: 'c',
            default: '',
            type: 'Boolean',
            description: 'Use colors in output.'
        },
        {
            option: 'dry-run',
            alias: 'd',
            default: '',
            type: 'Boolean',
            description: 'Dry run.'
        },
        {
            option: 'version',
            alias: 'v',
            type: 'Boolean',
            description: 'Outputs the version number.'
        }
    ]
});
