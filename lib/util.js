
/**
 * Module dependencies.
 */

var Charm = require('charm').Charm;

var charm = new Charm();
charm.pipe(process.stdout);
exports.charm = charm;

exports.len = function (str) {
  var l = str.length
    , m = str.match(/[^\x00-\xff]/g);

  if (m) {
    l += m.length;
  }
  return l;
};

exports.substr = function (str, start, length) {
  var str = str.substr(start)
    , tmp = '';

  for (var i = 0, l = str.length; i < l; i++) {
    length--;
    if (/[^\x00-\xff]/.test(str[i])) {
      length--;
    }
    if (length >= 0) {
      tmp += str[i];
    }
  }
  return tmp;
};

exports.rptstr = function (str, n) {
  return Array.prototype.join.call({ length: n + 1 }, str);
};

function Point(x, y) {
  this.x = x;
  this.y = y;
}
exports.Point = Point;
