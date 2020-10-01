const util = require('util');
const assert = require('assert');

const ApproxValue = require('../approx-value.js');

let baz = new ApproxValue(10, 2);

console.log({baz});
console.log(util.inspect(baz, false, 2, true));