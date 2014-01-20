/*! random chooser v0.0.4 | (c) 2011, 2013 Mathew Bentley | http://opensource.org/licenses/MIT */
var $, randomChooser = (function (win) {
    'use strict';
    var controller;
    if (!$) {
        throw 'jquery is required, please include it before this script';
    }
    function createLocalStorage(windo) {
        var isLocalStorageSupported =  windo.localStorage !== undefined, localStorage;
        if (isLocalStorageSupported) {
            try {
                windo.localStorage.setItem('random-chooser-saveable-test', 'success');
                // test mutability - safari throws in private mode
                if (windo.localStorage.removeItem) { // not used by rest of application
                    windo.localStorage.removeItem('random-chooser-saveable-test', 'success');
                }
                localStorage = windo.localStorage;
            } catch (e) {
                isLocalStorageSupported = false;
                windo.alert('Random Chooser cannot save lists, you may have private browsing enabled.');
            }
        } 
        if (!isLocalStorageSupported) { // not supported OR doesn't support writes
            localStorage = (function () {
                var storage = {};
                return {
                    getItem : function (key) {
                        return storage[key];
                    },
                    setItem : function (key, value) {
                        storage[key] = value;
                    }
                };
            }());
        }
        return localStorage;
    }
    function createModel(db) {
        var lists, selectedListName, dbGlobal = 'random-chooser-lists';
        function checkListIsSelected() {
            var currentlySelectedList = lists[selectedListName];
            if (currentlySelectedList === undefined) {
                throw 'Invalid list is selected: \'' + selectedListName + '\'';
            }
            return currentlySelectedList;
        }
        function getList(listName) {
            return lists[listName];
        }
        function getDbJSONString() {
            return db.getItem(dbGlobal);
        }
        function save(){
            db.setItem(dbGlobal, JSON.stringify(lists));
        }
        function addItemToList(list, itemName){
            list[list.length] = itemName;
        }
        function isItemNameUniqueInList(list, itemName){
            var isUnique = true;
            $(list).each(function (index, element) {
                if (element === itemName) {
                    isUnique = false;
                }
            });
            return isUnique;
        }
        lists = getDbJSONString();
        if (lists === null || lists === undefined) {
            lists = {};
            save();
        } else {
            lists = JSON.parse(lists);
        }
        return {
            addList : function (listName) {
                lists[listName] = [];
            },
            deleteList : function (listName) {
                delete lists[listName];
            },
            setSelectedListName : function (listName) {
                selectedListName = listName;
            },
            getSelectedListName : function () {
                return selectedListName;
            },
            isItemNameUniqueInSelectedList : function (itemName) {
                return isItemNameUniqueInList(checkListIsSelected(), itemName);
            },
            isItemNameUniqueInList : isItemNameUniqueInList,
            getListNames : function () {
                var listNames = [], i;
                for (i in lists) {
                    if (lists.hasOwnProperty(i)) {
                        listNames.push(i);
                    }
                }
                return listNames;
            },
            addItem : function (itemName) {
                addItemToList(checkListIsSelected(), itemName);
            },
            addItemToList : addItemToList,
            deleteItem : function (itemName) {
                var list = checkListIsSelected();
                $(list).each(function (index, element) {
                    if (element === itemName) {
                        list.splice(index, 1);
						return false;
                    }
                });
            },
            getSelectedList : function () {
                return getList(selectedListName);
            },
            getList : getList,
            getDbJSONString : getDbJSONString,
            save : save
        };
    }
    function createView() {
        function createDeleteAnchor(anchorText) {
            return $('<a/>', {
                'href' : '#deletePage',
                'data-role' : 'button',
                'data-rel' : 'dialog',
                'data-transition' : 'pop',
                'text' : anchorText
            });
        }
        function addToList(viewAnchorText, deleteAnchorText, htmlListId, deleteClick, viewClick, viewPageId) {
            var listViewAnchor, deleteListAnchor;
            listViewAnchor = $('<a/>', {
                'text' : viewAnchorText
            });
            if (viewPageId) {
                listViewAnchor[0].href = viewPageId;
                listViewAnchor[0]['data-transition'] = 'slide';
            }
            deleteListAnchor = createDeleteAnchor(deleteAnchorText);
            deleteListAnchor[0].onclick = deleteClick;
            listViewAnchor[0].onclick = viewClick;
            $(htmlListId).append($('<li/>', {id: (htmlListId.substring(1) + "-"+viewAnchorText)}).append(listViewAnchor).append(deleteListAnchor));
        }
        function addList(listName, deleteClick, viewClick) {
            addToList(listName, 'Delete List', '#lists', deleteClick, viewClick, '#viewListPage');
        }
        function addItem(itemName, deleteClick, viewClick) {
            addToList(itemName, 'Delete Item', '#listItems', deleteClick, viewClick);
        }
        function redrawList(list, ul, addF) {
			ul.empty();
            ul.listview('refresh');
            $(list).each(function (index, element) {
                addF(element.name, element.deleteClick, element.viewClick);
            });
            ul.listview('refresh');
        }
        function ifEnterClickEscClose(event, element, page) {
            if ((event.keyCode === 13 || event.which === 13) && element[0].className.indexOf('ui-disabled') === -1) {
                element.click();
            }
            if (event.keyCode === 27 || event.which === 27) {
                page.dialog('close');
            }
            return false;
        }
        function setImportErrorText (text) {
            if(!text){
                text = "";
            }
            $('#importErrorText').text(text);
            if (text.trim().length > 0) {
                $('#importErrorText').show();
            }else{
                $('#importErrorText').hide();
            }
        }
        return {
            redrawLists : function (list) {
                redrawList(list, $('#lists'), addList);
            },
			deleteList : function (listName) {
				$('#lists-'+listName).remove();
			},
			deleteItem : function (itemName) {
				$('#listItems-'+itemName).remove();
			},
            addList : addList,
            addItem : addItem,
            drawList : function (listName, list) {
                $('.listNameLabel').text("list: " + listName);
                redrawList(list, $('#listItems'), addItem);
            },
            setRandomDisabled : function (disabled) {
                if (disabled) {
                    $('#random').addClass('ui-disabled');
                } else {
                    $('#random').removeClass('ui-disabled');
                }
            },
            displayItem : function (itemName) {
                $('#itemNameLabel').text(itemName);
            },
            askToDelete : function (name, deleteClick) {
                var deleteButton = $('#delete'), deletePage = $('#deletePage'), deleteLabel = $('#deleteLabel');
                deleteLabel.text(name);
                deleteButton.unbind('click').click(deleteClick).click(function () {
                    deletePage.dialog('close');
                });
                deletePage.unbind('keyup').bind('keyup', function (event) {
                    return ifEnterClickEscClose(event, deleteButton, deletePage);
                });
            },
            ifEnterClickEscClose : ifEnterClickEscClose,
            clearImportErrorText : function (){
                setImportErrorText("");
            },
            setImportErrorText : setImportErrorText
        };
    }
    function createController(model, view) {
        var deleteItem, redrawFirstPage;
        if (!model || !view) {
            throw 'model: "' + model + '", view: "' + view + '" - somethings wrong...';
        }
        function addList(listName) {
            if (model.getList(listName) === undefined) {
                model.addList(listName);
                model.save();
                redrawFirstPage();
                return true;
            }
            return false;
        }
        function createLineItemModels(names, deleteF, viewF) {
            var lists = [];
            names.sort(function (a, b) {
				var isANaN = isNaN(a), isBNaN = isNaN(b);
				if(!isANaN && !isBNaN){
					return a - b;
				} else if(!isANaN) {
					return -1;
				} else if(!isBNaN) {
					return 1;
				}
				return a > b;
			});
            $(names).each(function (index, element) {
                lists.push({
                    name : element,
                    deleteClick : function () {
                        view.askToDelete(element, function () {
                            deleteF(element);
                        });
                    },
                    viewClick : function () {
                        viewF(element);
                    }
                });
            });
            return lists;
        }
        function drawList(listName) {
            var listItems = model.getList(listName), viewFunction = function () {};
            if (listItems === undefined) { // probably a page refresh - go back to first page
                $.mobile.changePage('#firstPage', {
                    reverse: true
                });
                return false;
            }
            view.drawList(listName, createLineItemModels(listItems, function (itemName) {
                deleteItem(itemName);
            }, viewFunction));
        }
        function drawSelectedList() {
            drawList(model.getSelectedListName());
        }
        function addItemToSelectedList(itemName) {
            model.addItem(itemName);
            model.save();
            drawSelectedList();
        }
        function deleteList(listName) {
            model.deleteList(listName);
            model.save();
            view.deleteList(listName);
        }
        function enableDisableRandom() {
            view.setRandomDisabled(model.getSelectedListName() === undefined || model.getSelectedList().length <= 0);
        }
        deleteItem = function (itemName) {
            model.deleteItem(itemName);
            model.save();
            enableDisableRandom();
            view.deleteItem(itemName);
        };
        redrawFirstPage = function () {
            view.redrawLists(
				createLineItemModels(model.getListNames(),
                function (listName) { deleteList(listName); },
                function (listName) { model.setSelectedListName(listName); }));
        };
        function disableAddList(listName) {
            return listName.length === 0 || model.getList(listName) !== undefined;
        }
        function disableAddItem(itemName) {
            return itemName.length === 0 || !model.isItemNameUniqueInSelectedList(itemName);
        }
        function disableAddGenerate() {
            var fromText = $('#from').val().trim(), toText = $('#to').val().trim();
            return fromText.length === 0 || toText.length === 0 || +fromText > +toText;
        }
        function initAddPage(addOkId, textFieldIds, dialogId, disableAddF, addF) {
            var addOk = $(addOkId), dialog = $(dialogId);
            addOk.addClass('ui-disabled');
            $(textFieldIds).each(function(index, textFieldId){
                (function(){
                    var name;
                    $(textFieldId).bind('keyup', function () {
                        name = $(textFieldId).val().trim();
                        if (disableAddF(name)) {
                            addOk.addClass('ui-disabled');
                        } else {
                            addOk.removeClass('ui-disabled');
                        }
                    });
                }());
            });
            addOk.click(function () {
                addF();
            });
            dialog.bind('keyup', function (event) {
                return view.ifEnterClickEscClose(event, addOk, dialog);
            });
        }
        return {
            redrawFirstPage : redrawFirstPage,
            drawSelectedList : drawSelectedList,
            enableDisableRandom : enableDisableRandom,
            selectRandomItem : function () {
                var list = model.getSelectedList();
                view.displayItem(list[Math.floor(Math.random() * list.length)]);
            },
            ifEnterClickEscClose : view.ifEnterClickEscClose,
            initAddListPage : function () {
                initAddPage('#addListOk', ['#listName'], '#addListPage', disableAddList, function () {
                    addList($('#listName').val().trim());
                });
            },
            initAddItemPage : function () {
                initAddPage('#addItemOk', ['#itemName'], '#addItemPage', disableAddItem, function () {
                    addItemToSelectedList($('#itemName').val().trim());
                });
            },
            initGenerateItemsPage : function () {
                initAddPage('#addItemsOk', ['#from','#to'], '#generateItemsPage', disableAddGenerate, function () {
                    var fromText = $('#from').val().trim(), toText = $('#to').val().trim(), f, t, list, fString;
                    list = model.getSelectedList();
                    f = Math.max(+fromText, 0);
                    t = Math.min(+toText, 999); // 1000 li's is pushing it
                    for(f; f <= t; f += 1){
                        fString = ''+f;
                        if (model.isItemNameUniqueInList(list, fString)) {
                          model.addItemToList(list, fString);
                        }
                    }
                    model.save();
                });
            },
            getDbJSONString : model.getDbJSONString,
            importLists : function (listsJSONText) {                
                var listsToImport, importProp, i, list, newList;
                view.clearImportErrorText();
                try{
                    listsToImport = JSON.parse(listsJSONText);
                } catch(x) {
                    view.setImportErrorText("The text isn't in a proper JSON format, please correct this and try again.");
                    return false;
                }
                for(importProp in listsToImport){
                    newList = listsToImport[importProp];
                    if(listsToImport.hasOwnProperty(importProp)){
                        list = model.getList(importProp);
                        if(list === undefined){ // new list
                            model.addList(importProp);
                            list = model.getList(importProp);
                        }
                        for (i = 0; i < newList.length; i += 1) {
                            if(model.isItemNameUniqueInList(list, newList[i])){
                                model.addItemToList(list, newList[i]);
                            }
                        }
                        
                    }
                }
                model.save();
                return true;
            }
        };
    }
    controller = createController(createModel(createLocalStorage(win)), createView());
    // JQuery Mobile page events & handlers
    $('#firstPage').live('pageinit', function () {
        controller.redrawFirstPage();
    });
    $('#addListPage').live('pageinit', function () {
        controller.initAddListPage();
    });
    $('#addItemPage').live('pageinit', function () {
        controller.initAddItemPage();
    });
    $('#generateItemsPage').live('pageinit', function () {
        var restrictToNumbers = function (event) {
            var charCode = event.which || event.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)){
                return false;
            }
            return true;
        };
        $('#from').keydown(restrictToNumbers);
        $('#to').keydown(restrictToNumbers);
        controller.initGenerateItemsPage();
    });
    $('#viewListPage').live('pageinit', function () {
        $('#random').click(function () {
            controller.selectRandomItem();
        });
    });
    $('#viewItemPage').live('pageinit', function () {
        var selectAnother = $('#selectAnother');
        selectAnother.click(function () {
            controller.selectRandomItem();
        });
        $("#viewItemPage").bind('keyup', function (event) {
            return controller.ifEnterClickEscClose(event, selectAnother, $('#viewItemPage'));
        });
    });
    $('#importListsPage').live('pageinit', function () {
		function textEntered () {
            if($('#listsData').val().trim().length === 0) {
                $('#import').addClass('ui-disabled');
            }else{
                $('#import').removeClass('ui-disabled');
            }
        }
        $('#import').addClass('ui-disabled');
        $('#listsData').keyup(textEntered);
		$('#importListsPage').live('input paste', textEntered);
        $('#import').click(function () {
            if (controller.importLists($('#listsData').val().trim())) {
                controller.redrawFirstPage();
                $('#importListsPage').dialog('close');
            }
        });
        $("#importListsPage").bind('keyup', function (event) {
            return controller.ifEnterClickEscClose(event, $('#import'), $('#importListsPage'));
        });
    });
    $('#exportListsPage').live('pageinit', function () {
      var exportListsData = $('#exportListsData');
      exportListsData.click(function (){
         exportListsData.select();
      });
      exportListsData.keypress(function () {
          return false;
      });
      $("#exportListsPage").bind('keyup', function (event) {
            return controller.ifEnterClickEscClose(event, $('#export'), $('#exportListsPage'));
      });
    });
    $('#viewListPage').live('pagebeforeshow', function () {
        controller.enableDisableRandom();
        controller.drawSelectedList();
    });
    $('#addListPage').live('pagehide', function () {
        $('#listName').val('');
        $('#addListOk').addClass('ui-disabled');
    });
    $('#addListPage').live('pageshow', function () {
        $('#listName').focus();
    });
    $('#generateItemsPage').live('pageshow', function () {
        $('#from').focus();
    });
    $('#generateItemsPage').live('pagehide', function () {
        $('#from').val('');
        $('#to').val('');
        $('#addItemsOk').addClass('ui-disabled');
    });
    $('#addItemPage').live('pagehide', function () {
        $('#itemName').val('');
        $('#addItemOk').addClass('ui-disabled');
    });
    $('#addItemPage').live('pageshow', function () {
        $('#itemName').focus();
    });
    $('#importListsPage').live('pageshow', function () {
        $('#listsData').focus();
    });
    $('#importListsPage').live('pagehide', function () {
        $('#import').addClass('ui-disabled');
        $('#listsData').val("");
        $('#importErrorText').hide("");
    });
    $('#exportListsPage').live('pageshow', function () {
        $('#exportListsData').val(controller.getDbJSONString());
        $('#exportListsData').focus();
        $('#exportListsData').select();
    });
    $('#exportListsPage').live('pagehide', function () {
        $('#exportListsData').val("");
    });
    // despite not using global name space & being immutable, keep the application testable
    return {
        createModel : createModel,
        createView : createView,
        createController : createController,
        createLocalStorage : createLocalStorage
    };
}(window));