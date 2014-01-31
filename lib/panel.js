
/**
 * Module dependencies.
 */

var inherits = require('util').inherits
  , keypress = require('keypress')
  , List = require('./list')
  , charm = require('./util').charm;

/**
 * Stdin and stdout.
 */

var stdin = process.stdin
  , stdout = process.stdout;
keypress(stdin);

/**
 * Expose `Panel`
 */

module.exports = Panel;

function Panel(layout) {
  Panel.super_.call(this);

  this.onKeypress = this.onKeypress.bind(this);
  this.onResize = this.onResize.bind(this);

  this._actualWidth = this._width = stdout.columns;
  this._height = stdout.rows;

  if (layout != 'wrap_horizontal' && layout != 'scrollable_horizontal') {
    throw new Error("'" + layout + "' is not one of 'wrap_horizontal' or 'scrollable_horizontal'.");
  }
  this._layout = layout;

  if (layout == 'wrap_horizontal') {
    this._statistics = {
      fixed: { sum: 0 },
      auto: { count: 0 },
      percent: { sum: 0 }
    };
  }
}

/**
 * Inherit from `Item`.
 */

inherits(Panel, List);

Panel.KEY_OF_UP = 'up';
Panel.KEY_OF_DOWN = 'down';
Panel.KEY_OF_LEFT = 'left';
Panel.KEY_OF_RIGHT = 'right';

/**
 * Add an item.
 *
 * @api public
 */

Panel.prototype.addItem = function (item) {
  if (this._layout == 'wrap_horizontal') {
    if (typeof item._width == 'number') {
      this._statistics.fixed.sum += item._width;
    } else if (item._width == 'auto') {
      this._statistics.auto.count++;
    } else if (item._width.substr(-1) == '%') {
      this._statistics.percent.sum += parseInt(item._width.slice(0, -1));
    } else {
      throw new Error('Syntax error: List width.');
    }

  } else if (this._layout == 'scrollable_horizontal') {
    if (typeof item._width != 'number') {
      throw new Error("In scrollable_horizontal layout, child item's width must fixed.");
    }
  }

  Panel.super_.prototype.addItem.call(this, item);
};

/**
 * On key up.
 *
 * @api public
 */

Panel.prototype.onKeyUp = function () {
  if (this._forcedItem) {
    this._forcedItem.onKeyUp();
  } else {
    if (this._items.length > 0) {
      this._items[0].force();
    }
  }
};

/**
 * On key down.
 *
 * @api public
 */

Panel.prototype.onKeyDown = function () {
  if (this._forcedItem) {
    this._forcedItem.onKeyDown();
  } else {
    if (this._items.length > 0) {
      this._items[0].force();
    }
  }
};

/**
 * On key left.
 *
 * @api public
 */

Panel.prototype.onKeyLeft = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        if (this._layout == 'wrap_horizontal') {
          this._items[0].force();
        } else if (this._layout == 'scrollable_horizontal') {
          this._items[this._drawingRange[0]].force();
        }
      }
    } else if (index > 0) {
      if (!this._forcedItem.onKeyLeft()) {
        if (this._layout == 'scrollable_horizontal'
           && index - 1 < this._drawingRange[0]) {
          this.scroll(-1);
        }
        this._items[index - 1].force();
      }
    }

  } else {
    if (this._items.length > 0) {
      if (this._layout == 'wrap_horizontal') {
        this._items[0].force();
      } else if (this._layout == 'scrollable_horizontal') {
        this._items[this._drawingRange[0]].force();
      }
    }
  }
};

/**
 * On key right.
 *
 * @api public
 */

Panel.prototype.onKeyRight = function () {
  if (this._forcedItem) {
    var index = this._items.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._items.length > 0) {
        if (this._layout == 'wrap_horizontal') {
          this._items[0].force();
        } else if (this._layout == 'scrollable_horizontal') {
          this._items[this._drawingRange[0]].force();
        }
      }
    } else if (index < this._items.length - 1) {
      if (!this._forcedItem.onKeyRight()) {
        if (this._layout == 'scrollable_horizontal'
           && index + 1 > this._drawingRange[1]) {
          this.scroll(1);
        }
      }
      this._items[index + 1].force();
    }
    
  } else {
    if (this._items.length > 0) {
      if (this._layout == 'wrap_horizontal') {
        this._items[0].force();
      } else if (this._layout == 'scrollable_horizontal') {
        this._items[this._drawingRange[0]].force();
      }
    }
  }
};

