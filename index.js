'use strict';


//try {
//    var s = 'hello string\n  with "new" line';
////    var s = 'abc';
//    var out = replace(s, 20, 21, '#');
////    var out = replace(s, 1, 2, '#');
//    console.log(out);
//} catch (e) {
//    console.log('' + e);
//}

var quotesFixer = require('./lib/quotes-fixer');
//var src = '\r\nvar x = "a"';
//var src = '\r\n"a"';
var src = '\r\n\t"a"';
var actual = quotesFixer.processFileString({}, src);
console.log(actual);
//var expected = "\nvar x = 'a'";
//expect(actual).toEqual(expected);
