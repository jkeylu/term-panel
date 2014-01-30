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

var list, item, i;

list = new List();
list.setWidth(15);
panel.addItem(list);
for (i = 0; i < 40; i ++) {
  var item = new Checkbox('L1-Item-' + i);
  list.addItem(item);
}


list = new List();
list.setWidth(15);
panel.addItem(list);
for (i = 0; i < 40; i ++) {
  var item = new Checkbox('L2-Item-' + i);
  list.addItem(item);
}

panel.show();
