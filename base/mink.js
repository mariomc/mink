(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define([], function(){
      return (window.mink = factory());
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    window.mink = module.exports = factory();
  } else {
    // Browser globals
    window.mink = factory();
  }
}(function () {

  // Get the helper API from the current script element. Just so you can redefine a custom helper without having to open a script tag before mink.
  function currentScript() {
    var cs = document.currentScript;
    if(!cs){
      // TODO: This approach has a shortcoming with AMD loading.
      var scripts = document.getElementsByTagName('script');
      cs = scripts[scripts.length - 1];
    }
    return window[cs.getAttribute('data-helper')];
  }

  // If mink is previously defined, use that definition.
  var mink = window.mink || {};

  // Helper hierarchy. 
  // Programmatical definition comes first. Definition in data-attribute comes second. Zepto comes third for mobile first as a default, if present. Ender comes after as our packaged helper. jQuery after that. kInk and $ if all else fails.
  mink.helper = mink.$ = mink.$ || currentScript() || window.Zepto || window.ender || window.jQuery || window.kink || window.$ || false;


  // Warn the user if no helper is defined
  if (!mink.$) {
    console.warn('No helper ($) available!');
  }

  // This property will contain a pointer to all mink module constructors
  mink.fn = mink.fn || {};

  // A pointer for mink inside the helper.
  mink.$.fn.mink = mink;

  mink.defaults = mink.defaults || {
    // Whether debug content should be outputted to console
    debug: false,
    // Whether extra debug content should be outputted
    verbose: false,
    // Whether to track performance data
    performance: false,
    // A flag to auto initialize the module
    autoInit: true 
  };

  // Module extension function
  mink.boilerplate = function(module){
    var performance = [];
    var moduleSelector = module.$element ? ( module.$element.selector || '' ) : false;
    var dataAttributes = module.$element.data();
    var returnedValue;
    var boilerplate = {
      setting: function (name, value) {
        if ($.isPlainObject(name)) {
          $.extend(module.settings, name);
        } else if (value !== undefined) {
          module.settings[name] = value;
        } else {
          return module.settings[name];
        }
      },

      // #### Internal
      // Module internals can be set or retrieved as well
      // `$(.foo').example('internal', 'behavior', function() { // do something });`
      internal: function (name, value) {
        if ($.isPlainObject(name)) {
          $.extend(module, name);
        } else if (value !== undefined) {
          module[name] = value;
        } else {
          return module[name];
        }
      },

      // #### Debug
      // Debug pushes arguments to the console formatted as a debug statement
      debug: function () {
        if (module.settings.debug) {
          if (module.settings.performance) {
            module.performance.log(arguments);
          } else {
            module.debug = Function.prototype.bind.call(console.info, console, module.settings.name + ':');
            module.debug.apply(console, arguments);
          }
        }
      },

      // #### Verbose
      // Calling verbose internally allows for additional data to be logged which can assist in debugging
      verbose: function () {
        if (module.settings.verbose && module.settings.debug) {
          if (module.settings.performance) {
            module.performance.log(arguments);
          } else {
            module.verbose = Function.prototype.bind.call(console.info, console, module.settings.name + ':');
            module.verbose.apply(console, arguments);
          }
        }
      },

      // #### Error
      // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
      error: function () {
        module.error = Function.prototype.bind.call(console.error, console, module.settings.name + ':');
        module.error.apply(console, arguments);
      },

      // #### Performance
      // This is called on each debug statement and logs the time since the last debug statement.
      performance: {
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
              'Element': module.element,
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
          if (moduleSelector) {
            title += ' \'' + moduleSelector + '\'';
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
      },

      // #### Invoke
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
        passedArguments = passedArguments || module.queryArguments;
        context = module.element || context;
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
          response = found.apply(context, passedArguments);
        } 
        else if (found !== undefined) {
          response = found;
        }

        return response;
      },
      dataAttributes: function () {
        module.debug('Setting data attributes settings');
        if(module.settings.metadata){
          $.each(module.settings.metadata, function (index, value) {
            if (dataAttributes[index] !== undefined) {
              module.settings[index] = dataAttributes[index];
            }
          });
          } 
        }
    };

    mink.$.extend(module, boilerplate);
    if(module.settings.autoInit) {
      module.initialize();
    }
  };

  // Module helper
  mink.expose = function (name, Constructor) {
    // Save old module definition
    var old = $.fn[name];

    mink.fn[name] = mink.$.fn[name] = function (parameters) {

      var
      // Store a reference to the module group, this can be useful to refer to other modules inside each module
      $allModules = $(this),

      // Preserve original arguments to determine if a method is being invoked
      query = arguments[0],
      queryArguments = [].slice.call(arguments, 1),

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

    mink.$.fn[name].constructor = Constructor;

    mink.$.fn[name].noConflict = function () {
      module.debug('Setting noConflict mode');
      mink.$.fn[name] = old;
      return this;
    };

  };

  return mink;

}));
