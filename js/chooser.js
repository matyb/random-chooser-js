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
randomChooser.createView = function () {
  var createDeleteAnchor = function (anchorText) {
    return $('<a/>', {
      'href' : '#deletePage',
      'data-transition' : 'slide',
      'data-role' : 'button', 
      'data-rel' : 'dialog', 
      'data-transition' : 'pop',
      'text' : anchorText
    });
  };
  function addToList (viewAnchorText, deleteAnchorText, htmlListId, deleteClick, viewClick, viewPageId) {
    var listViewAnchor, deleteListAnchor;
    listViewAnchor = $('<a/>', {
      'text' : viewAnchorText
    });
    if(viewPageId){
      listViewAnchor[0].href = viewPageId;
      listViewAnchor[0]['data-transition'] = 'slide';
    }
    deleteListAnchor = createDeleteAnchor(deleteAnchorText);
    deleteListAnchor[0].onclick = deleteClick;
    listViewAnchor[0].onclick = viewClick;
    $(htmlListId).append($('<li/>', {}).append(listViewAnchor).append(deleteListAnchor));
  }
  function addList (listName, deleteClick, viewClick) {
    addToList(listName, 'Delete List', '#lists', deleteClick, viewClick, '#viewListPage');
  }
  function addItem (listName, deleteClick) {
    addToList(listName, 'Delete Item', '#listItems', deleteClick, function(){});
  }
  return {
    redrawLists : function(list) {
      var i = 0, lists = $('#lists');
      lists.empty();
      lists.listview('refresh');
      for(; i < list.length; i++) {
        addList(list[i].name, list[i].deleteClick, list[i].viewClick);
      }
      lists.listview('refresh');
    },
    addList : function(listName, deleteClick, viewClick) {
      addList(listName, deleteClick, viewClick);
    },
    addItem : function(itemName, deleteClick) {
      addItem(itemName, deleteClick);
    },
    drawList : function(listName, list) {
      var i;
      $('#listNameLabel').text("list: " + listName);
      $('#listItems').empty();
      $('#listItems').listview('refresh');
      list.sort();
      for(i = 0; i < list.length; i++) {
        addItem(list[i].name, list[i].deleteClick);
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
    askToDelete : function(name, deleteClick) {
      var deleteButton = $('#delete'), deletePage = $('#deletePage'), deleteLabel = $('#deleteLabel');
      deleteLabel.text(name);
      deleteButton.unbind('click');
      deleteButton.click(deleteClick);
      deleteButton.click(function () {
        deletePage.dialog ('close');
      });
      deletePage.unbind('keyup');
      deletePage.bind('keyup', function(event) {
        if(event.keyCode === 13 || event.which === 13) {
          deleteButton.click();
        }
        if(event.keyCode === 27 || event.which === 27) {
          deletePage.dialog ('close');
        }
        return false;
      });
    }
  };
};
randomChooser.createController = function (model, view) {
  function addList (listName) {
    if(model.getList(listName) === undefined) {
      model.addList(listName);
      redrawFirstPage();
      return true;
    }
    return false;
  }
  function addItemToSelectedList (itemName) {
    model.addItem(itemName);
    drawSelectedList();
  }
  function createLineItemModels (names, askToDeleteF, viewF) {
    var lists = [], i;
    names.sort();
    for (i = 0; i < names.length; i += 1) {
      (function () {
        var name = names[i]; 
        lists.push({
          name : name,
          deleteClick : function() {
            view.askToDelete(name, function(){
              askToDeleteF(name);
            });
          },
          viewClick : function() {
            viewF(name);
          } 
        });
      }());
    }
    return lists;
  }
  function redrawFirstPage () {
    view.redrawLists( createLineItemModels( model.getListNames(), 
          function(listName) { deleteList( listName ) }, 
          function(listName) { model.setSelectedListName( listName ) } ));
  }
  function drawList(listName) {
    var list = [], listItems = model.getList(listName), i;
    if(listItems === undefined){ // probably a page refresh - go back to first page
      $.mobile.changePage('#firstPage', {
        reverse: true
      });
      return false;
    }
    view.drawList( listName, createLineItemModels(listItems, function(itemName) {
      deleteItem(itemName);
    }, function(itemName) {}));
  }
  function deleteList (listName) {
    model.deleteList(listName);
    redrawFirstPage();
  }
  function deleteItem (itemName) {
    model.deleteItem(itemName);
    enableDisableRandom();
    drawSelectedList();
  }
  function enableDisableRandom () {
    view.setRandomDisabled(model.getSelectedListName() === undefined || model.getSelectedList().length <= 0);
  }
  function drawSelectedList() {
    drawList(model.getSelectedListName());
  }
  function disableAddList (listName) {
    return listName.length === 0 || model.getList(listName) !== undefined;
  }
  function disableAddItem (itemName) {
    return itemName.length === 0 || !model.isItemNameUniqueInSelectedList(itemName);
  }
  function initAddPage (addOkId, textFieldId, dialogId, disableAddF, addF) {
    var addOk = $(addOkId), name, dialog = $(dialogId);
    addOk.addClass('ui-disabled');
    $(textFieldId).bind( 'keyup', function(event) {
      name = $(textFieldId).val().trim();
      if(disableAddF(name)) {
        addOk.addClass('ui-disabled');
      } else {
        addOk.removeClass('ui-disabled');
      }
    });
    addOk.click(function() {
      addF(name);
    });
    dialog.bind('keyup', function(event) {
      return randomChooser.controller.ifEnterInvokeClickHandler(event, addOk, dialog);
    });
  }
  return {
    redrawFirstPage : function() {
      redrawFirstPage();
    },
    drawSelectedList : function() {
      drawSelectedList();
    },
    enableDisableRandom : function() {
      enableDisableRandom();
    },
    selectRandomItem : function() {
      var randomlySelectedItem = model.getSelectedList()[Math.floor(Math.random() * model.getSelectedList().length)];
      view.displayItem(randomlySelectedItem);
    },
    ifEnterInvokeClickHandler : function (event, element, page) {
      if((event.keyCode === 13 || event.which === 13) && element[0].className.indexOf('ui-disabled') === -1) {
        element.click();
      }
      if(event.keyCode === 27 || event.which === 27) {
        page.dialog ('close');
      }
      return false;
    },
    initAddListPage : function () {
      initAddPage('#addListOk', '#listName', '#addListPage', disableAddList, function (text){
        addList(text);
      });
    },
    initAddItemPage : function () {
      initAddPage('#addItemOk', '#itemName', '#addItemPage', disableAddItem, function (text){
        addItemToSelectedList(text);
      });
    }  
  };
};
randomChooser.controller = randomChooser.createController(randomChooser.createModel(), randomChooser.createView());
// JQuery Mobile page events & handlers
$('#firstPage').live('pageinit', function(event) {
  randomChooser.controller.redrawFirstPage();
});
$('#addListPage').live('pageinit', function(event) {
  randomChooser.controller.initAddListPage();
});
$('#addItemPage').live('pageinit', function(event) {
  randomChooser.controller.initAddItemPage();
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
    return randomChooser.controller.ifEnterInvokeClickHandler(event, selectAnother, $('#viewItemPage'));
  });
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
