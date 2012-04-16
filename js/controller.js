var randomChooser;
if(!randomChooser) {
  randomChooser = {};
}
randomChooser.createController = function (model, view) {
  if(!model || !view){
    throw 'model: "' + model + '", view: "' + view +'" - somethings wrong...';
  }
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
  function ifEnterInvokeClickHandler (event, element, page) {
    if((event.keyCode === 13 || event.which === 13) && element[0].className.indexOf('ui-disabled') === -1) {
      element.click();
    }
    if(event.keyCode === 27 || event.which === 27) {
      page.dialog ('close');
    }
    return false;
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
      return ifEnterInvokeClickHandler(event, addOk, dialog);
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
      return ifEnterInvokeClickHandler(event, element, page);
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