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
    define('mink-gallery', [
      'mink-helper',
      'blueimp-gallery'
      ], factory);
  } else {
    factory(
      window.blueimp.helper,
      window.blueimp.Gallery
      );
  }
}(function ($, Gallery) {
  'use strict';

  $.extend(Gallery.prototype.options, {
    useMinkModal: true
  });

  var close = Gallery.prototype.close,
  imageFactory = Gallery.prototype.imageFactory,
  videoFactory = Gallery.prototype.videoFactory,
  textFactory = Gallery.prototype.textFactory;

  $.extend(Gallery.prototype, {

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

$.fn.gallery = function (parameters) {
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
            settings = ($.isPlainObject(parameters)) ? $.extend({}, $.fn.gallery.settings, parameters) : $.extend({}, $.fn.gallery.settings),

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

            // Module HTML data attributes 

            dataAttributes = $module.data(),
            gallery,
            module;

            module = {
              initialize: function() {
                module.debug('Initializing module for', element);
                module.dataAttributes();
                $(document).on('click' + eventNamespace, settings.selector.links, module.create);
                $module.on('click' + eventNamespace, '.ink-dismiss', function(){
                  gallery.close();
                });

                module.instantiate();
              },

              instantiate: function () {
                module.verbose('Storing instance of module');
                // The instance is just a copy of the module definition, we store it in metadata so we can use it outside of scope, but also define it for immediate use
                instance = module;
                $module.data(moduleNamespace, instance);

              },

              create: function(ev){
                module.debug('Creating the gallery instance');

                var prop = ev ? $(this).data(settings.name.toLowerCase()) : settings.selector.links;
                var sel = [];
                if( prop.indexOf(',') > -1 ) {
                  $.each(prop.split(/[, ]+/g), function(){
                    sel.push('[data-' + settings.name.toLowerCase() + '*="' + this + '"]');
                  });                 
                } else {
                    sel.push( prop ? '[data-' + settings.name.toLowerCase() + '="' + prop + '"]' : settings.selector.links);
                }

                if(ev) {
                  settings.event = ev;
                  settings.index = this;
                  ev.preventDefault();
                } else {
                  sel = [settings.selector.links];
                }
                
                settings.container = element;
                var $elems = $(sel.join());

                gallery = new Gallery( $elems, settings);
              },

              get: {
                index: function() {
                  module.verbose('Getting the current slide index position');
                  return gallery.getIndex();
                },
                number: function() {
                  module.verbose('Getting the number of slides in the gallery');
                  return gallery.getNumber();
                },
                gallery: function() {
                  module.verbose('Getting the gallery instance');
                  return gallery;
                },
                instance: function() {
                  module.verbose('Getting the module instance');
                  return instance;
                }
              },
              prev: function() {
                module.debug('Moving to the previous slide');
                gallery.prev();
              },
              next: function(interval) {
                module.debug('Playing the slideshow in and interval of ', interval);
                gallery.play(interval);
              },
              pause: function(interval) {
                module.debug('Pausing the slideshow for', interval);
                gallery.pause();
              },
              add: function(list){
                module.debug('Adding additional slides for', element);
                gallery.add(list);
              },
              slide: function(index, duration) {
                module.debug('Moving to slide number ', index);
                gallery.slide(index, duration);
              },
              open: function() {
                module.debug('Opening the gallery for', element);
                gallery.close();
              },
              close: function() {
                module.debug('Closing the gallery for', element);
                gallery.close();
              },

              // #### Destroy
              // Removes all events and the instance copy from metadata
              destroy: function () {
                module.verbose('Destroying previous module for', element);
                $module.removeData(moduleNamespace).off(eventNamespace);
                $(document).off(eventNamespace, module.create);
                element.removeAttribute('data-' + settings.name);
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

    // ## Settings
    // It is necessary to include a settings object which specifies the defaults for your module
    $.fn.gallery.settings = {

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
    
    return $.fn.gallery;

  }));