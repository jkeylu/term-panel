
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits;

/**
 * Expose `Item`.
 */

module.exports = Item;


function Item(obj) {
  this.tag = obj;
  this.parent = null;

  this._refPoint = { x: 0, y: 0 };
  this._forced = false;
  this._width = -1;
  this._height = 1;
  this._actualWidth = -1;
  this._forcedItem = null;
}

/**
 * Inherit from `Eventemitter`.
 */

inherits(Item, EventEmitter);

Item.prototype.onKeypress = function (key) {};
Item.prototype.onForceChanged = function () {};
Item.prototype.onKeyUp = function () {};
Item.prototype.onKeyDown = function () {};
Item.prototype.onKeyLeft = function () {};
Item.prototype.onKeyRight = function () {};
Item.prototype._draw = function () {};

Item.prototype.force = function () {
  if (!this._forced) {
    this._forced = true;
    this.parent && this.parent._updateForcedItem(this);
    this.onForceChanged(true);
  }
};

Item.prototype._updateForcedItem = function (item) {
  if (this._forcedItem && this._forcedItem != item) {
    this._forcedItem._forced = false;
    this._forcedItem.onForceChanged();
  }
  this._forcedItem = item;
  this.parent && this.parent._updateForcedItem(this);
};

Item.prototype.setWidth = function (width) {
  if (width < 0 || width == 'fill_parent') {
    this._width = -1;
    this._actualWidth = this.parent._actualWidth;

  } else {
    this._width = width;
    this._actualWidth = width;
  }
};

Item.prototype.setHeight = function (height) {
  this._height = height;
};