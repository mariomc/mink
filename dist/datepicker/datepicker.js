(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define(['../../base/mink', './pikaday'], function(mink, pikaday){
      return factory(mink.$, pikaday);
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    var mnk = require('../../base/mink.js');
    var pikaday = require('./pikaday.js');
    factory(mnk.$, pikaday);
  } else {
    // Browser globals
    factory(window.mink.$, window.Pikaday);
  }
}(function ($, Pikaday) {
  'use strict';

  var defaultSettings = {
    name: 'Datepicker',
    namespace: 'minkDatepicker'
  };

  var Datepicker = $.fn.mink.factory(defaultSettings);


  $.extend(Datepicker.prototype, {
    initialize: function() {
      this.settings.field = this.element;
      this.pika = new Pikaday(this.settings);
      $.extend(this, this.pika);
      this.instantiate();
    },
    instantiate: function() {
      this.instance = this;
      this.$element.data(this.moduleNamespace, this);
    },
    getInstance: function() {
      return this.pika;
    }
  });

  $.fn.mink.expose('datepicker', Datepicker);

  return Datepicker;

}));