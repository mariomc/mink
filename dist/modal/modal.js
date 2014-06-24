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

  var Modal = $.fn.mink.factory(defaultSettings);

  $.extend(Modal.prototype, {
    $html : $('html'),
    initialize: function () {
      this.debug('Initializing module for', this.element);
      this.$element.on('click' + this.eventNamespace, this.settings.selector.close, $.proxy(this.close, this));
      this.$element.on('click' + this.eventNamespace, $.proxy(this.click, this));
      this.$html.on('click' + this.eventNamespace, this.settings.selector.open, $.proxy(this.open, this));
      this.$html.on('keyup' + this.eventNamespace, $.proxy(this.keyup, this));
      this.instantiate();
    },

    instantiate: function () {
      this.verbose('Storing instance of module');

      // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
      this.instance = this;
      this.dataAttributes();
      this.$element.data(this.moduleNamespace, this.instance);
      this.element.setAttribute('data-' + this.settings.name, '');
      if (this.setting('autoOpen')) {
        this.open();
      }
    },

    // #### Destroy
    // Removes all events and the instance copy from metadata
    destroy: function () {
      this.verbose('Destroying previous module for', this.element);
      this.$element.removeData(this.moduleNamespace).off(this.eventNamespace);
      this.element.removeAttribute('data-' + this.settings.name);
      this.$html.off(this.eventNamespace, this.open);
      this.$html.off(this.eventNamespace, this.keyup);
    },

    // #### Refresh
    // Selectors or cached values sometimes need to refreshed
    refresh: function () {
      this.verbose('Refreshing elements', this.element);
      $element = $(element);
    },

    // ### Custom
    // #### By Event
    // Sometimes it makes sense to call an event handler by its type if it is dependent on the event to behave properly
    click: function (ev) {
      this.verbose('Click on modal detected');

      if (this.setting('closeOnClick')) {
        if (ev.target === this.element) {
          this.debug('Click on shader detected');
          this.close();
        }
      }
    },

    keyup: function (ev) {
      this.verbose('Keyup detected');
      if (this.setting('closeOnEscape')) {
        if (ev.keyCode === 27) {
          this.debug('Escape press detected');
          this.close();
        }
      }
    },

    // #### By Function
    // Other times events make more sense for methods to be called by their function if it is ambivalent to how it is invoked
    open: function () {
      this.debug('Opening the modal');
      if(this.isClosed()) {
        $.proxy(this.setting('onChange'))();
      }
      $.proxy(this.setting('onOpen'))();
      this.$element.removeClass(this.settings.className.hide);
      var module = this;
      setTimeout(function () {
        module.$element.addClass(module.settings.className.visible);
        module.$html.addClass(module.settings.className.open);
      }, this.settings.animationDuration);

    },

    // ##### Close
    close: function () {
      this.debug('Closing the modal');
      if(this.isOpen()) {
        $.proxy(this.setting('onChange'))();
      }
      $.proxy(this.setting('onClose'), this)();
      this.$element.removeClass(this.settings.className.visible);
      var module = this;
      setTimeout(function () {
        module.$html.removeClass(module.settings.className.open);
        module.$element.addClass(module.settings.className.hide);

      }, this.settings.animationDuration);
    },

    // ##### Toggle
    toggle: function () {
      this.debug('Toggling the modal state');
      if(isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    isOpen: function () {
      this.debug('Checking if modal is open');
      return !this.$element.hasClass(this.settings.className.hide);
    },
    isClosed: function () {
      this.debug('Checking if modal is closed');
      return this.$element.hasClass(this.settings.className.hide);
    }
  });

  $.fn.mink.expose('modal', Modal);

  return Modal;

}));