/**
 * On key press.
 *
 * @api public
 */

Panel.prototype.onKeypress = function (ch, key) {
  if (!key) return;

  this.emit('keypress', key);

  switch (key.name) {
    case Panel.KEY_OF_UP:
      this.onKeyUp();
      break;

    case Panel.KEY_OF_DOWN:
      this.onKeyDown();
      break;

    case Panel.KEY_OF_LEFT:
      this.onKeyLeft();
      break;

    case Panel.KEY_OF_RIGHT:
      this.onKeyRight();
      break;

    case 'c':
      key.ctrl && this.hide();
      break;
    
    default:
      break;
  }

  for (var i = 0, l = this._items.length; i < l; i ++) {
    this._items[i].onKeypress(key);
  }
};

/**
 * On terminal resize.
 *
 * @api public
 */

Panel.prototype.onResize = function () {
  charm.reset();
  this._draw();
}

/**
 * Hide this panel.
 *
 * @api public
 */

Panel.prototype.hide = function () {
  charm.cursor(true);
  charm.reset();
  stdin.pause();
  stdin.removeListener('keypress', this.onKeypress);
};

/**
 * Show this panel.
 *
 * @api public
 */

Panel.prototype.show = function () {
  charm.reset();
  charm.cursor(false);
  stdin.on('keypress', this.onKeypress);
  stdin.setRawMode(true);
  stdin.resume();
  this._adjustItemsRefPoint();
  this._draw();
  stdout.on('resize', this.onResize)
};

/**
 * Scroll page.
 *
 * If direction less than zero, then scroll up.
 * If direction greater than zero, then scroll down.
 *
 * @api public
 */

Panel.prototype.scroll = function (direction) {
  if (this._layout == 'wrap_horizontal') {
    return;
  }

  Panel.super_.prototype.scroll.call(this, direction);
};

/**
 * Adjust items reference point and width.
 *
 * @param {Number} start
 * @api private
 */

Panel.prototype._adjustItemsRefPoint = function (start) {
  var x = this._refPoint.x
    , y = this._refPoint.y
    , p = { x: x, y: y }
    , maxX = this._refPoint.x + this._width - 1
    , item, i, l, avg;

  if (this._layout == 'wrap_horizontal') {
    if (this._statistics.auto.count > 0) {
      avg = Math.floor((this._actualWidth - this._statistics.fixed.sum)
                       / this._statistics.auto.count);
    }

    for (i = 0, l = this._items.length; i < l; i++) {
      item = this._items[i];
      item._height = this._height;
      item._refPoint = p;

      if (item._width == 'auto') {
        item._actualWidth = avg;

      } else if (typeof item._width == 'number') {
        item._actualWidth = item._width;

      } else if (typeof item._width == 'string') {
        if (item._width.substr(-1) == '%') {
          percent = parseInt(item._width.slice(0, -1));
          width = Math.floor(this._actualWidth * percent / 100);
          item._actualWidth = width;
        } else {
          item._actualWidth = parseInt(item._width);
        }
      }

      x = p.x + item._actualWidth;
      p = { x: x, y: y };
    }

  } else if (this._layout == 'scrollable_horizontal') {
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
        item = this._items[start - 1]
        x = item._refPoint.x + item._actualWidth;
      }
    }

    for (i = start, l = this._items.length; i < l; i++) {
      item = this._items[i];
      item._height = this._height;
      item._actualWidth = item._width;
      item._refPoint = p;

      x = p.x + item._actualWidth;

      if (x - 1 > maxX) {
        this._drawingRange[1] = i - 1;
        break;
      }

      p = { x: x, y: y };
    }

    if (i == this._items.length) {
      this._drawingRange[1] = i - 1;
    }
  }
};

/**
 * Draw this panel.
 *
 * @api private
 */

Panel.prototype._draw = function () {
  var i, l, args;
  for (i= 0, l = this._items.length; i < l; i++) {
    this._items[i]._adjustItemsRefPoint();
  }

  if (this._layout == 'wrap_horizontal') {
    for (var i = 0, l = this._items.length; i < l; i++) {
      this._items[i]._draw();
    }
  } else if (this._layout == 'scrollable_horizontal') {
    args = Array.prototype.slice.call(arguments);
    Panel.super_.prototype._draw.apply(this, args);
  }
};

/**
 * Erase this panel.
 *
 * @api private
 */

Panel.prototype._erase = function () {
  charm.position(this._width, this._height).erase('screen');
};
