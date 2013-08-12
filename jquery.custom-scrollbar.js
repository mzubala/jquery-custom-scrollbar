(function ($) {

  $.fn.customScrollbar = function (options, args) {

    var defaultOptions = {
      skin:undefined,
      hScroll:true,
      vScroll:true,
      updateOnWindowResize:false,
      onCustomScroll:undefined
    }

    var Scrollable = function (element, options) {
      this.$element = $(element);
      this.options = options;
      this.addScrollableClass();
      this.addSkinClass();
      this.addScrollBarComponents();
      if (this.options.vScroll)
        this.vScrollbar = new Scrollbar(this, new VSizing());
      if (this.options.hScroll)
        this.hScrollbar = new Scrollbar(this, new HSizing());
      this.$element.data("scrollable", this);
      if (window.jQueryCustomScrollbars == undefined)
        window.jQueryCustomScrollbars = [];
      this.addToScrollbarsHierarchy();
      this.initKeyboardScrolling();
      this.bindEvents();
    }

    Scrollable.prototype = {

      addScrollableClass: function() {
        if(!this.$element.hasClass("scrollable")) {
          this.scrollableAdded = true;
          this.$element.addClass("scrollable");
        }
      },
      
      removeScrollableClass: function() {
        if(this.scrollableAdded)
          this.$element.removeClass("scrollable");
      },

      addSkinClass:function () {
        if (typeof(this.options.skin) == "string" && !this.$element.hasClass(this.options.skin)) {
          this.skinClassAdded = true;
          this.$element.addClass(this.options.skin);
        }
      },
      
      removeSkinClass: function() {
        if(this.skinClassAdded)
          this.$element.removeClass(this.options.skin);
      },

      addScrollBarComponents:function () {
        this.assignViewPort();
        if (this.$viewPort.length == 0) {
          this.$element.wrapInner("<div class=\"viewport\" />")
          this.assignViewPort();
          this.viewPortAdded = true;
        }
        this.assignOverview();
        if (this.$overview.length == 0) {
          this.$viewPort.wrapInner("<div class=\"overview\" />")
          this.assignOverview();
          this.overviewAdded = true;
        }
        this.addScrollBar("vertical", "prepend");
        this.addScrollBar("horizontal", "append");
      },

      removeScrollbarComponents: function() {
        this.removeScrollbar("vertical");
        this.removeScrollbar("horizontal");
        if(this.overviewAdded)
          this.$element.unwrap();
        if(this.viewPortAdded)
          this.$element.unwrap();
      },
      
      removeScrollbar: function(orientation) {
        if(this[orientation + "ScrollbarAdded"])
          this.$element.find(".scroll-bar." + orientation).remove();
      },

      assignViewPort:function () {
        this.$viewPort = this.$element.find(".viewport");
      },

      assignOverview:function () {
        this.$overview = this.$viewPort.find(".overview");
      },

      addScrollBar:function (orientation, fun) {
        if (this.$element.find(".scroll-bar." + orientation).length == 0) {
          this.$element[fun]("<div class='scroll-bar " + orientation + "'><div class='thumb'></div></div>")
          this[orientation + "ScrollbarAdded"] = true;
        }
      },

      resize:function () {
        if (this.vScrollbar)
          this.vScrollbar.resize();
        if (this.hScrollbar)
          this.hScrollbar.resize();
      },

      scrollTo:function (element) {
        if (this.vScrollbar)
          this.vScrollbar.scrollToElement(element);
        if (this.hScrollbar)
          this.hScrollbar.scrollToElement(element);
      },

      scrollToXY:function (x, y) {
        this.scrollToX(x);
        this.scrollToY(y);
      },

      scrollToX:function (x) {
        if (this.hScrollbar)
          this.hScrollbar.scrollTo(x);
      },

      scrollToY:function (y) {
        if (this.vScrollbar)
          this.vScrollbar.scrollTo(y);
      },
      
      remove: function() {
        this.removeScrollableClass();
        this.removeSkinClass();
        this.removeScrollbarComponents();
        this.$element.data("scrollable", null);
        window.jQueryCustomScrollbars = null;
        this.removeKeyboardScrolling();
        if(this.vScrollbar)
          this.vScrollbar.remove();
        if(this.hScrollbar)
          this.hScrollbar.remove();
      },

      isInside:function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) && (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height()) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width())
      },

      addNested:function (otherScrollable) {
        if (this.addNestedToOneFromList(this.nestedScrollbars, otherScrollable))
          return true;
        else if (this.isInside(otherScrollable.$viewPort, this.$overview)) {
          this.nestedScrollbars.push(otherScrollable);
          return true;
        }
        else
          return false;
      },

      addToScrollbarsHierarchy:function () {
        this.nestedScrollbars = [];
        if (!this.addNestedToOneFromList(this, window.jQueryCustomScrollbars))
          window.jQueryCustomScrollbars.push(this);
      },

      addNestedToOneFromList:function (scrollable, list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].addNested(scrollable))
            return true;
          else if (scrollable.addNested(list[i])) {
            list[i] = scrollable;
            return true;
          }
        }
        return false;
      },

      isMouseOver:function () {
        for (var i = 0; i < this.nestedScrollbars.length; i++)
          if (this.nestedScrollbars[i].isMouseOver())
            return false;
        var offset = this.$element.offset();
        var w = this.$element.width();
        var h = this.$element.height();
        return this.lastMouseEvent &&
          (this.lastMouseEvent.pageX >= offset.left) && (this.lastMouseEvent.pageX <= offset.left + w) &&
          (this.lastMouseEvent.pageY >= offset.top) && (this.lastMouseEvent.pageY <= offset.top + h);
      },

      initKeyboardScrolling:function () {
        var _this = this;
        this.documentKeydown = function (event) {
          if (_this.isMouseOver()) {
            if (_this.vScrollbar)
              _this.vScrollbar.keyScroll(event);
            if (_this.hScrollbar)
              _this.hScrollbar.keyScroll(event);
          }
        }
        $(document).keydown(this.documentKeydown);
        this.documentMousemove = function (event) {
          _this.lastMouseEvent = event;
        } 
        $(document).mousemove(this.documentMousemove);
      },
      
      removeKeyboardScrolling: function() {
        $(document).unbind("keydown", this.documentKeydown);
        $(document).unbind("mousemove", this.documentMousemove);
      },

      bindEvents:function () {
        if (this.options.onCustomScroll)
          this.$element.on("customScroll", this.options.onCustomScroll);
      }
      
    }

    var Scrollbar = function (scrollable, sizing) {
      this.scrollable = scrollable;
      this.sizing = sizing
      this.$scrollBar = this.sizing.scrollBar(this.scrollable.$element);
      this.$thumb = this.$scrollBar.find(".thumb");
      this.setScrollPosition(0, 0);
      this.resize();
      this.initMouseMoveScrolling();
      this.initMouseWheelScrolling();
      this.initTouchScrolling();
      this.initMouseClickScrolling();
      this.initWindowResize();
    }

    Scrollbar.prototype = {

      resize:function () {
        this.scrollable.$viewPort.height(this.scrollable.$element.height());
        this.sizing.size(this.scrollable.$viewPort, this.sizing.size(this.scrollable.$element));
        this.viewPortSize = this.sizing.size(this.scrollable.$viewPort);
        this.overviewSize = this.sizing.size(this.scrollable.$overview);
        this.ratio = this.viewPortSize / this.overviewSize;
        this.sizing.size(this.$scrollBar, this.viewPortSize);
        this.thumbSize = Math.round(this.ratio * this.viewPortSize);
        this.sizing.size(this.$thumb, this.thumbSize);
        this.maxThumbPosition = this.calculateMaxThumbPosition();
        this.maxOverviewPosition = this.calculateMaxOverviewPosition();
        this.enabled = (this.overviewSize > this.viewPortSize);
        if (this.scrollPercent === undefined)
          this.scrollPercent = 0.0;
        if (this.enabled)
          this.rescroll();
        else
          this.setScrollPosition(0, 0);
        this.$scrollBar.toggle(this.enabled);
      },

      initMouseMoveScrolling:function () {
        var _this = this;
        this.$thumb.mousedown(function (event) {
          if (_this.enabled)
            _this.startMouseMoveScrolling(event);
        });
        this.documentMouseup = function (event) {
          _this.stopMouseMoveScrolling(event);
        };
        $(document).mouseup(this.documentMouseup);
        this.documentMousemove = function (event) {
          _this.mouseMoveScroll(event);
        };
        $(document).mousemove(this.documentMousemove);
        this.$thumb.click(function (event) {
          event.stopPropagation();
        });
      },
      
      removeMouseMoveScrolling: function() {
        this.$thumb.unbind();
        $(document).unbind("mouseup", this.documentMouseup);
        $(document).unbind("mousemove", this.documentMousemove);
      },

      initMouseWheelScrolling:function () {
        var _this = this;
        this.scrollable.$element.mousewheel(function (event, delta, deltaX, deltaY) {
          if (_this.enabled) {
            _this.mouseWheelScroll(deltaX, deltaY);
            event.preventDefault();
            event.stopPropagation();
          }
        });
      },

      removeMouseWheelScrolling: function() {
        this.scrollable.$element.unbind("mousewheel");
      },

      initTouchScrolling:function () {
        if (document.addEventListener) {
          var _this = this;
          this.elementTouchstart = function (event) {
            if (_this.enabled)
              _this.startTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchstart", this.elementTouchstart);
          this.documentTouchmove = function (event) {
            _this.touchScroll(event);
          }
          document.addEventListener("touchmove", this.documentTouchmove);
          this.elementTouchend = function (event) {
            _this.stopTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchend", this.elementTouchend);
        }
      },
      
      removeTouchScrolling: function() {
        if(document.addEventListener) {
          this.scrollable.$element[0].removeEventListener("touchstart", this.elementTouchstart);
          document.removeEventListener("touchmove", this.documentTouchmove);
          this.scrollable.$element[0].removeEventListener("touchend", this.elementTouchend);
        }
      },

      initMouseClickScrolling:function () {
        var _this = this;
        this.scrollBarClick = function (event) {
          _this.mouseClickScroll(event);
        };
        this.$scrollBar.click(this.scrollBarClick);
      },

      removeMouseClickScrolling: function() {
        this.$scrollBar.unbind("click", this.scrollBarClick);
      },

      initWindowResize:function () {
        if (this.scrollable.options.updateOnWindowResize) {
          var _this = this;
          this.windowResize = function () {
            _this.resize();
          };
          $(window).resize(this.windowResize);
        }
      },

      removeWindowResize: function() {
        $(window).unbind("resize", this.windowResize);
      },
 
      isKeyScrolling:function (key) {
        return this.keyScrollDelta(key) != null;
      },

      keyScrollDelta:function (key) {
        for (var scrollingKey in this.sizing.scrollingKeys)
          if (scrollingKey == key)
            return this.sizing.scrollingKeys[key](this.viewPortSize);
        return null;
      },

      startMouseMoveScrolling:function (event) {
        this.mouseMoveScrolling = true;
        $("html").addClass("not-selectable");
        this.setUnselectable($("html"), "on");
        this.setScrollEvent(event);
      },

      stopMouseMoveScrolling:function (event) {
        this.mouseMoveScrolling = false;
        $("html").removeClass("not-selectable");
        this.setUnselectable($("html"), null);
      },

      setUnselectable:function (element, value) {
        if (element.attr("unselectable") != value) {
          element.attr("unselectable", value);
          element.find(':not(input)').attr('unselectable', value);
        }
      },

      mouseMoveScroll:function (event) {
        if (this.mouseMoveScrolling)
          this.moveScroll(event, 1);
      },

      moveScroll:function (event, turn) {
        var delta = this.sizing.mouseDelta(this.scrollEvent, event) * turn;
        this.scrollBy(Math.round(delta * this.overviewSize / this.viewPortSize));
        this.setScrollEvent(event);
      },

      startTouchScrolling:function (event) {
        if (event.touches && event.touches.length > 0) {
          this.setScrollEvent(event.touches[0]);
          this.touchScrolling = true;
        }
      },

      touchScroll:function (event) {
        if (this.touchScrolling && event.touches && event.touches.length > 0) {
          this.moveScroll(event.touches[0], -1);
          event.preventDefault();
        }
      },

      stopTouchScrolling:function (event) {
        this.touchScrolling = false;
      },

      mouseWheelScroll:function (deltaX, deltaY) {
        var delta = this.sizing.wheelDelta(deltaX, deltaY) * -20;
        if (delta != 0)
          this.scrollBy(delta);
      },

      mouseClickScroll:function (event) {
        var delta = this.viewPortSize - 20;
        if (event["page" + this.sizing.scrollAxis()] < this.$thumb.offset()[this.sizing.offsetComponent()])
        // mouse click over thumb
          delta = -delta;
        this.scrollBy(delta);
      },

      keyScroll:function (event) {
        var keyDown = event.which;
        if (this.enabled && this.isKeyScrolling(keyDown)) {
          this.scrollBy(this.keyScrollDelta(keyDown));
          event.preventDefault();
        }
      },

      scrollBy:function (delta) {
        var overviewPosition = -this.scrollable.$overview.position()[this.sizing.offsetComponent()];
        overviewPosition += delta;
        this.scrollTo(overviewPosition);
      },

      scrollTo:function (overviewPosition) {
        if (overviewPosition < 0)
          overviewPosition = 0;
        if (overviewPosition > this.maxOverviewPosition)
          overviewPosition = this.maxOverviewPosition;
        var oldScrollPercent = this.scrollPercent;
        this.scrollPercent = overviewPosition / this.maxOverviewPosition;
        var thumbPosition = this.scrollPercent * this.maxThumbPosition;
        this.setScrollPosition(overviewPosition, thumbPosition);
        if (oldScrollPercent != this.scrollPercent)
          this.triggerCustomScroll(oldScrollPercent);
      },

      triggerCustomScroll:function (oldScrollPercent) {
        this.scrollable.$element.trigger("customScroll", {
            scrollAxis:this.sizing.scrollAxis(),
            direction:this.sizing.scrollDirection(oldScrollPercent, this.scrollPercent),
            scrollPercent:Math.round(this.scrollPercent * 100)
          }
        );
      },

      rescroll:function () {
        var thumbPosition = this.scrollPercent * this.maxThumbPosition;
        var overviewPosition = this.scrollPercent * this.maxOverviewPosition;
        this.setScrollPosition(overviewPosition, thumbPosition);
      },

      setScrollPosition:function (overviewPosition, thumbPosition) {
        this.$thumb.css(this.sizing.offsetComponent(), thumbPosition + "px");
        this.scrollable.$overview.css(this.sizing.offsetComponent(), -overviewPosition + "px");
      },

      calculateMaxThumbPosition:function () {
        return this.sizing.size(this.$scrollBar) - this.thumbSize;
      },

      calculateMaxOverviewPosition:function () {
        return this.sizing.size(this.scrollable.$overview) - this.sizing.size(this.scrollable.$viewPort);
      },

      setScrollEvent:function (event) {
        var attr = "page" + this.sizing.scrollAxis();
        if (!this.scrollEvent || this.scrollEvent[attr] != event[attr])
          this.scrollEvent = {pageX:event.pageX, pageY:event.pageY};
      },

      scrollToElement:function (element) {
        var $element = element;
        if (this.sizing.isInside($element, this.scrollable.$overview) && !this.sizing.isInside($element, this.scrollable.$viewPort)) {
          var elementOffset = $element.offset();
          var overviewOffset = this.scrollable.$overview.offset();
          var viewPortOffset = this.scrollable.$viewPort.offset();
          this.scrollTo(elementOffset[this.sizing.offsetComponent()] - overviewOffset[this.sizing.offsetComponent()]);
        }
      },
      
      remove: function() {
        this.removeMouseMoveScrolling();
        this.removeMouseWheelScrolling();
        this.removeTouchScrolling();
        this.removeMouseClickScrolling();
        this.removeWindowResize();
      }
      
    }

    var HSizing = function () {
    }

    HSizing.prototype = {
      size:function ($el, arg) {
        if (arg)
          return $el.width(arg);
        else
          return $el.width();
      },

      scrollBar:function ($el) {
        return $el.find(".scroll-bar.horizontal");
      },

      mouseDelta:function (event1, event2) {
        return event2.pageX - event1.pageX;
      },

      offsetComponent:function () {
        return "left";
      },

      wheelDelta:function (deltaX, deltaY) {
        return deltaX;
      },

      scrollAxis:function () {
        return "X";
      },

      scrollDirection:function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "right" : "left";
      },

      scrollingKeys:{
        37:function (viewPortSize) {
          return -10; //arrow left
        },
        39:function (viewPortSize) {
          return 10; //arrow right
        }
      },

      isInside:function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width());
      }

    }

    var VSizing = function () {
    }

    VSizing.prototype = {
      size:function ($el, arg) {
        if (arg)
          return $el.height(arg);
        else
          return $el.height();
      },

      scrollBar:function ($el) {
        return $el.find(".scroll-bar.vertical");
      },

      mouseDelta:function (event1, event2) {
        return event2.pageY - event1.pageY;
      },

      offsetComponent:function () {
        return "top";
      },

      wheelDelta:function (deltaX, deltaY) {
        return deltaY;
      },

      scrollAxis:function () {
        return "Y";
      },

      scrollDirection:function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "down" : "up";
      },

      scrollingKeys:{
        38:function (viewPortSize) {
          return -10; //arrow up
        },
        40:function (viewPortSize) {
          return 10; //arrow down
        },
        33:function (viewPortSize) {
          return -(viewPortSize - 20); //page up
        },
        34:function (viewPortSize) {
          return viewPortSize - 20; //page down
        }
      },

      isInside:function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height());
      }

    }

    return this.each(function () {
      if (options == undefined)
        options = defaultOptions;
      if (typeof(options) == "string") {
        var scrollable = $(this).data("scrollable");
        if (scrollable)
          scrollable[options](args);
      }
      else if (typeof(options) == "object") {
        options = $.extend(defaultOptions, options);
        new Scrollable($(this), options);
      }
      else
        throw "Invalid type of options";
    });

  }
  ;

})
  (jQuery);

