(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['helper/helper'], factory);
  } else {
    // Browser globals
    factory(mink.helper);
  }
}(function ($) {


  // Save old module definition
  var old = $.fn.modal;


  $.fn.modal = function (parameters) {

    // ## Group
    // Some properties remain constant across all instances of a module.
    var
    // Store a reference to the module group, this can be useful to refer to other modules inside each module
    $allModules = $(this),

      // Preserve selector from outside each scope and mark current time for performance tracking
      moduleSelector = $allModules.selector || '',
      time = new Date().getTime(),
      performance = [],

      // Preserve original arguments to determine if a method is being invoked
      query = arguments[0],
      methodInvoked = (typeof query == 'string'),
      queryArguments = [].slice.call(arguments, 1),
      returnedValue;
    // ## Singular
    // Iterate over all elements to initialize module

    $allModules
      .each(function () {
        var

        // Extend settings to merge run-time settings with defaults
        settings = ($.isPlainObject(parameters)) ? $.extend({}, $.fn.modal.settings, parameters) : $.extend({}, $.fn.modal.settings),

        // Alias settings object for convenience and performance
        namespace = settings.namespace,
        error = settings.error,
        metadata = settings.metadata,
        className = settings.className,

        // Define namespaces for storing module instance and binding events
        eventNamespace = '.' + namespace,
        moduleNamespace = namespace,

        // Instance is stored and retrieved in namespaced DOM metadata
        instance = $(this).data(moduleNamespace),
        element = this,

        // Cache selectors using selector settings object for access inside instance of module
        $module = $(this),
        $html = $('html'),

        // Module HTML data attributes 

        dataAttributes = $module.data(),

        module;

        // ## Module Behavior

        module = {

          // ### Required

          // #### Initialize
          // Initialize attaches events and preserves each instance in html metadata
          initialize: function () {
            module.debug('Initializing module for', element);
            $module.on('click' + eventNamespace, settings.selector.close, module.close);
            $module.on('click' + eventNamespace, module.event.click);
            $html.on('click' + eventNamespace, settings.selector.open, module.open);
            $html.on('keyup' + eventNamespace, module.event.keyup);
            module.instantiate();
          },

          instantiate: function () {
            module.verbose('Storing instance of module');
            // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
            instance = module;
            module.dataAttributes();
            $module.data(moduleNamespace, instance);
            element.setAttribute('data-' + settings.name, '');
            if (module.setting('autoOpen')) module.open();
          },

          // #### Destroy
          // Removes all events and the instance copy from metadata
          destroy: function () {
            module.verbose('Destroying previous module for', element);
            $module.removeData(moduleNamespace).off(eventNamespace);
            element.removeAttribute('data-' + settings.name);
            $html.off(eventNamespace, module.open);
            $html.off(eventNamespace, module.event.keyup);
          },

          // #### Refresh
          // Selectors or cached values sometimes need to refreshed
          refresh: function () {
            module.verbose('Refreshing elements', element);
            $module = $(element);
          },

          // ### Custom
          // #### By Event
          // Sometimes it makes sense to call an event handler by its type if it is dependent on the event to behave properly
          event: {
            click: function (ev) {
              module.verbose('Click on modal detected');

              if (module.setting('closeOnClick')) {
                if (ev.target === element) {
                  module.debug('Click on shader detected');
                  module.close();

                }
              }
            },

            keyup: function (ev) {
              module.verbose('Keyup detected');
              if (module.setting('closeOnEscape')) {
                if (ev.keyCode == 27) {
                  module.debug('Escape press detected');
                  module.close();
                }
              }
            }
          },

          // #### By Function
          // Other times events make more sense for methods to be called by their function if it is ambivalent to how it is invoked
          open: function () {
            module.debug('Opening the modal');
            if(module.is.closed()) $.proxy(module.setting('onChange'))();
            $.proxy(module.setting('onOpen'))();
            $module.removeClass(className.hide);

            setTimeout(function () {
              $module.addClass(className.visible);
              $html.addClass(className.open);
            }, settings.animationDuration);

          },
          close: function () {
            module.debug('Closing the modal');
            if(module.is.open()) $.proxy(module.setting('onChange'))();
            $.proxy(module.setting('onClose'), module)();
            $module.removeClass(className.visible);

            setTimeout(function () {
              $html.removeClass(className.open);
              $module.addClass(className.hide);

            }, settings.animationDuration);
          },
          toggle: function () {
            module.debug('Toggling the modal state');
            isOpen ? module.close() : module.open();
          },

          is: {
            open: function () {
              module.debug('Checking if modal is open');
              return !$module.hasClass(className.hide);
            },
            closed: function () {
              module.debug('Checking if modal is closed');
              return $module.hasClass(className.hide);
            }
          },
          // ### Standard

          // #### Data attributes
          // Set module settings 

          dataAttributes: function () {
            module.debug('Setting data attributes settings');
            $.each(metadata, function (index, value) {
              if (dataAttributes[index] !== undefined) {
                settings[index] = dataAttributes[index];
              }
            });
          },

          // #### Setting
          // Module settings can be read or set using this method
          //
          // Settings can either be specified by modifying the module defaults, by initializing the module with a settings object, or by changing a setting by invoking this method
          // `$(.foo').example('setting', 'moduleName');`
          setting: function (name, value) {
            if ($.isPlainObject(name)) {
              $.extend(settings, name);
            } else if (value !== undefined) {
              settings[name] = value;
            } else {
              return settings[name];
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
            if (settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              } else {
                module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.debug.apply(console, arguments);
              }
            }
          },

          // #### Verbose
          // Calling verbose internally allows for additional data to be logged which can assist in debugging
          verbose: function () {
            if (settings.verbose && settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              } else {
                module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.verbose.apply(console, arguments);
              }
            }
          },

          // #### Error
          // Error allows for the module to report named error messages, it may be useful to modify this to push error messages to the user. Error messages are defined in the modules settings object.
          error: function () {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
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
              if (settings.performance) {
                currentTime = new Date().getTime();
                previousTime = time || currentTime;
                executionTime = currentTime - previousTime;
                time = currentTime;
                performance.push({
                  'Element': element,
                  'Name': message[0],
                  'Arguments': [].slice.call(message, 1) || '',
                  'Execution Time': executionTime
                });
              }
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 100);
            },
            display: function () {
              var
              title = settings.name + ':',
                totalTime = 0;
              time = false;
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
            passedArguments = passedArguments || queryArguments;
            context = element || context;
            if (typeof query == 'string' && instance !== undefined) {
              query = query.split(/[\. ]/);
              maxDepth = query.length - 1;
              $.each(query, function (depth, value) {
                var camelCaseValue = (depth != maxDepth) ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1) : query;
                if ($.isPlainObject(instance[value]) && (depth != maxDepth)) {
                  instance = instance[value];
                } else if ($.isPlainObject(instance[camelCaseValue]) && (depth != maxDepth)) {
                  instance = instance[camelCaseValue];
                } else if (instance[value] !== undefined) {
                  found = instance[value];
                  return false;
                } else if (instance[camelCaseValue] !== undefined) {
                  found = instance[camelCaseValue];
                  return false;
                } else {
                  module.error(error.method, query);
                  return false;
                }
              });
            }
            if ($.isFunction(found)) {
              response = found.apply(context, passedArguments);
            } else if (found !== undefined) {
              response = found;
            }
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
            return found;
          }
        };


        // ### Determining Intent

        // This is where the actual action occurs.
        //     $('.foo').module('set text', 'Ho hum');
        // If you call a module with a string parameter you are most likely trying to invoke a function

        if (methodInvoked) {
          if (instance === undefined) {
            module.initialize();
          }
          module.invoke(query);
        }
        // if no method call is required we simply initialize the plugin, destroying it if it exists already
        else {
          if (instance !== undefined) {
            module.destroy();
          }
          module.initialize();
        }
      });
    return (returnedValue !== undefined) ? returnedValue : this;

  };

  // ## No conflict support

  $.fn.modal.noConflict = function () {
    module.debug('Setting noConflict mode');
    $.fn.modal = old;
    return this;
  }

  // ## Settings
  // It is necessary to include a settings object which specifies the defaults for your module
  $.fn.modal.settings = {

    name: 'Modal',
    debug: true,
    verbose: true,
    performance: true,
    namespace: 'minkModal',

    onChange: function () {},
    onOpen: function () {},
    onClose: function () {},

    autoOpen: false,
    closeOnClick: false,
    closeOnEscape: false,
    animationDuration: 300,

    // ### Optional

    // Selectors used by your module
    selector: {
      close: '.ink-dismiss',
      open: '#myTrigger'
    },
    // Error messages returned by the module
    error: {
      method: 'The method you called is not defined.'
    },
    // Class names which your module refers to
    className: {
      open: 'ink-modal-is-open',
      visible: 'visible',
      hide: 'hide-all'
    },
    // Metadata attributes stored or retrieved by your module. `$('.foo').data('value');`
    metadata: {
      autoOpen: 'autoOpen',
      closeOnClick: 'closeOnClick',
      closeOnEscape: 'closeOnEscape'
    }
  };

  return $.fn.modal;

}));