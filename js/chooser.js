var randomChooser;
if (!randomChooser) {
	randomChooser = {};
}
randomChooser.model = (function () {
	var lists = undefined, selectedListName = undefined, db = randomChooser.localStorage;
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
				if (item === itemName) {
					list.splice(i,1);
				}
			}
			db.setItem('random-chooser-lists', JSON.stringify(lists));
		},
		getSelectedList : function () {
			return randomChooser.model.getList(selectedListName);
		},
		getList : function (listName) {
			return lists[listName];
		}
	};
})();
randomChooser.view = {
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
randomChooser.controller = {
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
				randomChooser.model.getSelectedList().length <= 0);
		},
		selectRandomItem : function () {
			var randomlySelectedItem = randomChooser.model.getSelectedList()[
				Math.floor(Math.random()*randomChooser.model.getSelectedList().length)];
			randomChooser.view.displayItem(randomlySelectedItem);	
		}
	};
randomChooser.attachPageListeners();
