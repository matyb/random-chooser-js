var randomChooser;
if (!randomChooser) {
	randomChooser = {};
}
randomChooser.win = window;
randomChooser.alarm = alert;
randomChooser.createLocalStorage = function () {
  var isLocalStorageSupported = false;
  try {
    isLocalStorageSupported = 'localStorage' in randomChooser.win && randomChooser.win['localStorage'] !== null;
    randomChooser.win['localStorage'].setItem('random-chooser-saveable-test', 'success');
  } catch (e) {
    randomChooser.alarm('Random Chooser cannot save lists, you may have private browsing enabled.');
    isLocalStorageSupported = false;
  }
  if (isLocalStorageSupported) {
    return randomChooser.win.localStorage;
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
    }());
  }
};
randomChooser.localStorage = randomChooser.createLocalStorage();
