var $, window, randomChooser = ( function(win) {
    var controller;
    if (!$) {
        throw 'jquery is required, please include it before this script';
    }
    
    function createLocalStorage (windo) {
        var isLocalStorageSupported = false;
        try {
            isLocalStorageSupported = 'localStorage' in windo && windo.localStorage !== null;
            windo.localStorage.setItem('random-chooser-saveable-test', 'success');
            // test mutability - safari throws in private mode
            if(windo.localStorage.removeItem) { // not used by rest of application
                windo.localStorage.removeItem('random-chooser-saveable-test', 'success');
            }
        } catch (e) {
            isLocalStorageSupported = false;
            windo.alert('Random Chooser cannot save lists, you may have private browsing enabled.');
        }
        if(isLocalStorageSupported) {
            return windo.localStorage;
        } else {
            return ( function() {
                var storage = {};
                return {
                    getItem : function(key) {
                        return storage[key];
                    },
                    setItem : function(key, value) {
                        storage[key] = value;
                    }
                };
            }());
        }
    }
    
    function createModel (db) {'use strict';
      var lists, selectedListName;
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
          var isUnique = true;
          $(checkListIsSelected()).each( function (index, element) {
            if(element === itemName) {
              isUnique = false;
            }
          });
          return isUnique;
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
          var list = checkListIsSelected();
          $(list).each( function (index, element) {
            if(element === itemName) {
              list.splice(index, 1);
            }
          });
          db.setItem('random-chooser-lists', JSON.stringify(lists));
        },
        getSelectedList : function() {
          return getList(selectedListName);
        },
        getList : function(listName) {
          return getList(listName);
        }
      };
    }
    
    function createView () {
     function createDeleteAnchor (anchorText) {
        return $('<a/>', {
          'href' : '#deletePage',
          'data-role' : 'button', 
          'data-rel' : 'dialog', 
          'data-transition' : 'pop',
          'text' : anchorText
        });
      }
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
      function addItem (listName, deleteClick, viewClick) {
        addToList(listName, 'Delete Item', '#listItems', deleteClick, viewClick);
      }
      function redrawList (list, ul, addF) {
        ul.empty();
        ul.listview('refresh');
        $(list).each( function (index, element) {
          addF(element.name, element.deleteClick, element.viewClick);
        });
        ul.listview('refresh');
      }
      function ifEnterInvokeClickHandler (event, element, page) {
        if((event.keyCode === 13 || event.which === 13) && element[0].className.indexOf('ui-disabled') === -1) {
          element.click();
        }
        if(event.keyCode === 27 || event.which === 27) {
          page.dialog('close');
        }
        return false;
      }
      return {
        redrawLists : function(list) {
          redrawList(list, $('#lists'), function (name, deleteClick, viewClick) {
            addList(name, deleteClick, viewClick);
          });
        },
        addList : function(listName, deleteClick, viewClick) {
          addList(listName, deleteClick, viewClick);
        },
        addItem : function(itemName, deleteClick, viewClick) {
          addItem(itemName, deleteClick, viewClick);
        },
        drawList : function(listName, list) {
          $('#listNameLabel').text("list: " + listName);
          redrawList(list, $('#listItems'), function (name, deleteClick, viewClick) {
            addItem(name, deleteClick, viewClick);
          });
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
          deleteButton.unbind('click').click(deleteClick).click(function () {
            deletePage.dialog('close');
          });
          deletePage.unbind('keyup').bind('keyup', function(event) {
            return ifEnterInvokeClickHandler(event, deleteButton, deletePage);
          });
        },
        ifEnterInvokeClickHandler : function (event, button, page) {
          ifEnterInvokeClickHandler(event, button, page);
        }
      };
    }
    
    function createController (model, view) {
      var deleteItem, redrawFirstPage;
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
      function createLineItemModels (names, deleteF, viewF) {
        var lists = [], i;
        names.sort();
        $(names).each( function (index, element) {
          lists.push({
              name : element,
              deleteClick : function() {
                view.askToDelete(element, function(){
                  deleteF(element);
                });
              },
              viewClick : function() {
                viewF(element);
              } 
            });
        });
        return lists;
      }
      function drawList(listName) {
        var list = [], listItems = model.getList(listName), i, viewFunction = function () {};
        if(listItems === undefined){ // probably a page refresh - go back to first page
          $.mobile.changePage('#firstPage', {
            reverse: true
          });
          return false;
        }
        view.drawList( listName, createLineItemModels(listItems, function(itemName) {
          deleteItem(itemName);
        }, viewFunction));
      }
      function drawSelectedList() {
        drawList(model.getSelectedListName());
      }
      function addItemToSelectedList (itemName) {
        model.addItem(itemName);
        drawSelectedList();
      }
      function deleteList (listName) {
        model.deleteList(listName);
        redrawFirstPage();
      }
      function enableDisableRandom () {
        view.setRandomDisabled(model.getSelectedListName() === undefined || model.getSelectedList().length <= 0);
      }
      deleteItem = function (itemName) {
        model.deleteItem(itemName);
        enableDisableRandom();
        drawSelectedList();
      };
      redrawFirstPage = function () {
        view.redrawLists( createLineItemModels( model.getListNames(), 
              function(listName) { deleteList( listName ); }, 
              function(listName) { model.setSelectedListName( listName ); } ));
      };
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
          return view.ifEnterInvokeClickHandler(event, addOk, dialog);
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
          var list = model.getSelectedList();
          view.displayItem(list[Math.floor(Math.random() * list.length)]);
        },
        ifEnterInvokeClickHandler : function (event, element, page) {
          return view.ifEnterInvokeClickHandler(event, element, page);
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
    }
    
    controller = createController(createModel(createLocalStorage(win)), createView());
    
    // JQuery Mobile page events & handlers
    $('#firstPage').live('pageinit', function (event) {
        'use strict';
        controller.redrawFirstPage();
    });
    $('#addListPage').live('pageinit', function (event) {
        'use strict';
        controller.initAddListPage();
    });
    $('#addItemPage').live('pageinit', function (event) {
        'use strict';
        controller.initAddItemPage();
    });
    $('#viewListPage').live('pageinit', function (event) {
        'use strict';
        $('#random').click(function () {
            controller.selectRandomItem();
        });
    });
    $('#viewItemPage').live('pageinit', function (event) {
        'use strict';
        var selectAnother = $('#selectAnother');
        selectAnother.click(function () {
            controller.selectRandomItem();
        });
        $("#viewItemPage").bind('keyup', function (event) {
            return controller.ifEnterInvokeClickHandler(event, selectAnother, $('#viewItemPage'));
        });
    });
    $('#viewListPage').live('pagebeforeshow', function (event) {
        controller.enableDisableRandom();
        controller.drawSelectedList();
    });
    $('#addListPage').live('pagehide', function (event, ui) {
        $('#listName').val('');
        $('#addListOk').addClass('ui-disabled');
    });
    $('#addListPage').live('pageshow', function (event, ui) {
        $('#listName').focus();
    });
    $('#addItemPage').live('pagehide', function (event, ui) {
        $('#itemName').val('');
        $('#addItemOk').addClass('ui-disabled');
    });
    $('#addItemPage').live('pageshow', function (event, ui) {
        $('#itemName').focus();
    });
    // despite not using global name space & being immutable, keep the application testable
    return {
        createModel : createModel,
        createView : createView,
        createController : createController,
        createLocalStorage : createLocalStorage
    };
}(window));