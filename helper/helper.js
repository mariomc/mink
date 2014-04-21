(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous this.
        define(['base/base'], factory);
    } else {
        // Browser globals
        factory(window.mink.helper);
    }
}(function ($) {
	// Helper methods for Ender to replicate jQuery/Zepto base API.

	var class2type = {},
		toString = class2type.toString,
		type,
		isFunction,
		isWindow,
		isDocument,
		isObject,
		isPlainObject,
		isArray,
		likeArray,
		each,
		extend,
		proxy;

	// Taken from Zepto
	type = function (obj) {
	   return obj == null ? String(obj) :
	     class2type[toString.call(obj)] || "object"
	 }

	isFunction = function (value) { return type(value) == "function" };
	isWindow = function (obj)     { return obj != null && obj == obj.window };
	isDocument = function (obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE };
	isObject = function (obj)     { return type(obj) == "object" };
	isPlainObject = function (obj) {
	  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
	};
	likeArray = function (obj) { return typeof obj.length == 'number' };
	each = function (elements, callback){
		var i, key
		if (likeArray(elements)) {
		  for (i = 0; i < elements.length; i++)
		    if (callback.call(elements[i], i, elements[i]) === false) return elements
		} else {
		  for (key in elements)
		    if (callback.call(elements[key], key, elements[key]) === false) return elements
		}

		return elements
	};
	extend = function(){
		var options, name, src, copy
		  , target = arguments[0], i = 1, length = arguments.length

		for (; i < length; i++) {
		  if ((options = arguments[i]) !== null) {
		    for (name in options) {
		      src = target[name]
		      copy = options[name]
		      if (target !== copy)
		        target[name] = copy
		    }
		  }
		}
		return target;
	}
	proxy = function (fn, ctx){
		return function () { return fn.apply(ctx, arguments) }
	}; 


	isArray = Array.isArray || function(object){ return object instanceof Array };

	each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	  class2type[ "[object " + name + "]" ] = name.toLowerCase()
	});


	$.type = type;
	$.each = each;
	$.isFunction = isFunction;
	$.isWindow = isWindow;
	$.isArray = isArray;
	$.isPlainObject = isPlainObject;
	$.extend = extend;
	$.proxy = proxy;

}));