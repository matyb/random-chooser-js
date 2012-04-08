var randomChooser = {};
randomChooser.model = (function () {
	var lists = undefined, selectedListName = undefined, db = (function() {
		var isLocalStorageSupported = false;
		try {
			isLocalStorageSupported = 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {}
		if (isLocalStorageSupported) {
			return window.localStorage;
		} else {
			return (function () {
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
		}
	})();
	lists = db.getItem('random-chooser-lists');
	if(lists === null || lists === undefined){
		lists = {};
		db.setItem('random-chooser-lists', JSON.stringify(lists));
	}else{
		lists = JSON.parse(lists);
	}
	return {
		addList : function (listName) {
			lists[listName] = [];
			db.setItem('random-chooser-lists', JSON.stringify(lists));
		},
		deleteList : function (listName) {
			delete lists[listName];
			db.setItem('random-chooser-lists', JSON.stringify(lists));
		},
		setSelectedListName : function (listName) {
			selectedListName = listName;
		},
		getSelectedListName : function () {
			return selectedListName;
		},
		isItemNameUniqueInSelectedList : function (itemName) {
			var i = 0, currentlySelectedList = lists[selectedListName];
			if( currentlySelectedList !== undefined) {
				for (; i<currentlySelectedList.length; i++) {
					if (currentlySelectedList[i] === itemName) {
						return false;
					}
				}
			}
			return true;
		},
		getListNames : function () {
			var listNames = [], i = undefined, j = 0;
			for (i in lists) {
				listNames[j++] = i;
			}
			return listNames;
		},
		addItem : function (itemName) {
			var currentlySelectedList = lists[selectedListName];
			currentlySelectedList[currentlySelectedList.length] = itemName;
			db.setItem('random-chooser-lists', JSON.stringify(lists));
		},
		deleteItem : function (itemName) {
			var i = 0, list = lists[selectedListName], item = undefined;
			for (; i<list.length; i++) {
				item = list[i];
				if (item == itemName) {
					list.splice(i,1);
				}
			}
			db.setItem('random-chooser-lists', JSON.stringify(lists));
		},
		getSelectedListArray : function () {
			return randomChooser.model.getList(selectedListName);
		},
		getList : function (listName) {
			return lists[listName];
		}
	};
})();
randomChooser.view = (function () {
	return {
		redrawLists : function (listNames) {
			var i = 0, lists = $('#lists');
			lists.empty();
			lists.listview('refresh');
			listNames.sort();
			for(; i<listNames.length; i++){
				randomChooser.view.addList(listNames[i]);
			}
			lists.listview('refresh');
		},
		addList : function (listName) {
			var listViewAnchor = undefined, deleteListAnchor = undefined;
			listViewAnchor = $('<a/>', {
					'href' : '#viewListPage',
				    'data-transition': 'slide',
				    'text': listName
			});
			deleteListAnchor = $('<a/>', {
				    'data-transition': 'slide',
				    'text': 'Delete List'
			});
			deleteListAnchor[0].onclick = function () {
				randomChooser.controller.deleteList(listName);
			};
			listViewAnchor[0].onclick = function () {
				randomChooser.controller.setSelectedList(listName);
			};
			$('#lists').append($('<li/>', {}).append(listViewAnchor).append(deleteListAnchor));
		},
		addItem : function (itemName) {
			var listViewAnchor = undefined, deleteListAnchor = undefined;
			listViewAnchor = $('<a/>', {
					'text': itemName
			});
			deleteListAnchor = $('<a/>', {
				    'data-transition': 'slide',
				    'text': 'Delete List'
			});
			deleteListAnchor[0].onclick = function () {
				randomChooser.controller.deleteItem(itemName);
			};
			$('#listItems').append($('<li/>', {}).append(listViewAnchor).append(deleteListAnchor));
		},
		drawList : function (listName, list) {
			$('#listNameLabel').text("list: "+listName);
			var i = 0;
			$('#listItems').empty();
			$('#listItems').listview('refresh');
			list.sort();
			for(; i<list.length; i++){
				randomChooser.view.addItem(list[i]);
			}
			$('#listItems').listview('refresh');
		},
		setRandomDisabled : function (disabled) {
			if(disabled){
				$('#random').addClass('ui-disabled');
			}else{
				$('#random').removeClass('ui-disabled');
			}
		},
		displayItem : function (itemName) {
			$('#itemNameLabel').text(itemName);
		}
	};
})();
randomChooser.controller = (function () {
	return {
		addList : function (listName) {
			if(randomChooser.model.getList(listName) === undefined){
				randomChooser.model.addList(listName);
				randomChooser.controller.redrawFirstPage();
				return true;
			}
			return false;
		},
		redrawFirstPage : function () {
			randomChooser.view.redrawLists(randomChooser.model.getListNames());
		},
		setSelectedList : function (selectedListName) {
			randomChooser.model.setSelectedListName(selectedListName);
		},
		drawList : function (listName) {
			randomChooser.view.drawList(listName, randomChooser.model.getList(listName));
		},
		drawSelectedList : function () {
			randomChooser.controller.drawList(randomChooser.model.getSelectedListName());
		},
		deleteList : function (listName) {
			randomChooser.model.deleteList(listName);
			randomChooser.view.redrawLists(randomChooser.model.getListNames());
		},
		deleteItem : function (itemName) {
			randomChooser.model.deleteItem(itemName);
			randomChooser.controller.enableDisableRandom();
			randomChooser.controller.drawSelectedList();
		},
		addItemToSelectedList : function (itemName) {
			randomChooser.model.addItem(itemName);
			randomChooser.controller.drawSelectedList();
		},
		enableDisableRandom : function () {
			randomChooser.view.setRandomDisabled(
				randomChooser.model.getSelectedListName() === undefined ||
				randomChooser.model.getSelectedListArray().length <= 0);
		},
		selectRandomItem : function () {
			var randomlySelectedItem = randomChooser.model.getSelectedListArray()[
				Math.floor(Math.random()*randomChooser.model.getSelectedListArray().length)];
			randomChooser.view.displayItem(randomlySelectedItem);	
		}
	};
})();

$(document).ready(function () {

});
$('#firstPage').live('pageinit', function(event) {
	randomChooser.controller.redrawFirstPage();
});
$('#addListPage').live('pageinit', function(event) {
	var addListOk = $('#addListOk');
	addListOk.addClass('ui-disabled');
	$('#listName').keyup(function (event) {
		var listName = event.currentTarget.value.trim();
		if(listName.length === 0 || randomChooser.model.getList(listName) !== undefined) {
			addListOk.addClass('ui-disabled');
		}else{
			addListOk.removeClass('ui-disabled');
		}
	});
	addListOk.click(function () {
		randomChooser.controller.addList( $('#listName').val().trim() );
	});
	$("#addListPage").bind('keyup', function(event) {
		if(event.keyCode == 13  && addListOk[0].className.indexOf('ui-disabled') === -1) {
			addListOk.click();
		}
		return false;
	});
});
$('#addItemPage').live('pageinit', function(event) {
	var addItemOk = $('#addItemOk');
	addItemOk.addClass('ui-disabled');
	$('#itemName').keyup(function (event) {
		var itemName = event.currentTarget.value.trim();
		if(itemName.length === 0 || !randomChooser.model.isItemNameUniqueInSelectedList(itemName)) {
			addItemOk.addClass('ui-disabled');
		}else{
			addItemOk.removeClass('ui-disabled');
		}
	});
	addItemOk.click(function () {
		randomChooser.controller.addItemToSelectedList( $('#itemName').val().trim() );
	});
	$("#addItemPage").bind('keyup', function(event) {
		if(event.keyCode == 13 && addItemOk[0].className.indexOf('ui-disabled') === -1) {
			addItemOk.click();
		}
		return false;
	});
});
$('#viewListPage').live('pageinit', function(event) {
	$('#random').click(function () {
		randomChooser.controller.selectRandomItem();
	});
});
$('#viewItemPage').live('pageinit', function(event) {
	$('#selectAnother').click(function () {
		randomChooser.controller.selectRandomItem();
	});
	$("#viewItemPage").bind('keyup', function(event) {
		var selectAnother = $('#selectAnother');
		if(event.keyCode == 13 && selectAnother[0].className.indexOf('ui-disabled') === -1) {
			selectAnother.click();
		}
		return false;
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