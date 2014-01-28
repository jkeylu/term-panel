
/**
 * Module dependencies.
 */

var inherits = require('util').inherits
  , Item = require('./item')
  , util = require('./util')
  , charm = util.charm;

/**
 * Expose `List`.
 */

module.exports = List;

function List() {
  List.super_.call(this);

  this._width = 'auto';
  this._actualWidth = 0;
  this._items = [];
  this._refPoint = { x: 0, y: 0 };
  this._forced = false;
}

/**
 * Inherit from `Item`.
 */

inherits(List, Item);

List.prototype.addItem = function (item) {
  item.parent = this;
  this._items.push(item);
};

List.prototype.setWidth = function (width) {
  this._width = width;
};

List.prototype.onKeyUp = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        this._items[0].force();
      }
    } else if (index > 0) {
      if (!this._forcedItem.onKeyUp()) {
        this._items[index - 1].force();
      }
    }

  } else {
    if (this._items.length > 0) {
      this._items[0].force();
    }
  }
};

List.prototype.onKeyDown = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        this._items[0].force();
      }
    } else if (index < this._items.length - 1) {
      if (!this._forcedItem.onKeyDown()) {
        this._items[index + 1].force();
      }
    }
    
  } else {
    if (this._items.length > 0) {
      this._items[0].force();
    }
  }
};

List.prototype._draw = function () {
  var p = { x: this._refPoint.x, y: this._refPoint.y };

  for (var i = 0, l = this._items.length; i < l; i++) {
    var item = this._items[i];
    item._width = this._actualWidth;
    item._refPoint = p;
    item._draw();
    p = { x: p.x, y: p.y + item._height };
  }
};

List.prototype.onKeypress = function (key) {
  if (this._forced) {
    for (var i = 0, l = this._items.length; i < l; i++) {
      this._items[i].onKeypress(key);
    }
  }
};

List.prototype.onForceChanged = function () {
  if (this._forced) {
    if (this._forcedItem) {
      this._forcedItem._forced = true;
      this._forcedItem.onForceChanged();

    } else if (this._items.length > 0) {
      this._items[0].force();
    }

  } else {
    if (this._forcedItem) {
      this._forcedItem._forced = false;
      this._forcedItem.onForceChanged();
    }
  }
};
