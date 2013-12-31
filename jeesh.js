var ender = require('ender-js');
var	_ = require('underscore');
var $ = ender.noConflict(function () {});

global.ender = $;
require('bean/src/ender');
require('qwery/src/ender');
require('bonzo/src/ender');
require('domready/src/ender');
require('reqwest/src/ender');
require('morpheus/src/ender');

ender.ender(_);
module.exports = $;