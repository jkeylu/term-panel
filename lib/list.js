
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
  this._drawingRange = [-1, -1];
}

/**
 * Inherit from `Item`.
 */

inherits(List, Item);

/**
 * Add an item.
 *
 * @api public
 */

List.prototype.addItem = function (item) {
  item.parent = this;
  this._items.push(item);
};

/**
 * Set this list width.
 *
 * @api public
 */

List.prototype.setWidth = function (width) {
  this._width = width;
};

/**
 * On key up.
 *
 * @api public
 */

List.prototype.onKeyUp = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        this._items[this._drawingRange[0]].force();
      }

    } else if (index > 0) {
      if (!this._forcedItem.onKeyUp()) {
        if (index - 1 < this._drawingRange[0]) {
          this.scroll(-1);
        }
        this._items[index - 1].force();
      }
    }

  } else {
    if (this._items.length > 0) {
      this._items[this._drawingRange[0]].force();
    }
  }
};

/**
 * On key down.
 *
 * @api public
 */

List.prototype.onKeyDown = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        this._items[this._drawingRange[0]].force();
      }
    } else if (index < this._items.length - 1) {
      if (!this._forcedItem.onKeyDown()) {
        if (index + 1 > this._drawingRange[1]) {
          this.scroll(1);
        }
        this._items[index + 1].force();
      }
    }
    
  } else {
    if (this._items.length > 0) {
      this._items[this._drawingRange[0]].force();
    }
  }
};

/**
 * On key press.
 *
 * @api public
 */

List.prototype.onKeypress = function (key) {
  var i, l;
  if (this._forced) {
    for (i = 0, l = this._items.length; i < l; i++) {
      this._items[i].onKeypress(key);
    }
  }
};

/**
 * On force changed.
 *
 * @api public
 */

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

/**
 * Scroll page.
 *
 * If direction less than zero, then scroll up.
 * If direction greater then zero, then scroll down.
 *
 * @param {Number} direction
 * @api public
 */

List.prototype.scroll = function (direction) {
  if (direction < 0) {
    if (this._drawingRange[0] > 0) {
      this._erase();
      this._drawingRange[0] -= 1;
      this._adjustItemsRefPoint();
      this._draw();
    }
  } else if (direction > 0) {
    if (this._drawingRange[1] < this._items.length) {
      this._erase();
      this._drawingRange[0] += 1;
      this._adjustItemsRefPoint();
      this._draw();
    }
  }
};

/**
 * Adjust items reference point and width.
 *
 * @param {Number} start
 * @api private
 */

List.prototype._adjustItemsRefPoint = function (start) {
  var x = this._refPoint.x
    , y = this._refPoint.y
    , p = { x: x, y: y }
    , maxY = this._refPoint.y + this._height - 1
    , item, i, l;

  if (start == undefined) {
    if (this._drawingRange[0] == -1) {
      this._drawingRange[0] = 0;
      start = 0;

    } else {
      start = this._drawingRange[0];
    }

  } else {
    if (this._drawingRange[0] == -1 || this._drawingRange[0] > start) {
      this._drawingRange[0] = start;

    } else if (this._drawingRange[0] < start) {
      item = this._items[start - 1];
      y = item._refPoint.y + item._height;
    }
  }

  for (i = start, l = this._items.length; i < l; i++) {
    item = this._items[i];
    item.setWidth(this._actualWidth);
    item._refPoint = p;

    y = p.y + item._height;

    if (y - 1 > maxY) {
      this._drawingRange[1] = i - 1;
      break;
    }

    p = { x: x, y: y };
  }

  if (i == this._items.length) {
    this._drawingRange[1] = i - 1;
  }
};

/**
 * Draw this list.
 *
 * @api private
 */

List.prototype._draw = function () {
  var start = 0
    , end = 0
    , i;

  if (arguments.length == 0) {
    if (this._drawingRange[0] != -1 && this._drawingRange[1] != -1) {
      start = this._drawingRange[0];
      end = this._drawingRange[1];
    }

  } else if (arguments.length == 1) {
    start = arguments[0];
    end = this._drawingRange[1];

  } else if (arguments.length == 2) {
    start = arguments[0];
    end = arguments[1];
  }

  for (i = start; i <= end; i++) {
    this._items[i]._draw();
  }
}

/**
 * Erase this list.
 *
 * @api private
 */

List.prototype._erase = function () {
  var x = this._refPoint.x + 1
    , y = this._refPoint.y + 1
    , i, l;
  for (i = 0, l = this._height; i < l; i++) {
    charm.position(x, y + i).write(util.rptstr(' ', this._actualWidth));
  }
};
