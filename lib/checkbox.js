
/**
 * Module dependencies.
 */

var Item = require('./item')
  , util = require('./util')
  , charm = util.charm
  , inherits = require('util').inherits;

/**
 * Expose `Checkbox`.
 */

module.exports = Checkbox;


function Checkbox(text, checked) {
  Checkbox.super_.call(this, text);

  this.checkedSign = '■';
  this.leftSign = '[';
  this.rightSign = ']';

  this._width = 3;
  this._hasDrawn = false;
  this._checked = checked ? true : false;
  if (typeof text == 'string') {
    this._text = text;
  } else {
    this._text = text.text;
  }
}

/**
 * Inherit from `Item`.
 */

inherits(Checkbox, Item);

Checkbox.DOT = '●';
Checkbox.SQUARE = '■';
Checkbox.HEART = '❤';
Checkbox.KEY_OF_CHANGEING_CHECKED = 'space';

/**
 * Set checkbox text.
 *
 * @api public
 */

Checkbox.prototype.setText = function (text) {
  this._text = text;
}

/**
 * Get this checkbox checked state.
 *
 * @api public
 */

Checkbox.prototype.isChecked = function () {
  return this._checked;
};

/**
 * Change this checkbox checked state.
 *
 * @param {Boolean} b
 * @api public
 */

Checkbox.prototype.check = function (b) {
  b = (b === false) ? false : true;

  if (this._checked != b) {
    this._checked = b;

    charm.position(this._refPoint.x + 1 + 1, this._refPoint.y + 1)
      .write(this._checked ? this.checkedSign : ' ');

    this.emit('checkedChanged', this);
  }
};

/**
 * On key press.
 *
 * @param {Object} key
 * @api public
 */

Checkbox.prototype.onKeypress = function (key) {
  if (this._forced && key.name == Checkbox.KEY_OF_CHANGEING_CHECKED) {
    this.check(!this._checked);
  }
};

/**
 * On force changed.
 *
 * @api public
 */

Checkbox.prototype.onForceChanged = function () {
  charm.position(this._refPoint.x + 1, this._refPoint.y + 1)
    .write(this._forced ? this.leftSign : ' ')
    .right()
    .write(this._forced ? this.rightSign : ' ');
};

/**
 * Draw this checkbox.
 *
 * @api private
 */

Checkbox.prototype._draw = function () {
  var ref = this._refPoint;

  charm.position(ref.x + 1, ref.y + 1)
    .write(this._forced ? this.leftSign : ' ')
    .right()
    .write(this._forced ? this.rightSign : ' ');

  charm.position(ref.x + 1 + 1, ref.y + 1)
    .write(this._checked ? this.checkedSign : ' ');

  charm.position(ref.x + 1 + 3, ref.y + 1)
    .write(util.substr(this._text, 0, this._width - 3));
};

/**
 * Erase this checkbox.
 *
 * @api private
 */

Checkbox.prototype._erase = function () {
  charm.position(this._refPoint + 1, this._refPoint + 1)
    .write(util.rptstr(' ', this._actualWidth));
};
