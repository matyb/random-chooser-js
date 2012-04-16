var randomChooser;
if(!randomChooser) {
  randomChooser = {};
}
randomChooser.controller = randomChooser.createController(randomChooser.createModel(), randomChooser.createView());
// JQuery Mobile page events & handlers
$('#firstPage').live('pageinit', function(event) {
  randomChooser.controller.redrawFirstPage();
});
$('#addListPage').live('pageinit', function(event) {
  randomChooser.controller.initAddListPage();
});
$('#addItemPage').live('pageinit', function(event) {
  randomChooser.controller.initAddItemPage();
});
$('#viewListPage').live('pageinit', function(event) {
  $('#random').click(function() {
    randomChooser.controller.selectRandomItem();
  });
});
$('#viewItemPage').live('pageinit', function(event) {
  var selectAnother = $('#selectAnother');
  selectAnother.click(function() {
    randomChooser.controller.selectRandomItem();
  });
  $("#viewItemPage").bind('keyup', function(event) {
    return randomChooser.controller.ifEnterInvokeClickHandler(event, selectAnother, $('#viewItemPage'));
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
