function load() {

	if (!window.random_chooser){
		window.random_chooser = {};
		window.random_chooser.lists = {};
		firstLoad();
	}
	
};

function firstLoad(){
	// initialize logging
	initConsole();

	// prepare view
	document.getElementById("addListButton").disabled = true;
	document.getElementById("addToListButton").disabled = true;
	reset();

	// attach listeners
	document.getElementById("value").onkeyup = function() {
		valueKeyPressed();
	};
	
	document.getElementById("addListButton").onclick = function(){
		addList();
	};
	
	document.getElementById("addToListButton").onclick = function(){
		addToList();
	};
	
	document.getElementById("randomButton").onclick = function(){
		randomlySelect();
	};
	
};

function initConsole(){
	if (!window.console) console = {};
	console.log = console.log || function(){};
	console.warn = console.warn || function(){};
	console.error = console.error || function(){};
	console.info = console.info || function(){};
}

function valueKeyPressed() {
	var value = document.getElementById("value").value.trim();
	var lists = document.getElementById("lists");
	var addListButtonDisabled = false;
	for(var i = 0; i < lists.childNodes.length; i++) {
		var lineItem = lists.childNodes[i];
		var lineText = lineItem.innerHTML;
		if(lineText == value) {
			addListButtonDisabled = true;
		}
	}
	var addToListButtonDisabled = getSelectedList() == undefined || isValueInSelectedList(value);
	document.getElementById("addListButton").disabled = addListButtonDisabled || value.length == 0;
	document.getElementById("addToListButton").disabled = addToListButtonDisabled || value.length == 0;
}

function getSelectedList(){
	return window.random_chooser.lists[window.random_chooser.selected_list_title];
}

function isValueInSelectedList(lineText) {
	var list = getSelectedList();
	if(list) {
		addToListButtonDisabled = false;
		for(var j = 0; j < list.length; j++) {
			var listEntry = list[j];
			if(listEntry == lineText) {
				return true;
			}
		}
	}
	return false;
}


function enterPressed(){
	if(!document.getElementById("randomButton").disabled){
		randomlySelect();
	}
	else if(!document.getElementById("addToList").disabled){
		addToList();
	}
	else if(!document.getElementById("addList").disabled){
		addList();
	}
	else{
		console.info("no buttons enabled");
	}
}

function randomlySelect(){
	window.console.info("randomly selected");
};

function addList() {

	var lineItem = document.createElement("li");
	var valueTextBox = document.getElementById("value");
	var value = valueTextBox.value;
	lineItem.appendChild(document.createTextNode(value))
	lineItem.onclick = function() {
		document.getElementById("listTitle").innerHTML = listTitle() + value;
		document.getElementById("randomButton").disabled = false;
		window.random_chooser.selected_list_title = value;
		document.getElementById("addToListButton").disabled = getSelectedList() == undefined || isValueInSelectedList(valueTextBox.value);
	};
	
	document.getElementById("lists").appendChild(lineItem);
	document.getElementById("addListButton").disabled = true;
	var lists = window.random_chooser.lists;
	lists[value] = [];
};

function addToList(){
	var selectedList = getSelectedList();
	var value = document.getElementById("value").value;
	selectedList[selectedList.length] = value;
	document.getElementById("addToListButton").disabled = true;
}

function reset() {
	
	document.getElementById("listTitle").innerHTML = listTitle() + noListSelected();
	document.getElementById("listsTitle").innerHTML = listsTitle() + noListSelected();
	document.getElementById("randomButton").disabled = true;
	
};

function listTitle() {

	return "Selected List: ";

};

function listsTitle() {

	return "Lists:";

};

function noListSelected() {

	return "<No List Selected>";

};

