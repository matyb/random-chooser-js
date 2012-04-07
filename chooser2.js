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
		removeList : function (listName) {
			lists[listName] = undefined;
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
		getListNames : function () {
			var listNames = [], i = undefined, j = 0;
			for (i in lists) {
				listNames[j++] = i;
			}
			return listNames;
		}
	};
})();
randomChooser.view = (function () {
	return {
		redrawLists : function (listNames) {
			var lineItem = undefined, listName = undefined, listViewAnchor = undefined, deleteListAnchor = undefined, i = 0;
			$('#lists').empty();
			listNames.sort();
			for(; i<listNames.length; i++){
				// lineItem = document.createElement("li");
				listName = listNames[i];
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
				// listViewAnchor = document.createElement("a");
				// listViewAnchor.appendChild(document.createTextNode(listName));
				// listViewAnchor.onclick = function () {
					// randomChooser.controller.setSelectedList(value);
				// };
				// deleteListAnchor = document.createElement("a");
				// deleteListAnchor.appendChild(document.createTextNode("Delete List"));
				// deleteListAnchor.onclick = function () {
					// randomChooser.controller.deleteList(listName);
				// };
				// lineItem.appendChild(listViewAnchor);
				// lineItem.appendChild(deleteListAnchor);
				// $("#lists").append(lineItem);
			}
			$('#lists').listview('refresh');
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
			alert("Selected: " + selectedListName);
		},
		deleteList : function (listName) {
			alert("Delete: " + listName);
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
$('#addListPage').live('pagehide', function(event, ui) {
	$('#listName').val('');
	$('#addListOk').addClass('ui-disabled');
});