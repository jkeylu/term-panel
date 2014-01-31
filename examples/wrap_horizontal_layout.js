var term = require('../')
  , Panel = term.Panel
  , List = term.List
  , Checkbox = term.Checkbox
  , panel, list, item, i, j;

panel = new Panel('wrap_horizontal');
panel.on('keypress', function (key) {
  if (key.name == 'c' && key.ctrl) {
    panel.hide();
    process.exit();
  }
});

for (i = 0; i < 4; i++) {
  list = new List();
  list.setWidth('auto');
  panel.addItem(list);

  for (j = 0; j < 40; j++) {
    item = new Checkbox('L' + i + '-I' + j);
    list.addItem(item);
  }
}

panel.show();
