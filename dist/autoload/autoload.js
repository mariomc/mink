(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define(['../../base/mink'], function(mink){
      return factory(mink.$);
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    var mnk = require('../../base/mink.js');
    factory(mnk.$);
  } else {
    // Browser globals
    factory(window.mink.$);
  }
}(function ($) {
  'use strict';

  var defaultSettings = {
    name: 'Autoload',
    namespace: 'minkAutoload',
    eventNamespace: '.minkAutoload',
    modules: undefined,
    // Wait for document ready?
    wait: false
  };

  var Autoload = $.fn.mink.factory(defaultSettings);

  $.extend(Autoload.prototype, {

    initialize: function() {
      this.element = this.element || document.documentElement;
      this.$element = this.$element || $(this.element);
      this.debug('Initializing module for', this.element);
      this.instantiate();
    },

    instantiate: function() {
      this.verbose('Storing instance of module', this.element);
      this.instance = this;
      this.$element.data(this.moduleNamespace, this.instance);
      if(this.settings.wait) {
        var _this = this;
        $(document).ready(function(){
          _this.loadAll();
        });
      } else {
        this.loadAll();
      }

    },

    loadAll: function() {
      var _this = this;
      $.each($.fn.mink.fn, function(moduleName, Constructor){
        // Don't autoload autoload :P
        if (Constructor === Autoload) {
          return;
        }

        var selector = Constructor._defaults.autoloadSelector || '[class~="mink-' + moduleName + '"], [data-autoload="' + moduleName + '"]';
        
        if ( _this.settings.modules && _this.settings.modules[Constructor._name] ) {
          selector = _this.settings.modules[Constructor._name];
        }
        
        _this.load(moduleName, selector);

      });
    },

    load: function(name, selector) {
      var $elements = $(selector, this.element);
      $.fn.mink.$fn[name].call($elements, {
        autoloaded: true,
        debug: this.settings.debug,
        performance: this.settings.performance,
        verbose: this.settings.verbose
      });
    },
    
    destroy: function() {
      this.$element.removeData(this.moduleNamespace);
      delete this.allModules[this.moduleId];
      if(this.allModules.join('') == '') {
        this.allModules = [];
      }
    }

  });

  $.fn.mink.expose('autoload', Autoload);

  return Autoload;

}));