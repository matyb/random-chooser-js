var $, deepEqual, equal, module, ok, QUnit, raises, randomChooser, test;
$(document).ready(function(){
  var localStorage;
  QUnit.testStart = function(name) {
    localStorage =(function() {
      var storage = {};
      return {
        getItem : function(key) {
          return storage[key];
        },
        setItem : function(key, value) {
          storage[key] = value;
        }
      };
    })();
  };
  module("Model");
  test("saves new random-chooser-lists object if not found", 2, function() {
    equal( localStorage.getItem('random-chooser-lists'), null);
    randomChooser.createModel(localStorage);
    equal( localStorage.getItem('random-chooser-lists'), "{}");
  });
  test("retrieves existing random-chooser-lists", 1, function() {
    localStorage = {
      getItem : function(key) {
        equal('random-chooser-lists', key);
      },
      setItem : function(){} // not testing this here, just added to avoid exception
    };
    randomChooser.createModel(localStorage);  
  });
  test("addList adds a List to localStorage", 1, function() {
    var listName = 'listName', model;
    model = randomChooser.createModel(localStorage); 
    // ensure db for app is empty
    localStorage.setItem( 'random-chooser-lists', '{}' ); 
    model.addList(listName);
    model.save();
    equal( localStorage.getItem('random-chooser-lists'), '{\"' + listName + '\":[]}');
  });
  test("delete deletes a List from localStorage", 1, function() {
    var model = randomChooser.createModel(localStorage), listName = 'listName';
    localStorage.setItem('random-chooser-lists', JSON.stringify( { listName : [] } ));
    model.deleteList(listName);
    model.save();
    deepEqual( localStorage.getItem('random-chooser-lists'), "{}");
  });
  test("getSelectedListName returns undefined", 1, function() {
    var model = randomChooser.createModel(localStorage);
    equal( model.getSelectedListName(), undefined );
  });
  test("setSelectedListName sets the name of the selected list", 1, function() {
    var model = randomChooser.createModel(localStorage), listName = 'listName';
    model.setSelectedListName(listName);
    equal( model.getSelectedListName(), listName );
  });
  test("isItemNameUniqueInSelectedList raise exception if no list selected", 1, function() {
    var model = randomChooser.createModel(localStorage);
    raises( function() {
      model.isItemNameUniqueInSelectedList('listName');
    },"Invalid list is selected: 'undefined'", 'Expected an exception, result is not valid when no list selected' );
  });
  test("isItemNameUniqueInSelectedList - is NOT unique", 1, function() {
    var model, listName = 'listName', itemName = '123';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[\"' + itemName + '\"]}' );
    model = randomChooser.createModel(localStorage);
    model.setSelectedListName( listName );
    ok( !model.isItemNameUniqueInSelectedList(itemName) );
  });
  test("isItemNameUniqueInSelectedList - IS unique", 1, function() {
    var model, listName = 'listName';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[]}' );
    model = randomChooser.createModel(localStorage);
    model.setSelectedListName( listName );
    ok( model.isItemNameUniqueInSelectedList('123') );
  });
  test("getListNames - empty", 1, function() {
    var model, listName = 'listName';
    localStorage.setItem('random-chooser-lists', '{}' );
    model = randomChooser.createModel(localStorage);
    deepEqual( [], model.getListNames() );
  });
  test("getListNames - exist", 1, function() {
    var model, listName = 'listName';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[]}' );
    model = randomChooser.createModel(localStorage);
    deepEqual( [listName], model.getListNames() );
  });
  test("addItem - raises exception if invoked with no selected list", 1, function() {
    var model = randomChooser.createModel(localStorage);
    raises( function() {
      model.addItem('listName');
    },"Invalid list is selected: 'undefined'", 'Expected an exception, result is not valid when no list selected' );
  });
  test("addItem - adds an item to currently selected list", 1, function() {
    var model, listName = 'listName', itemName = '123';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[]}' );
    model = randomChooser.createModel(localStorage);
    model.setSelectedListName(listName);
    model.addItem(itemName);
    model.save();
    equal( localStorage.getItem('random-chooser-lists'), '{\"' + listName + '\":[\"' + itemName + '\"]}' );
  });
  test("deleteItem - raises exception if invoked with no selected list", 1, function() {
    raises( function() {
      randomChooser.createModel(localStorage).deleteItem('listName');
    },"Invalid list is selected: 'undefined'", 'Expected an exception, result is not valid when no list selected' );
  });
  test("deleteItem - deletes an item from currently selected list", 1, function() {
    var model, listName = 'listName', itemName = '123';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[\"' + itemName + '\"]}' );
    model = randomChooser.createModel(localStorage);
    model.setSelectedListName(listName);
    model.deleteItem(itemName);
    model.save();
    equal( localStorage.getItem('random-chooser-lists'), '{\"' + listName + '\":[]}');
  });
  test("getSelectedList - undefined when no list selected", 1, function() {
    equal( randomChooser.createModel(localStorage).getSelectedList(), undefined );
  });
  test("getSelectedList - is the list selected", 1, function() {
    var listName = 'listName', itemName = '123', model;
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[\"' + itemName + '\"]}' );
    model = randomChooser.createModel(localStorage);
    model.setSelectedListName(listName);
    deepEqual( model.getSelectedList(), [itemName] );
  });
  test("getList - undefined when no list selected", 1, function() {
    equal( randomChooser.createModel(localStorage).getList('some list name'), undefined );
  });
  test("getList - is the list for the provided name", 1, function() {
    var listName = 'listName', itemName = '123';
    localStorage.setItem('random-chooser-lists', '{\"' + listName + '\":[\"' + itemName + '\"]}' );
    deepEqual( randomChooser.createModel(localStorage).getList(listName), [itemName] );
  });
  test("getDbJSONString - returns from localstorage", 3, function() {
    var localStorage = {
        getItem : function (key) {
          equal('random-chooser-lists', key);
          return '{\"db contents\":[]}';
        }
    };
    equal( randomChooser.createModel(localStorage).getDbJSONString(), "{\"db contents\":[]}");
  });
});