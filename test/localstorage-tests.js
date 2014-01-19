/*global module*/
var $, equal, ok, randomChooser, test;
$(document).ready(function(){
  module("Local Storage");
  test("localStorage is not reimplemented when present", 1, function() {
    var localStorageMock = {
      setItem : function (key, value) {} //do nothing - prevents exception
    };
    equal( randomChooser.createLocalStorage({
      localStorage : localStorageMock
    }), localStorageMock );
  });
  
  test("localStorage warning when private browsing restricts mutability of datastore", 1, function() {
    randomChooser.createLocalStorage({
      localStorage : { 
        setItem : function (key, value) {
          throw 'No access to local storage';
        } 
      },
      alert : function (text) {
        equal( text, "Random Chooser cannot save lists, you may have private browsing enabled." );
      }
    });
  });
  
  test("localStorage is implemented when not present", 2, function() {
    var createdLocalStorage = randomChooser.createLocalStorage( { alert : function () {} } );
    ok( createdLocalStorage.hasOwnProperty('getItem') );
    ok( createdLocalStorage.hasOwnProperty('setItem') );
  });
  
  test("localStorage implementation gets null", function() {
    var createdLocalStorage = randomChooser.createLocalStorage( { alert : function () {} } );
    equal( createdLocalStorage.getItem('meh'), null );
  });
  
  test("localStorage implementation sets and gets", function() {
    var obj = "{}", createdLocalStorage = randomChooser.createLocalStorage( { alert : function () {} } );
    createdLocalStorage.setItem('meh', obj);
    equal( createdLocalStorage.getItem('meh'), obj );
  });

});