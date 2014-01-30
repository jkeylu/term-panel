
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

function Panel() {
  Panel.super_.call(this);

  this.onKeypress = this.onKeypress.bind(this);
  this.onResize = this.onResize.bind(this);

  this._width = stdout.columns;
  this._height = stdout.rows;
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
        this._items[0].force();
      }
    } else if (index > 0) {
      this._items[index - 1].force();
    }

  } else {
    if (this._items.length > 0) {
      this._items[0].force();
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
        this._items[0].force();
      }
    } else if (index < this._items.length - 1) {
      this._items[index + 1].force();
    }
    
  } else {
    if (this._items.length > 0) {
      this._items[0].force();
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
  stdin.on('keypress', this.onKeypress);
  stdin.setRawMode(true);
  stdin.resume();
  this._draw();
  stdout.on('resize', this.onResize)
};

/**
 * Adjust items reference point and width.
 *
 * @param {Number} start
 * @api private
 */

Panel.prototype._adjustItemsRefPoint = function (start) {
  var autoListIDs = []
    , len = this._width
    , list, percent, width;

  for (var i = 0, l = this._items.length; i < l; i ++) {
    list = this._items[i];
    list._height = this._height;
    if (list._width == 'auto') {
      autoListIDs.push(i);
      continue;

    } else if (typeof list._width == 'number') {
      list._actualWidth = list._width;

    } else if (typeof list._width == 'string') {
      if (list._width.substr(-1) == '%') {
        percent = parseInt(list._width.slice(0, -1));
        width = Math.floor(this._width * percent / 100);
        list._actualWidth = width;

      } else {
        list._actualWidth = parseInt(list._width);
      }
    }
    len -= list._actualWidth;
  }
  if (autoListIDs.length > 0) {
    var avg = Math.floor(len / autoListIDs.length);
    for (var i = 0, l = autoListIDs.length; i < l; i++) {
      this._items[autoListIDs[i]]._actualWidth = avg;
    }
  }
};

/**
 * Draw this panel.
 *
 * @api private
 */

Panel.prototype._draw = function () {
  var p = { x: this._refPoint.x, y: this._refPoint.y };

  this._adjustItemsRefPoint();

  for (var i = 0, l = this._items.length; i < l; i++) {
    this._items[i]._refPoint = p;
    this._items[i]._adjustItemsRefPoint();
    this._items[i]._draw();
    p = { x: p.x + this._items[i]._actualWidth, y: p.y };
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
