(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define(['../../base/mink', './matchM'], function(mink, matchM){
      return factory(mink.$, matchM);
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    var mnk = require('../../base/mink.js');
    var mM = require('matchM.js');
    factory(mnk.$, mM);
  } else {
    // Browser globals
    factory(window.mink.$, window.matchMedia);
  }
}(function ($, matchM) {
  'use strict';

  var defaultSettings = {
    name: 'Partial',
    namespace: 'minkPartial',
    eventNamespace: '.minkPartial',
    namedBreakpoints: {
      tiny: 'screen and (max-width: 320px)',
      small: 'screen and (min-width: 321px) and (max-width: 640px)',
      medium: 'screen and (min-width: 641px) and (max-width: 960px)',
      large: 'screen and (min-width: 961px) and (max-width: 1260px)',
      xlarge: 'screen and (min-width: 1261px)'
    },
    partials: {},
    onChange: function(){ }
  };

  function removeQuotes(string) {
    string = string.replace('\'', '', 'g').replace('\'', '', 'g');
    return string;
  }

  function getBreakpoint() {
    var style = null;
    var ret;
    if ( window.getComputedStyle && window.getComputedStyle(document.documentElement, '::before') ) {
      style = window.getComputedStyle(document.documentElement, '::before');
      style = style.content;
    } else {
      getComputedStyle = function(el) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
      style = getComputedStyle(document.getElementsByTagName('head')[0]);
      style = style.getPropertyValue('content');
    }
    try {
      ret = JSON.parse( removeQuotes(style) );
    } catch (ex) {
      ret = {};
    }
    return ret;
  }

  $.extend(defaultSettings.namedBreakpoints, getBreakpoint());

  var Partial = $.fn.mink.factory(defaultSettings);

  $.extend(Partial.prototype, {

    $win: $(window),

    initialize: function() {
      this.debug('Initializing module for', this.element);
      this.$win.off(this.eventNamespace).on('resize' + this.eventNamespace, $.proxy(this.throttle(this.resize, 50), this));
      this.instantiate();
    },

    instantiate: function(){
      this.verbose('Storing instance of module');
      this._cache = {};
      this.instance = this;
      // Storing instance on module in an array containing all instances
      this.dataAttributes();
      this.parseAttributes();
      this.$element.data(this.moduleNamespace, this.instance);
      this.element.setAttribute('data-' + this.settings.name.toLowerCase(), '');
      this.resize();
    },

    // Parse partials from data attributes
    parseAttributes: function() {
      var partials = this.$element.data('partials');
      if(partials) {
        var part = this.obj(partials);
        this.settings.partials = $.extend({}, this.settings.partials, part);
      }
    },

    trim: function (str) {
      return str.replace(/^\s+|\s+$/g, '');
    },

    parseScenario: function (scenario) {
      scenario[1] = this.trim(scenario[1]);
      var media_query   = scenario[1].substring(1, scenario[1].length-1),
          cached_split  = scenario[0].split(/[\s,]+/g),
          path          = cached_split[0],
          ret           = {};
      ret[this.trim(media_query)] = this.trim(path);
      return ret;
    },

    obj: function(attr) {
      var raw_arr = this.parseDataAttrs(attr),
          scenarios = {}, 
          i = raw_arr.length;
      if (i > 0) {
        while(i--){
          var split = raw_arr[i].split(/[,]+/g);
          if (split.length > 1) {
            var params = this.parseScenario(split);
            $.extend(scenarios, params);
          }
        }
      }
      return scenarios;
    },

    parseDataAttrs: function (attr) {
      var raw = attr.match(/\[(.*?)\]/g),
          i = raw.length, 
          output = [];
      while (i--) {
        output.push(raw[i].substring(1, raw[i].length - 1));
      }
      return output;
    },

    resize: function(){
      this.verbose('Resizing function');
      for (var i = 0; i < this.allModules.length; i++) {
        if(this.allModules[i]) {
          this.allModules[i].getMedia();
        }
      }
    },

    getMediaHash: function() {
      var mediaHash='';
      for (var queryName in this.settings.namedBreakpoints ) {
        mediaHash += matchM(this.settings.namedBreakpoints[queryName]).matches.toString();
      }
      return mediaHash;
    },

    getMedia: function(){
      this.currentMediaHash = this.getMediaHash();
      this.previousMediaHash = this.previousMediaHash || '';

      // Check if we have a different mediaQuery
      if(this.currentMediaHash !== this.previousMediaHash) {
        this.$element.trigger('mqchange');
        $.proxy(this.settings.onChange, this)();
        this.update();
      }

      this.previousMediaHash = this.currentMediaHash;
    },

    isMatch: function(breakpoint) {
      if(typeof breakpoint === 'object') {
        var minW = breakpoint['min']
      }
      return matchM(breakpoint).matches;
    },

    update: function() {
      this.verbose('Updating node');
      for (var prop in this.settings.partials ) {
        var breakpoint = this.settings.namedBreakpoints[prop] || prop;
        if(this.isMatch(breakpoint)){
          this.check(prop);
        }
      }
    },

    check: function(prop){
      var path = this.settings.partials[prop];
      if(/IMG/i.test(this.element.nodeName)) {
        this.element.src = path;
      } else {
        if( this._cache[prop] ) {
          this.$element.html(this._cache[prop]);
        } else {
          var _this = this;
          $.get(path, function (response) {
            _this._cache[prop] = response;
            _this.$element.html(response);
          });
        }
      }
    },

    destroy: function(){
      this.verbose('Destroying previous module for', this.element);
      this.$element.removeData(this.moduleNamespace).off(this.eventNamespace);
      this.element.removeAttribute('data-' + this.settings.name.toLowerCase());
      delete this.allModules[this.moduleId];
      // Check if there isn't any more modules so we can unsubscribe the resize event and logic
      if(this.allModules.join('') == '') {
        this.$win.off(this.eventNamespace);
      }
    }

  });

$.fn.mink.expose('partial', Partial);

return Partial;

}));