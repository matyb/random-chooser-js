var $, deepEqual, equal, module, ok, raises, randomChooser, test;
$(document).ready(function(){
  module("Controller");
  test("construction - blows up with no model", 1, function() {
    raises( function() {
      randomChooser.createController(null, randomChooser.createView());
    }, 'model: "' + null + '", view: "' + {} +'" - somethings wrong...' );
  });
  test("construction - blows up with no view", 1, function() {
    raises( function() {
      randomChooser.createController(randomChooser.createModel(), null);
    }, 'model: "' + {} + '", view: "' + null +'" - somethings wrong...' );
  });
  test("construction - with model and view is ok", 0, function() {
    randomChooser.createController({}, {});
  });
  test("redrawFistPage - redraws first page", 3, function() {
    var lists = ['meh'], model = {}, view = {};
    model.getListNames = function () {
      ok(true); // ensure invoked via test count in test invocation
      return lists;
    };
    view.redrawLists = function (localLists) {
      equal( lists.length, localLists.length );
      equal( lists[0], localLists[0].name );
    };
    randomChooser.createController(model, view).redrawFirstPage();
  });
  test("drawSelectedList - invokes drawList with selected list", 4, function() {
    var listName = 'meh', model = {}, view = {}, list = [], controller;
    model.getSelectedListName = function () {
      ok(true); // ensures invoked via test count in test invocation
      return listName;
    };
    model.getList = function (name) {
      equal( name, listName );
      return list;
    };
    view.drawList = function (name, localList){
      equal( name, listName );
      deepEqual( localList, list );
    };
    randomChooser.createController(model, view).drawSelectedList();
  });
  test("enableDisableRandom - disables when no list selected", 1, function() {
    var model = {}, view = {};
    model.getSelectedListName = function () {
      return undefined;
    };
    view.setRandomDisabled = function (disabled) {
      ok(disabled);
    };
    randomChooser.createController(model, view).enableDisableRandom();
  });
  test("enableDisableRandom - disables when list is empty", 1, function() {
    var model = {}, view = {};
    model.getSelectedListName = function () {
      return '1';
    };
    model.getSelectedList = function () {
      return [];
    };
    view.setRandomDisabled = function (disabled) {
      ok(disabled);
    };
    randomChooser.createController(model, view).enableDisableRandom();
  });
  test("selectRandomItem - selects and displays item from selected list", 1, function() {
    var model = {}, view = {};
    model.getSelectedList = function () {
      return ['1'];
    };
    view.displayItem = function (arg) {
      equal( arg, '1' );
    };
    randomChooser.createController(model, view).selectRandomItem();
  });
  test("getDbJSONString - delegates to model", 2, function() {
    var model = {
      getDbJSONString : function () {
        ok(true);
        return "{}";
      }
    };
    equal("{}", randomChooser.createController(model, {}).getDbJSONString());
  });
  test("importLists - clears view's error text first", 1, function() {
    var model = {
      save : function () {}
    }, view = {
      clearImportErrorText : function () {
        ok(true);
      }
    };
    randomChooser.createController(model, view).importLists("{}");
  });
  test("importLists - saves once per import", 1, function() {
    var model = {
      save : function () {
        ok(true);
      },
      getList : function () {},
      addList : function () {},
      isItemNameUniqueInList : function () {
        return true;
      },
      addItemToList : function () {}
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"1\":[\"1\"],\"2\":[\"2\"]}");
  });
  test("importLists - adds new list when it doesn't exist", 1, function() {
    var model = {
      save : function () {},
      getList : function () {},
      addList : function (name) {
        equal(name, "name");
      },
      isItemNameUniqueInList : function () {},
      addItemToList : function () {}
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"name\":[]}");
  });
  test("importLists - does not add list when it exists", 1, function() {
    var list = [], model = {
      save : function () {},
      getList : function (name) {
        equal(name, "name");
        return list;
      },
      isItemNameUniqueInList : function () {},
      addItemToList : function () {}
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"name\":[]}");
  });
  test("importLists - adds new item to new list when it doesn't exist", 2, function() {
    var listFromAddListInvocation, model = {
      save : function () {},
      getList : function () {
        return listFromAddListInvocation;
      },
      addList : function (name) {
        listFromAddListInvocation = [];
      },
      isItemNameUniqueInList : function () {
        return true;
      },
      addItemToList : function (list, itemName) {
        equal(list, listFromAddListInvocation);
        equal(itemName, "item");
      }
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"name\":[\"item\"]}");
  });
  test("importLists - adds item to list when it exists", 2, function() {
    var list = [], model = {
      save : function () {},
      getList : function (name) {
        return list;
      },
      isItemNameUniqueInList : function () {
        return true;
      },
      addItemToList : function (argumentList, itemName) {
        equal(argumentList, list);
        equal(itemName, 'itemName');
      }
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"name\":[\"itemName\"]}");
  });
  test("importLists - doesn't add item if it's not unique", 1, function() {
    var list = [], model = {
      save : function () {},
      getList : function (name) {
        return list;
      },
      isItemNameUniqueInList : function () {
        ok(true);
        return false;
      }
    }, view = {
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("{\"name\":[\"itemName\"]}");
  });
  test("importLists - undefined JSON warns user", 1, function() {
    var model = {}, view = {
      setImportErrorText : function (text) {
        equal(text, "The text isn't in a proper JSON format, please correct this and try again.");
      },
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists();
  });
  test("importLists - malformed JSON warns user", 1, function() {
    var model = {}, view = {
      setImportErrorText : function (text) {
        equal(text, "The text isn't in a proper JSON format, please correct this and try again.");
      },
      clearImportErrorText : function () {}
    };
    randomChooser.createController(model, view).importLists("meh"); // meh is not well formed JSON
  });
});