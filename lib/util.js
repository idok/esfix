'use strict';
var fs = require('fs');

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileSync(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

module.exports = {
    readFileSync: readFileSync
};