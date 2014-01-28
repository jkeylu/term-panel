var term = require('../')
  , Panel = term.Panel
  , List = term.List
  , Checkbox = term.Checkbox;

var panel = new Panel();
panel.on('keypress', function (key) {
  if (key.name == 'c' && key.ctrl) {
    process.exit();
  }
});


var list = new List();
list.setWidth(10);
var item = new Checkbox('Hello');
list.addItem(item);
item = new Checkbox('World', true);
list.addItem(item);
panel.addList(list);


list = new List();
list.setWidth(10);
item = new Checkbox('item1');
list.addItem(item);
item = new Checkbox('item2');
list.addItem(item);
item = new Checkbox('item3');
list.addItem(item);
panel.addList(list);

panel.show();
