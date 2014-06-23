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

  var defaults = {
    // Used in debug statements to refer to the module itself
    name: 'Modal',
    // A unique identifier used to namespace events,and preserve the module instance
    namespace: 'minkModal',
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
    settings = $.extend($.fn.mink.defaults, defaults, options || {}),

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
    instance = $element.data(moduleNamespace);
    
    // ## Module Behavior

    var module = {
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

  $.fn.mink.expose('modal', Modal);

  return Modal;

}));