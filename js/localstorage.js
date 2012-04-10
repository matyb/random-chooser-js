var randomChooser;
if (!randomChooser) {
	randomChooser = {};
}
randomChooser.win = window;
randomChooser.createLocalStorage = function () {
  var isLocalStorageSupported = false;
  try {
    isLocalStorageSupported = 'localStorage' in randomChooser.win && randomChooser.win['localStorage'] !== null;
  } catch (e) {}
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
