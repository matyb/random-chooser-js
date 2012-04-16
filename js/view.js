var randomChooser;
if(!randomChooser) {
  randomChooser = {};
}
randomChooser.createView = function () {
  var createDeleteAnchor = function (anchorText) {
    return $('<a/>', {
      'href' : '#deletePage',
      'data-transition' : 'slide',
      'data-role' : 'button', 
      'data-rel' : 'dialog', 
      'data-transition' : 'pop',
      'text' : anchorText
    });
  };
  function addToList (viewAnchorText, deleteAnchorText, htmlListId, deleteClick, viewClick, viewPageId) {
    var listViewAnchor, deleteListAnchor;
    listViewAnchor = $('<a/>', {
      'text' : viewAnchorText
    });
    if(viewPageId){
      listViewAnchor[0].href = viewPageId;
      listViewAnchor[0]['data-transition'] = 'slide';
    }
    deleteListAnchor = createDeleteAnchor(deleteAnchorText);
    deleteListAnchor[0].onclick = deleteClick;
    listViewAnchor[0].onclick = viewClick;
    $(htmlListId).append($('<li/>', {}).append(listViewAnchor).append(deleteListAnchor));
  }
  function addList (listName, deleteClick, viewClick) {
    addToList(listName, 'Delete List', '#lists', deleteClick, viewClick, '#viewListPage');
  }
  function addItem (listName, deleteClick) {
    addToList(listName, 'Delete Item', '#listItems', deleteClick, function(){});
  }
  return {
    redrawLists : function(list) {
      var i = 0, lists = $('#lists');
      lists.empty();
      lists.listview('refresh');
      for(; i < list.length; i++) {
        addList(list[i].name, list[i].deleteClick, list[i].viewClick);
      }
      lists.listview('refresh');
    },
    addList : function(listName, deleteClick, viewClick) {
      addList(listName, deleteClick, viewClick);
    },
    addItem : function(itemName, deleteClick) {
      addItem(itemName, deleteClick);
    },
    drawList : function(listName, list) {
      var i;
      $('#listNameLabel').text("list: " + listName);
      $('#listItems').empty();
      $('#listItems').listview('refresh');
      list.sort();
      for(i = 0; i < list.length; i++) {
        addItem(list[i].name, list[i].deleteClick);
      }
      $('#listItems').listview('refresh');
    },
    setRandomDisabled : function(disabled) {
      if(disabled) {
        $('#random').addClass('ui-disabled');
      } else {
        $('#random').removeClass('ui-disabled');
      }
    },
    displayItem : function(itemName) {
      $('#itemNameLabel').text(itemName);
    },
    askToDelete : function(name, deleteClick) {
      var deleteButton = $('#delete'), deletePage = $('#deletePage'), deleteLabel = $('#deleteLabel');
      deleteLabel.text(name);
      deleteButton.unbind('click');
      deleteButton.click(deleteClick);
      deleteButton.click(function () {
        deletePage.dialog ('close');
      });
      deletePage.unbind('keyup');
      deletePage.bind('keyup', function(event) {
        if(event.keyCode === 13 || event.which === 13) {
          deleteButton.click();
        }
        if(event.keyCode === 27 || event.which === 27) {
          deletePage.dialog ('close');
        }
        return false;
      });
    }
  };
};