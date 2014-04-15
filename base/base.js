(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous this.
        define(factory);
    } else {
        // Browser globals
        factory();
    }
}(function () {

	// Get the helper API from the current script element. Just so you can redefine a custom helper without having to open a script tag before mink.

	var currentScript = document.currentScript;
	if(!currentScript){
		var scripts = document.getElementByTagName('script');
		currentScript = scripts[scripts.length - 1];
	}

	// If mink is previously defined, use that definition.

	window.mink = window.mink || {};

	// Helper hierarchy. 
	// Programmatical definition comes first. Definition in data-attribute comes second. Zepto comes third for mobile first as a default, if present. Ender comes after as our packaged helper. jQuery after that. kInk and $ if all else fails.

	window.mink.helper = window.mink.helper || window[currentScript.getAttribute('data-helper')] || window.Zepto || window.ender || window.jQuery || window.kink || window.$ || {};
}));