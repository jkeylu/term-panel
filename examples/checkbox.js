var term = require('../')
  , Panel = term.Panel
  , List = term.List
  , Checkbox = term.Checkbox
  , panel, list, item, i;

panel = new Panel('wrap_horizontal');
panel.on('keypress', function (key) {
  if (key.name == 'c' && key.ctrl) {
    panel.hide();
    process.exit();
  }
});

list = new List();
list.setWidth(15);
panel.addItem(list);

for (i = 0; i < 4; i++) {
  item = new Checkbox('It is very long. So long, So long. ' + i);
  list.addItem(item);
}

panel.show();
