
/**
 * Module dependencies.
 */

var inherits = require('util').inherits
  , keypress = require('keypress')
  , Item = require('./item')
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

  this._lists = [];
  this._width = stdout.columns;
  this._height = stdout.rows;
  this._refPoint = { x: 0, y: 0 };
}

/**
 * Inherit from `Item`.
 */

inherits(Panel, Item);

Panel.KEY_OF_UP = 'up';
Panel.KEY_OF_DOWN = 'down';
Panel.KEY_OF_LEFT = 'left';
Panel.KEY_OF_RIGHT = 'right';

Panel.prototype.addList = function (list) {
  list.parent = this;
  this._lists.push(list);
};

Panel.prototype.onKeyUp = function () {
  if (this._forcedItem) {
    this._forcedItem.onKeyUp();
  } else {
    if (this._lists.length > 0) {
      this._lists[0].force();
    }
  }
};

Panel.prototype.onKeyDown = function () {
  if (this._forcedItem) {
    this._forcedItem.onKeyDown();
  } else {
    if (this._lists.length > 0) {
      this._lists[0].force();
    }
  }
};

Panel.prototype.onKeyLeft = function () {
  if (this._forcedItem) {
    var index = this._lists.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._lists.length > 0) {
        this._lists[0].force();
      }
    } else if (index > 0) {
      this._lists[index - 1].force();
    }

  } else {
    if (this._lists.length > 0) {
      this._lists[0].force();
    }
  }
};

Panel.prototype.onKeyRight = function () {
  if (this._forcedItem) {
    var index = this._lists.indexOf(this._forcedItem);
    if (index < 0) {
      if (this._lists.length > 0) {
        this._lists[0].force();
      }
    } else if (index < this._lists.length - 1) {
      this._lists[index + 1].force();
    }
    
  } else {
    if (this._lists.length > 0) {
      this._lists[0].force();
    }
  }
};

Panel.prototype.hide = function () {
  charm.reset();
  stdin.pause();
  stdin.removeListener('keypress', this.onKeypress);
};

Panel.prototype.show = function () {
  stdin.on('keypress', this.onKeypress);
  stdin.setRawMode(true);
  stdin.resume();
  this._draw();
  stdout.on('resize', this.onResize)
};

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

  for (var i = 0, l = this._lists.length; i < l; i ++) {
    this._lists[i].onKeypress(key);
  }
};

Panel.prototype.onResize = function () {
  charm.reset();
  this._draw();
};

Panel.prototype._draw = function () {
  var p = { x: this._refPoint.x, y: this._refPoint.y };

  this._adjustListWidth();

  for (var i = 0, l = this._lists.length; i < l; i++) {
    this._lists[i]._refPoint = p;
    this._lists[i]._draw();
    p = { x: p.x + this._lists[i]._actualWidth, y: p.y };
  }
};

Panel.prototype._adjustListWidth = function () {
  var autoListIDs = []
    , len = this._width
    , list, percent, width;

  for (var i = 0, l = this._lists.length; i < l; i ++) {
    list = this._lists[i];
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
      this._lists[autoListIDs[i]]._actualWidth = avg;
    }
  }
};
