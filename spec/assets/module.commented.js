// # Mink Example module
// This module illustrates the internals of a mink module

// ## UMD Definition
// Every module - even the base - is wrapped in an UMD definition, making it easier to integrate with your development process
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // ### AMD
    // To use with any AMD loader such as Require or Almond
    define(['../../base/mink'], function(mink){
      return factory(mink.$);
    });
  } else if (typeof exports === 'object') {
    // ### Node/CommonJS
    // To use with Browserify
    var mnk = require('../../base/mink.js');
    factory(mnk.$);
  } else {
    // ### Browser globals
    // Plain and simple browser globals
    factory(window.mink.$);
  }
}(function ($) {
  'use strict';

  // Every module should define their defaults
  var defaultSettings = {
    // Used in debug statements to refer to the module itself
    name: 'Test',
    // A unique identifier used to namespace events,and preserve the module instance
    namespace: 'minkTest'
  };

  // Use mink factory to create your base module constructor.
  
  // This adds several properties and methods to help you develop smoothly
  var Test = $.fn.mink.factory(defaultSettings);

  // To add methods to your constructor, simply extend its prototype
  $.extend(Test.prototype, {

    // # Required Methods

    // Your module should contain an initilize method, which will be the first method called
    initialize: function () {
      var module = this;
      this.debug('Initializing module for', this.element);
      // Event listeners should be attached to elements with the eventNamespace. This makes it easier to destroy the instance
      this.$element.on('click' + this.eventNamespace, function(){
        module.counter = module.counter ? ( module.counter + 1 ) : 1; 
        module.invoke('setText', module.counter);
      })
      this.instantiate();
    },

    // An instantiate method reads the settings from the module metadata (if any) and saves a reference of the instance in the element's metadata
    instantiate: function () {
      this.verbose('Storing instance of module');
      // @TODO A better name for this method. This reads the element's metadata and sets the setting object accordingly
      this.dataAttributes();
      this.instance = this;
      this.$element.data(this.moduleNamespace, this);
      // Set an html attribute to mark the element being in use. This is useful if you want to select all module elements using a css selector
      this.element.setAttribute('data-' + this.settings.name, '');
    },

    // Your module should contain a destroy method to remove the markup, events and atributes it added.
    destroy: function () {
      this.debug('Destroying module instance for ', this.element );
      this.$element.removeData(this.moduleNamespace).off(this.eventNamespace);
      this.element.removeAttribute('data-' + this.settings.name);
      // Delete the reference from the allModules array
      delete this.allModules[this.moduleId];
    },

    // # Optional methods
    // Custom methods should be declared as camelCase and use commonly used action verbs like 'has', 'is', 'get', 'set'.
    
    // Gets the text of an element
    getText: function () {
      this.verbose('Getting text value');
      return this.$element.text();
    },

    // Sets the text of an element
    setText: function(text) {
      this.verbose('Setting text value to', text);
      this.$element.text(text);
    }

  });

  // Expose the module on the window, the mink global object and as an fn inside the helper ($) library.
  $.fn.mink.expose('test', Test);

  // Always return the constructor so you can require it
  return Test;

}));