(function ($) {

  var types = ['DOMMouseScroll', 'mousewheel'];

  if ($.event.fixHooks) {
    for (var i = types.length; i;) {
      $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
  }

  $.event.special.mousewheel = {
    setup:function () {
      if (this.addEventListener) {
        for (var i = types.length; i;) {
          this.addEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = handler;
      }
    },

    teardown:function () {
      if (this.removeEventListener) {
        for (var i = types.length; i;) {
          this.removeEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = null;
      }
    }
  };

  $.fn.extend({
    mousewheel:function (fn) {
      return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },

    unmousewheel:function (fn) {
      return this.unbind("mousewheel", fn);
    }
  });


  function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";

    // Old school scrollwheel delta
    if (orgEvent.wheelDelta) {
      delta = orgEvent.wheelDelta / 120;
    }
    if (orgEvent.detail) {
      delta = -orgEvent.detail / 3;
    }

    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;

    // Gecko
    if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
      deltaY = 0;
      deltaX = delta;
    }

    // Webkit
    if (orgEvent.wheelDeltaY !== undefined) {
      deltaY = orgEvent.wheelDeltaY / 120;
    }
    if (orgEvent.wheelDeltaX !== undefined) {
      deltaX =  orgEvent.wheelDeltaX / 120;
    }

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    return ($.event.dispatch || $.event.handle).apply(this, args);
  }

})(jQuery);
