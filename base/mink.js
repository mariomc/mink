// # Mink Base module
// This module defines utility methods and properties used by the framework

// ## UMD Definition
// Every module - even the base - is wrapped in an UMD definition, making it easier to integrate with your development process
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // ### AMD
    // To use with any AMD loader such as Require or Almond
    define([], function(){
      return (window.mink = factory());
    });
  } else if (typeof exports === 'object') {
    // ### Node/CommonJS
    // To use with Browserify
    window.mink = module.exports = factory();
  } else {
    // ### Browser globals
    // Plain and simple browser globals
    window.mink = factory();
  }
}(function () {
  'use strict';

  // Gets the helper API from the current script element's data attribute. This way, you can define a specific helper without having to create a script tag before mink.
  function currentScript() {
    var cs = document.currentScript;
    if(!cs){
      // @TODO: This approach has a shortcoming with AMD loading.
      var scripts = document.getElementsByTagName('script');
      cs = scripts[scripts.length - 1];
    }
    return window[cs.getAttribute('data-helper')];
  }

  // If mink is previously defined, we use that definition.
  var mink = window.mink || {};

  // ## Helper hierarchy
  // Programmatical definition comes first. Definition in data-attribute comes second. Zepto comes third for mobile first as a default, if present. Ender comes after as our packaged helper. jQuery after that. kInk and $ if all else fails.
  mink.helper = mink.$ = mink.$ || currentScript() || window.Zepto || window.ender || window.jQuery || window.kink || window.$ || false;


  // Warn the user if no helper is defined
  if (!mink.$) {
    console.warn('No helper ($) available!');
  }

  // This property will contain pointers to all mink module constructors
  mink.fn = mink.fn || {};

  // A pointer for mink inside the helper API.
  mink.$.fn.mink = mink;

  // ## Module Defaults
  // mink modules default settings. These sensible defaults will be overriden by module defaults and runtime options
  mink.defaults = mink.defaults || {
    // The name of the module
    name: 'mink',
    // A unique identifier used to namespace events, and preserve the module instance
    namespace: 'minkModule',
    // Whether debug content should be outputted to console
    debug: false,
    // Whether extra debug content should be outputted
    verbose: false,
    // Whether to track performance data
    performance: false,
    // A flag to auto initialize the module
    autoInit: true
  };

  // ## Module registry
  // An internal registry of all the module instances in the page
  mink._registry = mink._registry || {};

  // ## Module factory
  // Method to create module constructors.
  mink.factory = function(defaults) {
    defaults = defaults || {};
    function mod(element, options){
      var
        $ = mink.$,
        // Extend settings to merge run-time settings with defaults
        settings = $.extend({}, $.fn.mink.defaults, defaults, options || {}),

        // Alias settings object for convenience and performance
        namespace = settings.namespace,
        performance = [],
        module = this;

      // Initialize the registry key for the modules if it's not set yets
      mink._registry[settings.name] = mink._registry[settings.name] || [];

      // ### Module Properties and Methods
      // Define namespaces for storing module instance and binding events
      this.queryArguments = [].slice.call(arguments, 3);

      // #### Module Namespace
      // Used to identify the module metada within a namespace
      this.moduleNamespace = namespace;

      // #### Module Event Namespace
      // Used to identify all event handlers the module uses
      this.eventNamespace = '.' + namespace;

      // #### All Modules instances
      // A reference to all modules instances of the same type. This is useful if your module wants to interact with other instances in the page
      this.allModules = mink._registry[settings.name];

      // #### Module ID
      // The module index inside the allModule reference
      // @TODO: Get a better way to handle this
      this.moduleId = this.allModules.push(this) - 1;

      // #### Element
      // The element the module instance is refering to
      this.element = element;

      // #### $element
      // The module element wrapped as an helper API object
      this.$element = $(element);

      // #### Settings
      // A reference to the module settings
      this.settings = settings;

      // #### Attributes
      // Data attributes of the element
      this.attrs = this.$element.data();

      // #### Instance
      // The module instance is stored and retrieved in namespaced DOM metadata
      this.instance = this.$element.data(this.moduleNamespace);

      // #### Performance
      // Called on each debug statement and logs the time since the last debug statement.
      this.performance = {
        
        log: function (message) {
          var
            currentTime,
            executionTime,
            previousTime;
          if (module.settings.performance) {
            currentTime = new Date().getTime();
            previousTime = module.time || currentTime;
            executionTime = currentTime - previousTime;
            module.time = currentTime;
            performance.push({
              'Element': element,
              'Name': message[0],
              'Arguments': [].slice.call(message, 1)[0] || '',
              'Execution Time': executionTime
            });
          }
          clearTimeout(module.performance.timer);
          module.performance.timer = setTimeout(module.performance.display, 100);
        },
        
        display: function () {
          var
            title = module.settings.name + ':',
            totalTime = 0;
          module.time = false;
          clearTimeout(module.performance.timer);
          $.each(performance, function (index, data) {
            totalTime += data['Execution Time'];
          });
          title += ' ' + totalTime + 'ms';
          if (this.moduleSelector) {
            title += ' \'' + this.moduleSelector + '\'';
          }
          if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
            console.groupCollapsed(title);
            if (console.table) {
              console.table(performance);
            } else {
              $.each(performance, function (index, data) {
                console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
              });
            }
            console.groupEnd();
          }
          performance = [];
        }
      };

      // Initialize module if autoInit is set to true
      if(settings.autoInit) {
        this.initialize();
      }

      return this;
    }

    mod.prototype = {

      // #### Initialize Method
      // This method is the first one to be called once a module is instantiated
      // Every module should implement their own method.
      initialize: function () {
        console.warn('Your module is lacking an initialize method');
      },

      // #### Destroy Method
      // Every module should implement their own destroy method
      // This method is responsible to restore the DOM to the same state as it was before the module was instantiated. This includes - but is not limited to - removing the following:
      // * event listeners, 
      // * removing CSS classes
      // * generated DOM elements and attributes
      destroy: function () {
        console.warn('Your module is lacking a destroy method');
      },

      // #### Setting Method
      // Get or set setting properties
      setting: function (name, value) {
        if ($.isPlainObject(name)) {
          $.extend(this.settings, name);
        } else if (value !== undefined) {
          this.settings[name] = value;
        } else {
          return this.settings[name];
        }
      },

      // #### Internal Method
      // Module internals can be set or retrieved as well
      internal: function (name, value) {
        if ($.isPlainObject(name)) {
          $.extend(this, name);
        } else if (value !== undefined) {
          this[name] = value;
        } else {
          return this[name];
        }
      },

      // #### Debug Method
      // Debug pushes arguments to the console formatted as a debug statement
      debug: function () {
        if (this.settings.debug) {
          if (this.settings.performance) {
            this.performance.log(arguments);
          } else {
            this.debug = Function.prototype.bind.call(console.info, console, this.settings.name + ':');
            this.debug.apply(console, arguments);
          }
        }
      },

      // #### Verbose Method
      // Calling verbose internally allows for additional data to be logged which can assist in debugging
      verbose: function () {
        if (this.settings.verbose && this.settings.debug) {
          if (this.settings.performance) {
            this.performance.log(arguments);
          } else {
            this.verbose = Function.prototype.bind.call(console.info, console, this.settings.name + ':');
            this.verbose.apply(console, arguments);
          }
        }
      },

      // #### Error Method
      // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
      error: function () {
        this.error = Function.prototype.bind.call(console.error, console, this.settings.name + ':');
        this.error.apply(console, arguments);
      },

      // #### Invoke Method
      // Invoke is used to match internal functions to string lookups.
      // `$('.foo').example('invoke', 'set text', 'Foo')`
      // Method lookups are lazy, looking for many variations of a search string
      // For example 'set text', will look for both `setText : function(){}`, `set: { text: function(){} }`
      // Invoke attempts to preserve the 'this' chaining unless a value is returned.
      // If multiple values are returned an array of values matching up to the length of the selector is returned
      invoke: function (query, passedArguments, context) {
        var
        maxDepth,
        found,
        response;
        passedArguments = passedArguments || this.queryArguments;
        context = context || this.instance || this;
        var module = this;
        if (typeof query === 'string' && module.instance !== undefined) {
          query = query.split(/[\. ]/);
          maxDepth = query.length - 1;
          $.each(query, function (depth, value) {
            var camelCaseValue = (depth !== maxDepth) ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1) : query;
            if ($.isPlainObject(module.instance[value]) && (depth !== maxDepth)) {
              module.instance = module.instance[value];
            } else if ($.isPlainObject(module.instance[camelCaseValue]) && (depth !== maxDepth)) {
              module.instance = module.instance[camelCaseValue];
            } else if (module.instance[value] !== undefined) {
              found = module.instance[value];
              return false;
            } else if (module.instance[camelCaseValue] !== undefined) {
              found = module.instance[camelCaseValue];
              return false;
            } else {
              module.error(error.method, query);
              return false;
            }
          });
        }
        if ( $.isFunction(found) ) {
          response = found.apply(context, [passedArguments]);
        } 
        else if (found !== undefined) {
          response = found;
        }

        return response;
      },

      // #### DataAttributes Method
      // Reads and sets the setting object depending on their data-attributes
      dataAttributes: function () {
        this.debug('Setting data attributes settings');
        if(this.settings.metadata){
          var module = this;
          $.each(this.settings.metadata, function (index, value) {
            if (module.attrs[index] !== undefined) {
              module.settings[index] = module.attrs[index];
            }
          });
        } 
      },

      // #### Throttling Method
      // Throttles a function to a certain delay.
      throttle: function(func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      }
    };

    return mod; 
  };

  // ## Expose Method
  // Expose module in the window, inside the mink object and as a method of the helper API
  mink.expose = function (name, Constructor) {
    // Saves the old module definition
    var old = $.fn[name];

    mink.fn[name] = mink.$.fn[name] = function (parameters) {

      var
      // Store a reference to the module group, this can be useful to refer to other modules inside each module
      $allModules = $(this),

      // Preserve original arguments to determine if a method is being invoked
      query = arguments[0],

      // Check if we've invoked a method
      methodInvoked = (typeof query === 'string'),
      returnedValue;

      // Iterate over all elements to initialize module

      $allModules
        .each(function () {
          var settings = ($.isPlainObject(parameters)) ? parameters : {};

          settings.autoInit = false;
          
          var module = new Constructor(this, settings);

          if (methodInvoked) {
            if (module.instance === undefined) {
              module.initialize();
            }
            var response = module.invoke(query);

            // ### Invocation response
            // If a user passes in multiple elements invoke will be called for each element and the value will be returned in an array
            // For example ``$('.things').example('has text')`` with two elements might return ``[true, false]`` and for one element ``true``
            if ($.isArray(returnedValue)) {

              returnedValue.push(response);
            } else if (returnedValue !== undefined) {

              returnedValue = [returnedValue, response];
            } else if (response !== undefined) {

              returnedValue = response;
            }
          }
          // if no method call is required we simply initialize the plugin, destroying it if it exists already
          else {
            if (module.instance !== undefined) {
              module.destroy();
            }
            module.initialize();
          }
      });
      if ( returnedValue !== undefined ){

        return returnedValue;
      } else {

        return this;
      }
    };

    // Expose the constructor
    mink.$.fn[name].constructor = Constructor;

    // ## noConflict method for the helper API interface
    mink.$.fn[name].noConflict = function () {
      mink.$.fn[name] = old;
      return this;
    };

  };

  return mink;

}));
