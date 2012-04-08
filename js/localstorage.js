var randomChooser;
if (!randomChooser) {
	randomChooser = {};
}
randomChooser.localStorage = (function() {
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
randomChooser.attachPageListeners = function () {
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
			if(event.keyCode === 13  && addListOk[0].className.indexOf('ui-disabled') === -1) {
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
			if(event.keyCode === 13 && addItemOk[0].className.indexOf('ui-disabled') === -1) {
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
		var selectAnother = $('#selectAnother');
		selectAnother.click(function () {
			randomChooser.controller.selectRandomItem();
		});
		$("#viewItemPage").bind('keyup', function(event) {
			if(event.keyCode === 13 && selectAnother[0].className.indexOf('ui-disabled') === -1) {
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
} 
