'use strict';
describe('fix quotes', function () {
    var path = require('path');
    var testData = path.resolve(__dirname, '..', 'testData');
    var _ = require('lodash');
    var fs = require('fs');
    var quotesFixer = require('../../lib/quotes-fixer');
    var util = require('../../lib/util');

//    var context = require('../../lib/context');

    beforeEach(function () {
        require('chalk').enabled = false;
//        context.clear();
    });

    afterEach(function () {
    });

    it('should fix test-simple', function () {
        testFile('test-simple.js');
    });

    xit('should fix test-simple2', function () {
        testFile('test-simple2.js');
    });

//    it('should fix test-simple3', function () {
//        testFile('test-simple3.js');
//    });

    it('should fix test-simple string', function () {
        var src = 'var x = "a"';
        var actual = quotesFixer.processFileString({}, src);
        var expected = "var x = 'a'";
        expect(actual).toEqual(expected);
    });

    it('should fix test-simple string with CRLF', function () {
        var src = '\r\nvar x = "a"';
        var actual = quotesFixer.processFileString({}, src);
        var expected = "\nvar x = 'a'";
        expect(actual).toEqual(expected);
    });

    function testFile(name) {
        var src = util.readFileSync(path.join(testData, 'source', name));
        var actual = quotesFixer.processFileString({}, src);
        var expected = util.readFileSync(path.join(testData, 'expected', name));
//        expect(actual).toEqual(expected);
        compareStrings(actual, expected);
    }

    function compareStrings(a, b) {
        if (a.length !== b.length) {
            console.log('length differ');
        }
        var aLines = a.split();
        var bLines = b.split();
        for (var i = 0; i < aLines.length; i++) {
            expect(aLines[i]).toEqual(bLines[i]);
        }
    }
});