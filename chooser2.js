var randomChooser = {};
randomChooser.model = (function () {
	var lists = {}, selectedList = undefined;
	isListNameUnique = function (listName) {
		return lists[listName] === undefined;
	}
	return {
		addList : function (listName) {
			var list = [];
			lists[listName] = list;
		},
		deleteList : function (listName) {
			delete lists[listName];
		},
		setSelectedList : function (listName) {
			selectedList = listName;
		},
		getSelectedList : function () {
			return selectedList;
		},
		isListNameUnique : function (listName) {
			return isListNameUnique(listName);
		},
		isItemNameUniqueInSelectedList : function (itemName) {
			var i = 0, currentlySelectedList = lists[selectedList];
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
			var currentlySelectedList = lists[selectedList];
			currentlySelectedList[currentlySelectedList.length] = itemName;
		},
		deleteItem : function (itemName) {
			var i = 0, list = lists[selectedList], item = undefined;
			for (; i<list.length; i++) {
				item = list[i];
				if (item == itemName) {
					if(i === 0){
						list.splice(0,1);
					}else{
						list.splice(i,i);
					}
				}
			}
		},
		getSelectedListArray : function () {
			return randomChooser.model.getList(selectedList);
		},
		getList : function (listName) {
			return lists[listName];
		}
	};
})();
randomChooser.view = (function () {
	return {
		redrawLists : function (listNames) {
			var i = 0;
			$('#lists').empty();
			listNames.sort();
			for(; i<listNames.length; i++){
				randomChooser.view.addList(listNames[i]);
			}
			$('#lists').listview('refresh');
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
		drawSelectedList : function (listName, list) {
			$('#listNameLabel').text(listName);
			var i = 0;
			$('#listItems').empty();
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
			if(randomChooser.model.isListNameUnique(listName)){
				randomChooser.model.addList(listName);
				randomChooser.view.redrawLists(randomChooser.model.getListNames());
				return true;
			}
			return false;
		},
		setSelectedList : function (selectedListName) {
			randomChooser.model.setSelectedList(selectedListName);
		},
		drawList : function (listName) {
			randomChooser.view.drawSelectedList(listName, randomChooser.model.getList(listName));
		},
		drawSelectedList : function () {
			randomChooser.controller.drawList(randomChooser.model.getSelectedList());
		},
		deleteList : function (listName) {
			randomChooser.model.deleteList(listName);
			randomChooser.view.redrawLists(randomChooser.model.getListNames());
		},
		deleteItem : function (itemName) {
			randomChooser.model.deleteItem(itemName);
			randomChooser.controller.enableDisableRandom();
			randomChooser.view.drawSelectedList(randomChooser.model.getSelectedList(), randomChooser.model.getSelectedListArray());
		},
		addItemToSelectedList : function (itemName) {
			randomChooser.model.addItem(itemName);
			randomChooser.view.drawSelectedList(randomChooser.model.getSelectedList(), randomChooser.model.getSelectedListArray());
		},
		enableDisableRandom : function () {
			randomChooser.view.setRandomDisabled(
				randomChooser.model.getSelectedList() === undefined ||
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
$('#addListPage').live('pageinit', function(event) {
	var addListOk = $('#addListOk');
	addListOk.addClass('ui-disabled');
	$('#listName').keyup(function (event) {
		var listName = event.currentTarget.value.trim();
		if(listName.length === 0 || !randomChooser.model.isListNameUnique(listName)) {
			addListOk.addClass('ui-disabled');
		}else{
			addListOk.removeClass('ui-disabled');
		}
	});
	addListOk.click(function () {
		randomChooser.controller.addList( $('#listName').val().trim() );
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
});
$('#viewListPage').live('pageshow', function(event) {
	randomChooser.controller.enableDisableRandom();
	randomChooser.controller.drawSelectedList();
});
$('#addListPage').live('pagehide', function(event, ui) {
	$('#listName').val('');
	$('#addListOk').addClass('ui-disabled');
});
$('#addItemPage').live('pagehide', function(event, ui) {
	$('#itemName').val('');
	$('#addItemOk').addClass('ui-disabled');
});