(function () {
	"use strict";
	var doc = window.document, random_chooser = {}, console = window.console || {};
	random_chooser.lists = {};
	random_chooser.reset = function () {
		doc.getElementById("listTitle").innerHTML = random_chooser.listTitle() + random_chooser.noListSelected();
		doc.getElementById("listsTitle").innerHTML = random_chooser.listsTitle() + random_chooser.noListSelected();
		doc.getElementById("randomButton").disabled = true;
	};
	random_chooser.firstLoad = function () {
		// initialize logging
		random_chooser.initConsole();
		// prepare view
		doc.getElementById("addListButton").disabled = true;
		doc.getElementById("addToListButton").disabled = true;
		random_chooser.reset();
		// attach listeners
		doc.getElementById("value").onkeyup = function () {
			random_chooser.valueKeyPressed();
		};
		doc.getElementById("addListButton").onclick = function () {
			random_chooser.addList();
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
	random_chooser.valueKeyPressed = function () {
		var value = doc.getElementById("value").value.trim();
		var lists = doc.getElementById("lists");
		var addListButtonDisabled = false;
		for (var i=0;i<lists.childNodes.length;i++) {
			var lineItem = lists.childNodes[i];
			var lineText = lineItem.innerHTML;
			if (lineText == value) {
				addListButtonDisabled = true;
			}
		}
		var addToListButtonDisabled = random_chooser.getSelectedList() == undefined || random_chooser.isValueInSelectedList(value);
		doc.getElementById("addListButton").disabled = addListButtonDisabled || value.length == 0;
		doc.getElementById("addToListButton").disabled = addToListButtonDisabled || value.length == 0;
	};
	random_chooser.getSelectedList = function () {
		return random_chooser.lists[random_chooser.selected_list_title];
	};
	random_chooser.isValueInSelectedList = function(lineText) {
		var list = random_chooser.getSelectedList();
		if (list) {
			for (var j=0;j<list.length;j++) {
				var listEntry = list[j];
				if (listEntry == lineText) {
					return true;
				}
			}
		}
		return false;
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
	random_chooser.addList = function () {
		var lineItem = doc.createElement("li");
		var valueTextBox = doc.getElementById("value");
		var value = valueTextBox.value;
		lineItem.appendChild(doc.createTextNode(value))
		lineItem.onclick = function () {
			doc.getElementById("listTitle").innerHTML = random_chooser.listTitle() + value;
			doc.getElementById("randomButton").disabled = false;
			random_chooser.selected_list_title = value;
			doc.getElementById("addToListButton").disabled = random_chooser.getSelectedList() == undefined || random_chooser.isValueInSelectedList(valueTextBox.value);
		};
		doc.getElementById("lists").appendChild(lineItem);
		doc.getElementById("addListButton").disabled = true;
		var lists = random_chooser.lists[value] = [];
	};
	random_chooser.addToList = function () {
		var selectedList = random_chooser.getSelectedList();
		var value = doc.getElementById("value").value;
		selectedList[selectedList.length] = value;
		doc.getElementById("addToListButton").disabled = true;
	};
	random_chooser.listTitle = function () {
		return "Selected List: ";
	};
	random_chooser.listsTitle = function () {
		return "Lists:";
	};
	random_chooser.noListSelected = function () {
		return "<No List Selected>";
	};
	random_chooser.firstLoad();
})();
