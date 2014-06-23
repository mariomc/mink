(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define(['../../base/mink'], function(mink){
      return (window.mink.fn.modal = factory(mink.$));
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    var mnk = require('../../base/mink.js');
    window.mink.fn.modal = factory(mnk.$);
  } else {
    // Browser globals
    window.mink.fn.modal = factory(window.mink.$);
  }
}(function ($) {
  'use strict';

  var defaults = {
    // Used in debug statements to refer to the module itself
    name: 'Modal',
    // Whether debug content should be outputted to console
    debug: true,
    // Whether extra debug content should be outputted
    verbose: true,
    // Whether to track performance data
    performance: true,
    // A unique identifier used to namespace events,and preserve the module instance
    namespace: 'minkModal',
    // A flag to autoinitialize the module
    autoInit: true,
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
    },

    // ### Callbacks
    // Callbacks are often useful to include in your settings object
    onChange: function () {},
    onOpen: function () {},
    onClose: function () {},

    // ### Definition Specific
    // You may also want to include settings specific to your module's function
    autoOpen: true,
    closeOnClick: false,
    closeOnEscape: false,
    animationDuration: 300
  };

  function Modal(element, options){
    element = typeof element === 'string' ? $(element)[0] : element;

    var
    // Extend settings to merge run-time settings with defaults
    settings = $.extend(defaults, options || {}),

    // Alias settings object for convenience and performance
    namespace = settings.namespace,
    className = settings.className,

    // Define namespaces for storing module instance and binding events
    eventNamespace = '.' + namespace,
    moduleNamespace = namespace,

    // Cache selectors using selector settings object for access inside instance of module
    $element = $(element),
    $html = $('html'),

    // Instance is stored and retrieved in namespaced DOM metadata
    instance = $element.data(moduleNamespace),

    module;
    // ## Module Behavior

    module = {
      settings: settings,
      element: element,
      $element: $element,
      instance: instance,
      // ### Required

      // #### Initialize
      // Initialize attaches events and preserves each instance in html metadata
      initialize: function () {
        module.debug('Initializing module for', element);
        $element.on('click' + eventNamespace, settings.selector.close, module.close);
        $element.on('click' + eventNamespace, module.event.click);
        $html.on('click' + eventNamespace, settings.selector.open, module.open);
        $html.on('keyup' + eventNamespace, module.event.keyup);
        module.instantiate();
      },

      instantiate: function () {
        module.verbose('Storing instance of module');

        // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
        instance = module.instance = module;
        module.dataAttributes();
        $element.data(moduleNamespace, instance);
        element.setAttribute('data-' + settings.name, '');
        if (module.setting('autoOpen')) {
          module.open();
        }
      },

      // #### Destroy
      // Removes all events and the instance copy from metadata
      destroy: function () {
        module.verbose('Destroying previous module for', element);
        $element.removeData(moduleNamespace).off(eventNamespace);
        element.removeAttribute('data-' + settings.name);
        $html.off(eventNamespace, module.open);
        $html.off(eventNamespace, module.event.keyup);
      },

      // #### Refresh
      // Selectors or cached values sometimes need to refreshed
      refresh: function () {
        module.verbose('Refreshing elements', element);
        $element = $(element);
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
            if (ev.keyCode === 27) {
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
        if(module.is.closed()) {
          $.proxy(module.setting('onChange'))();
        }
        $.proxy(module.setting('onOpen'))();
        $element.removeClass(className.hide);

        setTimeout(function () {
          $element.addClass(className.visible);
          $html.addClass(className.open);
        }, settings.animationDuration);

      },

      // ##### Close
      close: function () {
        module.debug('Closing the modal');
        if(module.is.open()) {
          $.proxy(module.setting('onChange'))();
        }
        $.proxy(module.setting('onClose'), module)();
        $element.removeClass(className.visible);

        setTimeout(function () {
          $html.removeClass(className.open);
          $element.addClass(className.hide);

        }, settings.animationDuration);
      },

      // ##### Toggle
      toggle: function () {
        module.debug('Toggling the modal state');
        if(isOpen) {
          module.close();
        } else {
          module.open();
        }
      },

      is: {
        open: function () {
          module.debug('Checking if modal is open');
          return !$element.hasClass(className.hide);
        },
        closed: function () {
          module.debug('Checking if modal is closed');
          return $element.hasClass(className.hide);
        }
      }
    };

    $.fn.mink.boilerplate(module);

    return module;
  }

  // Save old module definition
  var old = $.fn.modal;

  $.fn.modal = function (parameters) {

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
        var module = new Modal(this, settings);

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
    if (returnedValue !== undefined){
      return returnedValue;
    } else {
      return this;
    }

  };

  // ## No conflict support

  $.fn.modal.noConflict = function () {
    module.debug('Setting noConflict mode');
    $.fn.modal = old;
    return this;
  };

  $.fn.modal.defaults = defaults;

  return Modal;

}));