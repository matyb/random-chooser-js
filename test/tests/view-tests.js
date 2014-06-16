var $, equal, module, ok, randomChooser, jQuery, test;
$(document).ready(function(){
  module("View");
  test("redrawLists - draws list for each name in array", 2, function() {
    var lists = $('#lists');
    lists.constructor.prototype.listview = function(refresh) {};
    equal( lists.children().length, 0);
    randomChooser.createView().redrawLists(['1','2']);
    equal( lists.children().length, 2);
  });
  test("redrawLists - erases list first", 2, function() {
    var lists = $('#lists');
    lists.constructor.prototype.listview = function(refresh) {
      equal(lists.children().length, 0);
      lists.constructor.prototype.listview = function(refresh) {
        equal(lists.children().length, 2);
      };
    };
    randomChooser.createView().redrawLists(['1','2']);
  });
  test("addList - adds a line/list item", 2, function() {
    var lists = $('#lists'), child;
    lists.empty();
    equal( lists.children().length, 0);
    randomChooser.createView().addList('1'); 
    equal( lists.children().length, 1);
  });
  test("addList - line/list item has identity of the passed in name", 2, function() {
    var lists = $('#lists'), child;
    lists.empty();
    randomChooser.createView().addList('1'); 
    child = lists.children()[0];
    equal(child.nodeName, "LI");
    equal(child.textContent, "1Delete List");
  });
  test("addList - adds 2 anchors", 3, function() {
    var lists = $('#lists'), anchors;
    lists.empty();
    randomChooser.createView().addList('1'); 
    anchors = lists.children()[0].childNodes;
    equal( anchors.length, 2);
    equal( anchors[0].nodeName, 'A');
    equal( anchors[1].nodeName, 'A');
  });
  test("addList - first anchor views when clicked", 2, function() {
    var lists = $('#lists'), viewAnchor;
    lists.empty();
    randomChooser.createView().addList('1', function(){
      throw "Should not have tried to delete";
    }, function() {
      ok(true);
    }); 
    viewAnchor = lists.children()[0].childNodes[0];
    equal( viewAnchor.text, '1');
    viewAnchor.onclick();
  });
  test("addList - second anchor asks to delete when clicked", 2, function() {
    var lists = $('#lists'), deleteAnchor;
    lists.empty();
    randomChooser.createView().addList('1', function(){
      ok(true);
    }, function() {
      throw "Should not have tried to view";
    });  
    deleteAnchor = lists.children()[0].childNodes[1];
    equal( deleteAnchor.text, 'Delete List');
    deleteAnchor.onclick();
  });
  test("addItem - adds a line/list item", 2, function() {
    var listItems = $('#listItems'), child;
    listItems.empty();
    equal( listItems.children().length, 0);
    randomChooser.createView().addItem('1'); 
    equal( listItems.children().length, 1);
  });
  test("addItem - line/list item has identity of the passed in name", 2, function() {
    var listItems = $('#listItems'), child;
    listItems.empty();
    randomChooser.createView().addItem('1'); 
    child = listItems.children()[0];
    equal(child.nodeName, "LI");
    equal(child.textContent, "1Delete Item");
  });
  test("addItem - adds 2 anchors", 3, function() {
    var listItems = $('#listItems'), anchors;
    listItems.empty();
    randomChooser.createView().addItem('1'); 
    anchors = listItems.children()[0].childNodes;
    equal( anchors.length, 2);
    equal( anchors[0].nodeName, 'A');
    equal( anchors[1].nodeName, 'A');
  });
  test("addItem - first anchor has identity of item", 1, function() {
    var listItems = $('#listItems'), textAnchor;
    listItems.empty();
    randomChooser.createView().addItem('1'); 
    textAnchor = listItems.children()[0].childNodes[0];
    equal( textAnchor.text, '1');
  });
  test("addItem - second anchor asks to delete when clicked", 2, function() {
    var listItems = $('#listItems'), deleteAnchor;
    listItems.empty();
    randomChooser.createView().addItem('1', function() {
      ok(true);
    }); 
    deleteAnchor = listItems.children()[0].childNodes[1];
    equal( deleteAnchor.text, 'Delete Item');
    deleteAnchor.onclick();
  });
  test("drawList - sets list name as title", 1, function() {
    var listNameLabel = $('.listNameLabel');
    $('#listItems').constructor.prototype.listview = function(refresh) {};
    listNameLabel.text('');
    randomChooser.createView().drawList('1', []);
    ok($('.listNameLabel:contains("list: 1")'));
  });
  test("drawList - draws item for each name in array", 2, function() {
    var list = $('#listItems');
    list.constructor.prototype.listview = function(refresh) {};
    equal( list.children().length, 0);
    randomChooser.createView().drawList('1', ['1','2']);
    equal( list.children().length, 2);
  });
  test("drawList - erases list first", 2, function() {
    var list = $('#listItems');
    list.constructor.prototype.listview = function(refresh) {
      equal(list.children().length, 0);
      list.constructor.prototype.listview = function(refresh) {
        equal(list.children().length, 2);
      };
    };
    randomChooser.createView().drawList('1', ['1','2']);
  });
  test("setRandomDisabled - disabled == true", 2, function() {
    var random = $('#random');
    random.removeClass('ui-disabled');
    equal( random.hasClass('ui-disabled'), false);
    randomChooser.createView().setRandomDisabled(true);
    ok( random.hasClass('ui-disabled'));
  });
  test("setRandomDisabled - disabled == false", 2, function() {
    var random = $('#random');
    random.addClass('ui-disabled');
    ok( random.hasClass('ui-disabled'));
    randomChooser.createView().setRandomDisabled(false);
    equal(random.hasClass('ui-disabled'), false);
  });
  test("displayItem - sets item name)", 2, function() {
    var itemNameLabel = $('#itemNameLabel'), itemName = 'meh';
    itemNameLabel.text("");
    equal("", itemNameLabel.text());
    randomChooser.createView().displayItem(itemName);
    equal(itemName, itemNameLabel.text());
  });
  test("askToDelete - click handler deletes list", 2, function() {
    var deleteList = $('#delete'), invoked = false;
    $('#deletePage').constructor.prototype.dialog = function(){};
    randomChooser.createView().askToDelete('meh', function() {
      invoked = true;
    });
    ok(!invoked);
    $('#delete').click();
    ok(invoked);
  });
  test("askToDelete - enter invokes click handler", 1, function() {
    var deleteListPage = $('#deletePage'), press;
    deleteListPage.constructor.prototype.dialog = function(){};
    randomChooser.createView().askToDelete('meh', function() {
      ok(true); // ensure invoked via test count in test invocation
    });
    press = jQuery.Event("keyup");
    press.which = 13;
    press.keyCode = 13;
    deleteListPage.trigger('focus');
    deleteListPage.trigger(press);
  });
  test("setImportErrorText - string of positive length shows error message", 3, function() {
    equal($('#importErrorText').text(), '');
    $('#importErrorText').constructor.prototype.show = function() {
      ok(true);
    };
    $('#importErrorText').constructor.prototype.hide = function() {
      throw "should be shown";
    };
    randomChooser.createView().setImportErrorText("some error");
    equal($('#importErrorText').text(), 'some error');
  });
  test("clearImportErrorText - clears and hides error text", function() {
    $('#importErrorText').text('some error');
    $('#importErrorText').constructor.prototype.hide = function() {
      ok(true);
    };
    $('#importErrorText').constructor.prototype.show = function() {
      throw "should be hidden";
    };
    randomChooser.createView().clearImportErrorText();
    equal($('#importErrorText').text(), '');
  });
});
