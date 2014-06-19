(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define([], function(){
      return (root.mink = factory(root))
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    root.mink = module.exports = factory(root);
  } else {
    // Browser globals
    root.mink = factory(root);
  }
}(global || this, function (root) {
  // Get the helper API from the current script element. Just so you can redefine a custom helper without having to open a script tag before mink.

  function currentScript() {
    var cs = document.currentScript;
    if(!cs){
      // TODO: This approach has a shortcoming with AMD loading.
      var scripts = document.getElementsByTagName('script');
      cs = scripts[scripts.length - 1];
    }
    return root[cs.getAttribute('data-helper')];
  }

  // If mink is previously defined, use that definition.

  var mink = root.mink || {};

  // Helper hierarchy. 
  // Programmatical definition comes first. Definition in data-attribute comes second. Zepto comes third for mobile first as a default, if present. Ender comes after as our packaged helper. jQuery after that. kInk and $ if all else fails.

  mink.$ = mink.$ || currentScript() || root.Zepto || root.ender || root.jQuery || root.kink || root.$ || {};

  mink.helper = mink.$;

  mink.setHelper = function(helper){
    mink.$ = helper;
  };
  return mink;
}));
