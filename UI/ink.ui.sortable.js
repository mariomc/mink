(function($){
    var hasTouch = (('ontouchstart' in window) ||       // html5 browsers
                    (navigator.maxTouchPoints > 0) ||   // future IE
                    (navigator.msMaxTouchPoints > 0));

    function bind(fn, context){
        var args = Array.prototype.slice.call(arguments, 2);
        return function() {
            var innerArgs = Array.prototype.slice.call(arguments);
            var finalArgs = args.concat(innerArgs);
            return fn.apply(context === false ? this : context, finalArgs);
        };
    }

    // SORTABLE LIST CLASS DEFINITION
    // ======================

    var SortableList = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$element.data('ink.sortablelist', $.extend(this.options, {}, options));

        this.handlers = {
            down: bind(this._onDown, this),
            move: bind(this._onMove, this),
            up:   bind(this._onUp, this)
        };

        this.movingElement = false;

        this._init();
    };

    SortableList.DEFAULTS = {
        'placeholderClass'  : 'placeholder',
        'draggedClass'      : 'hide-all',
        'draggingClass'     : 'dragging',
        'dragSelector'      : 'li',
        'handleSelector'    : false,
        'moveSelector'      : false,
        'swap'              : true,
        'cancelMouseOut'    : false
    };

    SortableList.prototype = {

        /**
         * Init function called by the constructor.
         * 
         * @method _init
         * @private
         */
        _init: function() {
            this._down = hasTouch ? 'touchstart mousedown' : 'mousedown';
            this._move = hasTouch ? 'touchmove mousemove' : 'mousemove';
            this._up   = hasTouch ? 'touchend mouseup' : 'mouseup';

            this._observe();

        },

        /**
         * Sets the event handlers.
         * 
         * @method _observe
         * @private
         */
        _observe: function() {
            this.$element.on(this._down, this.options.dragSelector, this.handlers.down);
            $(document).on(this._move, this.options.dragSelector, this.handlers.move);
            if(this.options.cancelMouseOut) {
                this.$element.on('mouseleave', this.stopMoving);
            }
            $(document.documentElement).on(this._up, this.handlers.up);
        },

        /**
         * Mousedown or touchstart handler
         * 
         * @method _onDown
         * @param {Event} ev
         * @private
         */
        _onDown: function(ev) {
            if (this.movingElement || this._placeholder) { return; }
            if (this.options.handleSelector && !$(ev.target).is(this.options.handleSelector)) { return; }
            var tgtEl = ev.currentTarget;
            this.movingElement = tgtEl;
            this._placeholder = tgtEl.cloneNode(true);
            this._movePlaceholder(tgtEl);
            this._addMovingClasses();
            return false;
        },

        /**
         * Mousemove or touchmove handler
         * 
         * @method _onMove
         * @param {Event} ev
         * @private
         */
        _onMove: function(ev) {
            this.validateMove(ev.currentTarget);
            return false;
        },

        /**
         * Mouseup or touchend handler
         * 
         * @method _onUp
         * @param {Event} ev
         * @private
         */
        _onUp: function(ev) {
            if (!this.movingElement || !this._placeholder) { return; }
            if (ev.currentTarget === this.movingElement) { return; }
            if (ev.currentTarget === this._placeholder) { return; }
            $(this.movingElement).insertBefore(this._placeholder);
            this.stopMoving();
            return false;
        },

        /**
         * Adds the CSS classes to interactive elements
         * 
         * @method _addMovingClasses
         * @private
         */
        _addMovingClasses: function(){
            $(this._placeholder).addClass(this.options.placeholderClass);
            $(this.movingElement).addClass(this.options.draggedClass);
            $(document.documentElement).addClass(this.options.draggingClass);
        },

        /**
         * Removes the CSS classes from interactive elements
         * 
         * @method _removeMovingClasses
         * @private
         */
        _removeMovingClasses: function(){
            if(this.movingElement) { $(this.movingElement).removeClass(this.options.draggedClass); }
            if(this._placeholder) { $(this._placeholder).removeClass(this.options.placeholderClass); }
            $(document.documentElement).removeClass(this.options.draggingClass);
        },

        /**
         * Moves the placeholder element relative to the target element
         * 
         * @method _movePlaceholder
         * @param {Element} target_position
         * @private
         */
        _movePlaceholder: function(target){
            var placeholder = this._placeholder,
                target_position,
                placeholder_position,
                from_top,
                from_left;
            if(!placeholder) {
                $(placeholder).insertAfter(target);
            } else if(this.options.swap){
                $(placeholder).insertAfter(target);
                $(target).insertBefore(this.movingElement);
                $(this.movingElement).insertBefore(placeholder);
            } else {
                target_position = $(target).offset();
                placeholder_position = $(this._placeholder).offset();
                from_top = target_position[1] > placeholder_position.top;
                from_left = target_position[0] > placeholder_position.left;
                if( ( from_top && from_left ) || ( !from_top && !from_left ) ) {
                    $(placeholder).insertBefore(target);
                } else {
                    $(placeholder).insertAfter(target);
                }
                $(this.movingElement).insertBefore(placeholder);
            }
        },

        /**************
         * PUBLIC API *
         **************/

        /**
         * Visually stops moving. Removes the placeholder as well as the styling classes.
         * 
         * @method _movePlaceholder
         * @public
         */
        stopMoving: function(){
            this._removeMovingClasses();
            $(this._placeholder).remove();
            this._placeholder = false;
            this.movingElement = false;
        },

        /**
         * Validation method for the move handler
         * 
         * @method _movePlaceholder
         * @param {Element} elem
         * @public
         */
        validateMove: function(elem){
            if (!this.movingElement || !this._placeholder) { return; }
            if (elem === this._placeholder) {  return; }
            if (elem === this.movingElement) { return; }
            if(!this.options.moveSelector || $(elem).is(this.options.moveSelector)){
                this._movePlaceholder(elem);
            } else {
                this.stopMoving();  
            }
        }

    };

    // SORTABLE LIST PLUGIN DEFINITION
    // ======================

    $.fn.sortablelist = function(options){
        return this.each(function(){
            var $this = $(this);
            var data = $this.data('ink.sortablelist');
            var options = $.extend(SortableList.DEFAULTS, data, options);
            if(!data) $this.data('ink.sortablelist', ( data = new SortableList(this, options)));
        });
    };

})(window.ender || window.zepto || window.jQuery);
