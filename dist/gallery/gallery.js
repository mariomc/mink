/*
 * Bootstrap Image Gallery 3.0.1
 * https://github.com/blueimp/Bootstrap-Image-Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

 /*global define, window */

 (function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous this.
    define(['../../base/mink', './blueimp-gallery'], function(mink, blueimp){
      return factory(mink.$, blueimp);
    });
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    var mnk = require('../../base/mink.js');
    var blueimp = require('./blueimp-gallery');
    factory(mnk.$, blueimp);
  } else {
    // Browser globals
    factory(window.mink.$, window.blueimp.Gallery);
  }
}(function ($, BlueImpGallery) {
  'use strict';

  var defaultSettings = {
    name: 'Gallery',
    debug: true,
    verbose: true,
    performance: true,
    namespace: 'minkGallery',

    // ### Optional

    // Error messages returned by the module
    error: {
      method: 'The method you called is not defined.'
    },

    selector: {
      links: '[data-gallery]'
    },

    // Metadata attributes stored or retrieved by your module. `$('.foo').data('value');`
    metadata: {
      container: 'container',
      slidesContainer: 'slidesContainer',
      titleElement: 'titleElement',
      displayClass: 'displayClass',
      controlsClass: 'controlsClass',
      singleClass: 'singleClass',
      leftEdgeClass: 'leftEdgeClass',
      rightEdgeClass: 'rightEdgeClass',
      playingClass: 'playingClass',
      slideClass: 'slideClass',
      slideLoadingClass: 'slideLoadingClass',
      slideErrorClass: 'slideErrorClass',
      slideContentClass: 'slideContentClass',
      toggleClass: 'toggleClass',
      prevClass: 'prevClass',
      nextClass: 'nextClass',
      closeClass: 'closeClass',
      playPauseClass: 'playPauseClass',
      typeProperty: 'typeProperty',
      titleProperty: 'titleProperty',
      urlProperty: 'urlProperty',
      displayTransition: 'displayTransition',
      clearSlides: 'clearSlides',
      stretchImages: 'stretchImages',
      toggleControlsOnReturn: 'toggleControlsOnReturn',
      toggleSlideshowOnSpace: 'toggleSlideshowOnSpace',
      enableKeyboardNavigation: 'enableKeyboardNavigation',
      closeOnEscape: 'closeOnEscape',
      closeOnSlideClick: 'closeOnSlideClick',
      closeOnSwipeUpOrDown: 'closeOnSwipeUpOrDown',
      emulateTouchEvents: 'emulateTouchEvents',
      stopTouchEventsPropagation: 'stopTouchEventsPropagation',
      hidePageScrollbars: 'hidePageScrollbars',
      disableScroll: 'disableScroll',
      carousel: 'carousel',
      continuous: 'continuous',
      unloadElements: 'unloadElements',
      startSlideshow: 'startSlideshow',
      slideshowInterval: 'slideshowInterval',
      index: 'index',
      preloadRange: 'preloadRange',
      transitionSpeed: 'transitionSpeed',
      slideshowTransitionSpeed: 'slideshowTransitionSpeed',
      event: 'event',
      onopen: 'onopen',
      onopened: 'onopened',
      onslide: 'onslide',
      onslideend: 'onslideend',
      onslidecomplete: 'onslidecomplete',
      onclose: 'onclose',
      onclosed: 'onclosed' 
    }
  };

  $.extend(BlueImpGallery.prototype.options, {
    useMinkModal: true
  });

  var close = BlueImpGallery.prototype.close,
  imageFactory = BlueImpGallery.prototype.imageFactory,
  videoFactory = BlueImpGallery.prototype.videoFactory,
  textFactory = BlueImpGallery.prototype.textFactory;

  $.extend(BlueImpGallery.prototype, {

    modalFactory: function (obj, callback, factoryInterface, factory) {
      var _this = this;
      var $modalTemplate = $('> .ink-shade', this.container);
      if ( !$modalTemplate.length || !this.options.useMinkModal || factoryInterface) {
        return factory.call(this, obj, callback, factoryInterface);
      }
      
      var modal = $modalTemplate
      .clone()
      .removeClass('hide-all')
      .on('click', function (event) {
        // Close modal if click is outside of modal-content:
        if (event.target === modal[0] || event.target === modal.children()[0]) {
          event.preventDefault();
          event.stopPropagation();
          _this.close();
        }
      }),
      element = factory.call(this, obj, function (event) {
        callback({
          type: event.type,
          target: modal[0]
        });
        modal.addClass('in');
      }, factoryInterface);
      modal.find('.modal-title').text(element.title || String.fromCharCode(160));
      modal.find('.modal-body').append(element);
      return modal[0];
    },

    imageFactory: function (obj, callback, factoryInterface) {
      return this.modalFactory(obj, callback, factoryInterface, imageFactory);
    },

    videoFactory: function (obj, callback, factoryInterface) {
      return this.modalFactory(obj, callback, factoryInterface, videoFactory);
    },

    textFactory: function (obj, callback, factoryInterface) {
      return this.modalFactory(obj, callback, factoryInterface, textFactory);
    },

    close: function () {
      close.call(this);
    }

  });

  var Gallery = $.fn.mink.factory(defaultSettings);

  $.extend(Gallery.prototype, {
    initialize: function() {
      var module = this;
      this.debug('Initializing module for', this.element);
      this.dataAttributes();
      $(document).on('click' + this.eventNamespace, this.settings.selector.links, $.proxy(this.create, this));
      this.$element.on('click' + this.eventNamespace, '.ink-dismiss', function(){
        module.instance.close();
      });

      this.instantiate();
    },

    instantiate: function () {
      this.verbose('Storing instance of module');
      // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
      this.instance = this;
      this.$element.data(this.moduleNamespace, this.instance);
    },

    create: function(ev){
      this.debug('Creating the gallery instance');
      var prop = ev ? $(ev.currentTarget).data(this.settings.name.toLowerCase()) : this.settings.selector.links;
      var settings = this.settings;
      var module = this;
      var sel = [];
      var callbacks =  {
        onopen: function () {
          module.$element.trigger('open');
        },
        onopened: function () {
          module.$element.trigger('opened');
        },
        onslide: function (a,b,c) {
          module.$element.trigger('slide');
        },
        onslideend: function () {
          module.$element.trigger('slideend');
        },
        onslidecomplete: function () {
          module.$element.trigger('slidecomplete');
        },
        onclose: function () {
          module.$element.trigger('close');
        },
        onclosed: function () {
          module.$element.trigger('closed').removeData('gallery');
        }
      };
      if( prop && prop.indexOf(',') > -1 ) {
        $.each(prop.split(/[, ]+/g), function(){
          sel.push('[data-' + settings.name.toLowerCase() + '*="' + this + '"]');
        });                 
      } else {
          sel.push( prop ? '[data-' + settings.name.toLowerCase() + '="' + prop + '"]' : settings.selector.links);
      }

      if(ev) {
        this.settings.event = ev;
        this.settings.index = ev.currentTarget;
        ev.preventDefault();
      } else {
        sel = [this.settings.selector.links];
      }
      
      this.settings.container = this.element;
      var $elems = $(sel.join());
      var options = $.extend( this.settings, callbacks);
      this.instance = new BlueImpGallery( $elems, this.settings);
    },

    getIndex: function() {
        this.verbose('Getting the current slide index position');
        return this.instance.getIndex();
    },
    getNumber: function() {
      this.verbose('Getting the number of slides in the gallery');
      return this.instance.getNumber();
    },
    getGallery: function() {
      this.verbose('Getting the gallery instance');
      if(!this.instance) {
        this.create();
      }
      return this.instance;
    },
    getInstance: function() {
      this.verbose('Getting the module instance');
      return this.instance;
    },
    prev: function() {
      this.debug('Moving to the previous slide');
      this.instance.prev();
    },
    next: function(interval) {
      this.debug('Moving to the next slide');
      this.instance.next();
    },
    play: function(interval) {
      this.debug('Playing the slideshow in and interval of ', interval);
      this.instance.play(interval);
    },
    pause: function() {
      this.debug('Pausing the slideshow for', this.element);
      this.instance.pause();
    },
    add: function(list){
      this.debug('Adding additional slides for', this.element);
      this.instance.add(list);
    },
    slide: function(index, duration) {
      this.debug('Moving to slide number ', index);
      this.instance.slide(index, duration);
    },
    open: function() {
      this.debug('Opening the gallery for', this.element);
      this.instance.close();
    },
    close: function() {
      this.debug('Closing the gallery for', this.element);
      this.instance.close();
    },

    // #### Destroy
    // Removes all events and the instance copy from metadata
    destroy: function () {
      this.verbose('Destroying previous module for', this.element);
      this.$element.removeData(moduleNamespace).off(this.eventNamespace);
      $(document).off(this.eventNamespace, this.create);
      this.element.removeAttribute('data-' + this.settings.name);
    }
  });

  $.fn.mink.expose('gallery', Gallery);

  return Gallery;

  }));