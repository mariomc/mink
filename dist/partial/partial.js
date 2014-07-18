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

  /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

  var matchM = window.matchMedia || (function(doc, undefined){

    var docElem  = doc.documentElement,
        refNode  = docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
        fakeBody = doc.createElement('body'),
        div      = doc.createElement('div');

    div.id = 'mq-test-1';
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);

    var mqRun = function ( mq ) {
      div.innerHTML = '&shy;<style media="' + mq + '"> #mq-test-1 { width: 42px; }</style>';
      docElem.insertBefore( fakeBody, refNode );
      bool = div.offsetWidth === 42;
      docElem.removeChild( fakeBody );
      
      return { matches: bool, media: mq };
    },
    
    getEmValue = function () {
      var ret,
          body = docElem.body,
          fakeUsed = false;

      div.style.cssText = "position:absolute;font-size:1em;width:1em";

      if( !body ) {
        body = fakeUsed = doc.createElement( "body" );
        body.style.background = "none";
      }

      body.appendChild( div );

      docElem.insertBefore( body, docElem.firstChild );

      if( fakeUsed ) {
        docElem.removeChild( body );
      } else {
        body.removeChild( div );
      }
      
      //also update eminpx before returning
      ret = eminpx = parseFloat( div.offsetWidth );

      return ret;
    },
    
    //cached container for 1em value, populated the first time it's needed 
    eminpx,
    
    // verify that we have support for a simple media query
    mqSupport = mqRun( '(min-width: 0px)' ).matches;

    return function ( mq ) {
      if( mqSupport ) {
        return mqRun( mq );
      } else {
        var min = mq.match( /\(min\-width[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
            max = mq.match( /\(max\-width[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
            minnull = min === null,
            maxnull = max === null,
            currWidth = doc.body.offsetWidth,
            em = 'em';
        
        if( !!min ) { min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
        if( !!max ) { max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
        
        bool = ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max );

        return { matches: bool, media: mq };
      }
    };

    }( document ));

  var defaultSettings = {
    name: 'Partial',
    namespace: 'minkPartial',
    eventNamespace: '.minkPartial',
    method: 'html',
    namedBreakpoints: {
      tiny: 'screen and (max-width: 320px)',
      small: 'screen and (min-width: 321px) and (max-width: 640px)',
      medium: 'screen and (min-width: 641px) and (max-width: 960px)',
      large: 'screen and (min-width: 961px) and (max-width: 1260px)',
      xlarge: 'screen and (min-width: 1261px)'
    },
    metadata: {
      bp: 'bp'
    },
    partials: {},
    onChange: function(){ }
  };

  var Partial = $.fn.mink.factory(defaultSettings);

  $.extend(Partial.prototype, {

    $win: $(window),

    initialize: function() {
      this.debug('Initializing module for', this.element);
      this.$win.off(this.eventNamespace).on('resize' + this.eventNamespace, $.proxy(this.throttle(this.resize, 50), this));
      this.instantiate();
    },

    instantiate: function(){
      this.verbose('Storing instance of module');
      this._cache = {};
      this.instance = this;
      // Storing instance on module in an array containing all instances
      this.dataAttributes();
      this.parseAttributes();
      this.$element.data(this.moduleNamespace, this.instance);
      this.element.setAttribute('data-' + this.settings.name.toLowerCase(), '');
      this.resize();
    },

    // Parse partials from data attributes
    parseAttributes: function() {
      var partials = this.$element.data('partials');
      if(partials) {
        var part = this.obj(partials);
        this.settings.partials = $.extend({}, this.settings.partials, part);
      }
    },

    trim: function (str) {
      return str.replace(/^\s+|\s+$/g, '');
    },

    parseScenario: function (scenario) {
      scenario[1] = this.trim(scenario[1]);
      var media_query   = scenario[1].substring(1, scenario[1].length-1),
          cached_split  = scenario[0].split(/[\s,]+/g),
          path          = cached_split[0],
          ret           = {};
          console.log(media_query);
        ret[this.trim(media_query)] = this.trim(path);
        return ret;
    },

    obj: function(attr) {
      var raw_arr = this.parseDataAttrs(attr),
          scenarios = {}, 
          i = raw_arr.length;
      if (i > 0) {
        while(i--){
          var split = raw_arr[i].split(/[,]+/g);
          if (split.length > 1) {
            var params = this.parseScenario(split);
            $.extend(scenarios, params);
          }
        }
      }
      return scenarios;
    },

    parseDataAttrs: function (attr) {
      var raw = attr.match(/\[(.*?)\]/g),
          i = raw.length, 
          output = [];
      while (i--) {
        output.push(raw[i].substring(1, raw[i].length - 1));
      }
      console.log(output);
      return output;
    },

    resize: function(){
      this.verbose('Resizing function');
      for (var i = 0; i < this.allModules.length; i++) {
        if(this.allModules[i]) {
          this.allModules[i].getMedia();
        }
      }
    },

    getMediaHash: function() {
      var mediaHash='';
      for (var queryName in this.settings.namedBreakpoints ) {
        mediaHash += matchM(this.settings.namedBreakpoints[queryName]).matches.toString();
      }
      return mediaHash;
    },

    getMedia: function(){
      this.currentMediaHash = this.getMediaHash();
      this.previousMediaHash = this.previousMediaHash || '';

      // Check if we have a different mediaQuery
      if(this.currentMediaHash !== this.previousMediaHash) {
        this.$element.trigger('mqchange');
        $.proxy(this.settings.onChange, this)();
        this.update();
      }

      this.previousMediaHash = this.currentMediaHash;
    },

    update: function() {
      this.verbose('Updating node');
      for (var prop in this.settings.partials ) {
        var breakpoint = this.settings.namedBreakpoints[prop] || prop;
        var isMatch = matchM(breakpoint).matches;
        if(isMatch){
          this.check(prop);
        }
      }
    },

    check: function(prop){
      var path = this.settings.partials[prop];
      if(/IMG/i.test(this.element.nodeName)) {
        this.element.src = path;
      } else {
        if( this._cache[prop] ) {
          this.$element.html(this._cache[prop]);
        } else {
          var _this = this;
          $.get(path, function (response) {
            _this._cache[prop] = response;
            _this.$element.html(response);
          });
        }
      }
    },

    destroy: function(){
      this.verbose('Destroying previous module for', this.element);
      this.$element.removeData(this.moduleNamespace).off(this.eventNamespace);
      this.element.removeAttribute('data-' + this.settings.name.toLowerCase());
      delete this.allModules[this.moduleId];
      // Check if there isn't any more modules so we can unsubscribe the resize event and logic
      if(this.allModules.join('') == '') {
        this.$win.off(this.eventNamespace);
      }
    }

  });

  $.fn.mink.expose('partial', Partial);

  return Partial;

}));