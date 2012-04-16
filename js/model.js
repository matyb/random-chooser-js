var randomChooser;
if(!randomChooser) {
  randomChooser = {};
}
randomChooser.createModel = function() {'use strict';
  var lists, selectedListName, db = randomChooser.localStorage;
  function checkListIsSelected () {
    var currentlySelectedList = lists[selectedListName];
    if(currentlySelectedList === undefined) {
      throw 'Invalid list is selected: \'' + selectedListName + '\'';
    }
    return currentlySelectedList;
  }
  function getList (listName) {
    return lists[listName];
  }
  lists = db.getItem('random-chooser-lists');
  if(lists === null || lists === undefined) {
    lists = {};
    db.setItem('random-chooser-lists', JSON.stringify(lists));
  } else {
    lists = JSON.parse(lists);
  }
  return {
    addList : function(listName) {
      lists[listName] = [];
      db.setItem('random-chooser-lists', JSON.stringify(lists));
    },
    deleteList : function(listName) {
      delete lists[listName];
      db.setItem('random-chooser-lists', JSON.stringify(lists));
    },
    setSelectedListName : function(listName) {
      selectedListName = listName;
    },
    getSelectedListName : function() {
      return selectedListName;
    },
    isItemNameUniqueInSelectedList : function(itemName) {
      var i, currentlySelectedList = checkListIsSelected();
      for( i = 0; i < currentlySelectedList.length; i += 1 ) {
        if(currentlySelectedList[i] === itemName) {
          return false;
        }
      }
      return true;
    },
    getListNames : function() {
      var listNames = [], i;
      for(i in lists) {
        if(lists.hasOwnProperty(i)) {
          listNames.push(i);
        }
      }
      return listNames;
    },
    addItem : function(itemName) {
      var currentlySelectedList = checkListIsSelected();
      currentlySelectedList[currentlySelectedList.length] = itemName;
      db.setItem('random-chooser-lists', JSON.stringify(lists));
    },
    deleteItem : function(itemName) {
      var i, list = checkListIsSelected(), item;
      for( i = 0; i < list.length; i += 1) {
        item = list[i];
        if(item === itemName) {
          list.splice(i, 1);
        }
      }
      db.setItem('random-chooser-lists', JSON.stringify(lists));
    },
    getSelectedList : function() {
      return getList(selectedListName);
    },
    getList : function(listName) {
      return getList(listName);
    }
  };
};