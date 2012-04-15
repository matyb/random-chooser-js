var randomChooser;
if(!randomChooser) {
  randomChooser = {};
}
randomChooser.createModel = function() {'use strict';
  var lists, selectedListName, db = randomChooser.localStorage, checkListIsSelected;
  checkListIsSelected = function() {
    var currentlySelectedList = lists[selectedListName];
    if(currentlySelectedList === undefined) {
      throw 'Invalid list is selected: \'' + selectedListName + '\'';
    }
    return currentlySelectedList;
  };
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
      return randomChooser.model.getList(selectedListName);
    },
    getList : function(listName) {
      return lists[listName];
    }
  };
};
randomChooser.model = randomChooser.createModel();
randomChooser.createView = function () {
  var createDeleteAnchor = function (pageId, anchorText) {
    return $('<a/>', {
      'href' : pageId,
      'data-transition' : 'slide',
      'data-role' : 'button', 
      'data-rel' : 'dialog', 
      'data-transition' : 'pop',
      'text' : anchorText
    });
  },
  deleteSomething = function (deleteItem, deleteItemPage, deleteItemLabel, name, deleteItemClick) {
      deleteItemLabel.text(name);
      deleteItem.unbind('click');
      deleteItem.click(deleteItemClick);
      deleteItem.click(function () {
        deleteItemPage.dialog ('close');
      });
      deleteItemPage.unbind('keyup');
      deleteItemPage.bind('keyup', function(event) {
        if(event.keyCode === 13 || event.which === 13) {
          deleteItem.click();
        }
        if(event.keyCode === 27 || event.which === 27) {
          deleteItemPage.dialog ('close');
        }
        return false;
      });
  };
  return {
    redrawLists : function(list) {
      var i = 0, lists = $('#lists');
      lists.empty();
      lists.listview('refresh');
      for(; i < list.length; i++) {
        randomChooser.view.addList(list[i].name, list[i].deleteClick, list[i].viewClick);
      }
      lists.listview('refresh');
    },
    addList : function(listName, deleteClick, viewClick) {
      var listViewAnchor, deleteListAnchor;
      listViewAnchor = $('<a/>', {
        'href' : '#viewListPage',
        'data-transition' : 'slide',
        'text' : listName
      });
      deleteListAnchor = createDeleteAnchor('#deleteListPage', 'Delete List');
      deleteListAnchor[0].onclick = deleteClick;
      listViewAnchor[0].onclick = viewClick;
      $('#lists').append($('<li/>', {}).append(listViewAnchor).append(deleteListAnchor));
    },
    addItem : function(itemName, deleteClick) {
      var itemViewAnchor, deleteItemAnchor;
      itemViewAnchor = $('<a/>', {
        'text' : itemName
      });
      deleteItemAnchor = createDeleteAnchor('#deleteItemPage', 'Delete Item');
      deleteItemAnchor[0].onclick = deleteClick;
      $('#listItems').append($('<li/>', {}).append(itemViewAnchor).append(deleteItemAnchor));
    },
    drawList : function(listName, list) {
      var i;
      $('#listNameLabel').text("list: " + listName);
      $('#listItems').empty();
      $('#listItems').listview('refresh');
      list.sort();
      for(i = 0; i < list.length; i++) {
        randomChooser.view.addItem(list[i].name, list[i].deleteClick);
      }
      $('#listItems').listview('refresh');
    },
    setRandomDisabled : function(disabled) {
      if(disabled) {
        $('#random').addClass('ui-disabled');
      } else {
        $('#random').removeClass('ui-disabled');
      }
    },
    displayItem : function(itemName) {
      $('#itemNameLabel').text(itemName);
    },
    askToDeleteItem : function(name, deleteItemClick) {
      deleteSomething( $('#deleteItem'), $('#deleteItemPage'), $('#deleteItemLabel'), name, deleteItemClick);
    },
    askToDeleteList : function(name, deleteListClick) {
      deleteSomething( $('#deleteList'), $('#deleteListPage'), $('#deleteListLabel'), name, deleteListClick);
    }
  };
};
randomChooser.view = randomChooser.createView();
randomChooser.createController = function () {
  return {
    addList : function(listName) {
      if(randomChooser.model.getList(listName) === undefined) {
        randomChooser.model.addList(listName);
        randomChooser.controller.redrawFirstPage();
        return true;
      }
      return false;
    },
    redrawFirstPage : function() {
      var lists = [], i, listNames = randomChooser.model.getListNames();
      listNames.sort();
      for (i = 0; i < listNames.length; i += 1) {
        (function () {
          var listName = listNames[i]; 
          lists.push({
            name : listName,
            deleteClick : function() {
              randomChooser.view.askToDeleteList(listName, function(){
                randomChooser.controller.deleteList(listName);
              });
            },
            viewClick : function() {
              randomChooser.controller.setSelectedList(listName);
            } 
          });
        }());
      }
      randomChooser.view.redrawLists(lists);
    },
    setSelectedList : function(selectedListName) {
      randomChooser.model.setSelectedListName(selectedListName);
    },
    drawList : function(listName) {
      var list = [], listItems = randomChooser.model.getList(listName), i;
      if(listItems === undefined){ // probably a page refresh - go back to first page
        $.mobile.changePage("#firstPage", {
          reverse: true
        });
        return false;
      }
      listItems.sort();
      for (i = 0; i < listItems.length; i += 1) {
        (function () {
          var item = listItems[i];
          list.push({
            name : item,
            deleteClick : function () {
              randomChooser.view.askToDeleteItem(item, function () {
                randomChooser.controller.deleteItem(item);
              });
            }
          });
        }());
      }
      randomChooser.view.drawList(listName, list);
    },
    drawSelectedList : function() {
      randomChooser.controller.drawList(randomChooser.model.getSelectedListName());
    },
    deleteList : function(listName) {
      randomChooser.model.deleteList(listName);
      randomChooser.controller.redrawFirstPage();
    },
    deleteItem : function(itemName) {
      randomChooser.model.deleteItem(itemName);
      randomChooser.controller.enableDisableRandom();
      randomChooser.controller.drawSelectedList();
    },
    addItemToSelectedList : function(itemName) {
      randomChooser.model.addItem(itemName);
      randomChooser.controller.drawSelectedList();
    },
    enableDisableRandom : function() {
      randomChooser.view.setRandomDisabled(randomChooser.model.getSelectedListName() === undefined || randomChooser.model.getSelectedList().length <= 0);
    },
    selectRandomItem : function() {
      var randomlySelectedItem = randomChooser.model.getSelectedList()[Math.floor(Math.random() * randomChooser.model.getSelectedList().length)];
      randomChooser.view.displayItem(randomlySelectedItem);
    }
  };
};
randomChooser.controller = randomChooser.createController();
$('#firstPage').live('pageinit', function(event) {
  randomChooser.controller.redrawFirstPage();
});
$('#addListPage').live('pageinit', function(event) {
  var addListOk = $('#addListOk');
  addListOk.addClass('ui-disabled');
  $('#listName').keyup(function(event) {
    var listName = event.currentTarget.value.trim();
    if(listName.length === 0 || randomChooser.model.getList(listName) !== undefined) {
      addListOk.addClass('ui-disabled');
    } else {
      addListOk.removeClass('ui-disabled');
    }
  });
  addListOk.click(function() {
    randomChooser.controller.addList($('#listName').val().trim());
  });
  $("#addListPage").bind('keyup', function(event) {
    if((event.keyCode === 13 || event.which === 13) && addListOk[0].className.indexOf('ui-disabled') === -1) {
      addListOk.click();
    }
    if(event.keyCode === 27 || event.which === 27) {
      $("#addListPage").dialog ('close');
    }
    return false;
  });
});
$('#addItemPage').live('pageinit', function(event) {
  var addItemOk = $('#addItemOk');
  addItemOk.addClass('ui-disabled');
  $('#itemName').keyup(function(event) {
    var itemName = event.currentTarget.value.trim();
    if(itemName.length === 0 || !randomChooser.model.isItemNameUniqueInSelectedList(itemName)) {
      addItemOk.addClass('ui-disabled');
    } else {
      addItemOk.removeClass('ui-disabled');
    }
  });
  addItemOk.click(function() {
    randomChooser.controller.addItemToSelectedList($('#itemName').val().trim());
  });
  $("#addItemPage").bind('keyup', function(event) {
    if((event.keyCode === 13 || event.which === 13) && addItemOk[0].className.indexOf('ui-disabled') === -1) {
      addItemOk.click();
    }
    if(event.keyCode === 27 || event.which === 27) {
      $("#addItemPage").dialog ('close');
    }
    return false;
  });
});
$('#viewListPage').live('pageinit', function(event) {
  $('#random').click(function() {
    randomChooser.controller.selectRandomItem();
  });
});
$('#viewItemPage').live('pageinit', function(event) {
  var selectAnother = $('#selectAnother');
  selectAnother.click(function() {
    randomChooser.controller.selectRandomItem();
  });
  $("#viewItemPage").bind('keyup', function(event) {
    if((event.keyCode === 13 || event.which === 13) && selectAnother[0].className.indexOf('ui-disabled') === -1) {
      selectAnother.click();
    }
    if(event.keyCode === 27 || event.which === 27) {
      $('#viewItemPage').dialog ('close');
    }
    return false;
  });
});
$('#deletePage').live('pageinit', function (event) {
  
});
$('#viewListPage').live('pagebeforeshow', function(event) {
  randomChooser.controller.enableDisableRandom();
  randomChooser.controller.drawSelectedList();
});
$('#addListPage').live('pagehide', function(event, ui) {
  $('#listName').val('');
  $('#addListOk').addClass('ui-disabled');
});
$('#addListPage').live('pageshow', function(event, ui) {
  $('#listName').focus();
});
$('#addItemPage').live('pagehide', function(event, ui) {
  $('#itemName').val('');
  $('#addItemOk').addClass('ui-disabled');
});
$('#addItemPage').live('pageshow', function(event, ui) {
  $('#itemName').focus();
});
