var model = (function(){
	var lists = {}, selectedListTitle;
	return {
		getSelectedList : function () {
			return lists[selectedListTitle];
		},
		setSelectedListTitle : function (newlySelectedTitle) {
			selectedListTitle = newlySelectedTitle;
		},
		newList : function(listName){
			lists[value] = [];
		},
		isValueInSelectedList : function (value) {
			var list = getSelectedList();
			if (list) {
				for (var j=0;j<list.length;j++) {
					var listEntry = list[j];
					if (listEntry == lineText) {
						return true;
					}
				}
			}
			return false;
		}
	};
})();
var view = (function () {
	var listTitle = "Selected List: ", listsTitle = "Lists:", noListSelected = "<No List Selected>";
	return {
		reset : function () {
			document.getElementById("listTitle").innerHTML = listTitle + noListSelected;
			document.getElementById("listsTitle").innerHTML = listsTitle + noListSelected;
			document.getElementById("randomButton").disabled = true;
		},
		showTitle : function (newlySelectedTitle) {
			document.getElementById("listTitle").innerHTML = listTitle + newlySelectedTitle;
			document.getElementById("randomButton").disabled = false;
		},
		enableAddToListButton : function (enable) {
			document.getElementById("addToListButton").disabled = !enable;
		},
		enableAddListButton : function (enabled) {
			document.getElementById("addListButton").disabled = !enabled;
		},
		getCurrentTextValue : function () {
			return document.getElementById("value").value.trim();
		},
		addList : function (onclick) {
			var lineItem = document.createElement("li");
			var value = view.getCurrentTextValue();
			lineItem.appendChild(document.createTextNode(value))
			lineItem.onclick = onclick;
			document.getElementById("lists").appendChild(lineItem);
			document.getElementById("addListButton").disabled = true;
			return value;
		}
	};
})();
var controller = (function () {
	var enableAddToListButton = function () {
		return model.getSelectedList() != undefined && !model.isValueInSelectedList(value);
	}
	var enableAddListButton = function () {
		// TODO this looks like view code below, could use model instead of document?
		var value = view.getCurrentTextValue();
		var lists = document.getElementById("lists");
		var addListButtonEnabled = true;
		for (var i=0;i<lists.childNodes.length;i++) {
			var lineItem = lists.childNodes[i];
			var lineText = lineItem.innerHTML;
			if (lineText == value) {
				addListButtonEnabled = false;
			}
		}
		return addListButtonEnabled;
	}
	return {
		setSelectedListTitle : function (newlySelectedTitle) {
				model.setSelectedListTitle(newlySelectedTitle);
				view.showTitle(newlySelectedTitle);
				view.enableAddToListButton(enableAddToListButton());
		},
		valueKeyPressed : function () {
			var value = view.getCurrentTextValue();
			view.enableAddListButton(enableAddListButton() && value.length !== 0)
			view.enableAddToListButton(enableAddToListButton() && value.length !== 0);
		},
		addList : function () {
			var value = view.getCurrentTextValue();
			model.newList(view.addList(function () {
				controller.setSelectedListTitle(value);
			}));
		}
	}
	
})();
(function () {
	"use strict";
	var doc = window.document, random_chooser = {}, console = window.console || {};
	random_chooser.firstLoad = function () {
		// initialize logging
		random_chooser.initConsole();
		// prepare view
		doc.getElementById("addListButton").disabled = true;
		doc.getElementById("addToListButton").disabled = true;
		view.reset();
		// attach listeners
		doc.getElementById("value").onkeyup = function () {
			controller.valueKeyPressed();
		};
		doc.getElementById("addListButton").onclick = function () {
			controller.addList();
		};
		doc.getElementById("addToListButton").onclick = function () {
			random_chooser.addToList();
		};
		doc.getElementById("randomButton").onclick = function () {
			random_chooser.randomlySelect();
		};
	};
	random_chooser.initConsole = function () {
		console.log = console.log || function () {};
		console.warn = console.warn || function () {};
		console.error = console.error || function () {};
		console.info = console.info || function () {};
	};
	random_chooser.enterPressed = function () {
		if (!doc.getElementById("randomButton").disabled) {
			random_chooser.randomlySelect();
		} else if (!doc.getElementById("addToList").disabled) {
			random_chooser.addToList();
		} else if (!doc.getElementById("addList").disabled) {
			random_chooser.addList();
		} else {
			console.info("no buttons enabled");
		}
	};
	random_chooser.randomlySelect = function () {
		console.info("randomly selected");
	};
	random_chooser.addToList = function () {
		var selectedList = model.getSelectedList();
		var value = doc.getElementById("value").value;
		selectedList[selectedList.length] = value;
		doc.getElementById("addToListButton").disabled = true;
	};
	random_chooser.firstLoad();
})();
