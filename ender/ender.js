(function ($) {
  // Helper methods for Ender to replicate jQuery/Zepto base API.

  var class2type = {},
    data = {},
    toString = class2type.toString,
    exp = 'Ender' + (+new Date()),
    _$trigger = $.fn.trigger,
    dataAttr,
    deserializeValue,
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
    camelCase,
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
  };

  deserializeValue = function(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? JSON.parse(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  };

  proxy = function (fn, ctx){
    return function () { return fn.apply(ctx, arguments) }
  };

  camelize = function (s) {
    return s.replace(/-([a-z]|[0-9])/ig, function (s, c) { return (c + '').toUpperCase() })
  };

  dataAttr = function (name, value) {
    var data = this.attr('data-' + name.replace(/([A-Z])/g, '-$1').toLowerCase(), value)
          return data !== null ? deserializeValue(data) : undefined
  };

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          deserializeValue(attr.value)
    })
    return store
  }

  function contains(container, element){
    do {
      element = element.parentNode;
      if (element === container) {
        return true;
        }
      } while (element);
      return false;
  }


  isArray = Array.isArray || function(object){ return object instanceof Array };

  each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  });

  $.uuid = 0;

  $.ender({
    type: type,
    each: each,
    isFunction: isFunction,
    isWindow: isWindow,
    isArray: isArray,
    isPlainObject: isPlainObject,
    extend: extend,
    proxy: proxy,
    camelCase: camelize,
    contains: contains
  })

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      isPlainObject(name) ?
        each(this, function(i, node){
          each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        this.length == 0 ? undefined : getData(this[0], name) :
      // set value on all elements
      each(this, function(){ setData(this, name, value) })
  };

  $.fn.removeData = function(names){
    if (typeof names == 'string') names = names.split(/\s+/)
      return this.each(function(){
        var id = this[exp], store = id && data[id]
        if (store) each(names || store, function(key){
          delete store[names ? camelize(this) : key]
        })
    })
  };

})(ender);