(function ($) {

  $.fn.customScrollbar = function (options, args) {

    Scrollable = function (element) {

      this.init = function ($element, options) {
        this.$element = $element;
        this.$element.addClass("scrollable");
        this.addScrollBarComponents();
        this.vScrollbar = new Scrollbar(this, new VSizing());
        this.hScrollbar = new Scrollbar(this, new HSizing());
        this.$element.data("scrollable", this);
        if (window.jQueryCustomScrollbars == undefined)
          window.jQueryCustomScrollbars = [];
        this.addToScrollbarsHierarchy();
        this.initKeyboardScrolling();
      }

      this.addScrollBarComponents = function () {
        this.assignViewPort();
        if (this.$viewPort.length == 0) {
          this.$element.wrapInner("<div class=\"viewport\" />")
          this.assignViewPort();
        }
        this.assignOverview();
        if (this.$overview.length == 0) {
          this.$viewPort.wrapInner("<div class=\"overview\" />")
          this.assignOverview();
        }
        this.addScrollBar("vertical", "prepend");
        this.addScrollBar("horizontal", "append");
      }

      this.assignViewPort = function () {
        this.$viewPort = this.$element.find(".viewport");
      }

      this.assignOverview = function () {
        this.$overview = this.$viewPort.find(".overview");
      }

      this.addScrollBar = function (orientation, fun) {
        if (this.$element.find(".scroll-bar." + orientation).length == 0)
          this.$element[fun]("<div class='scroll-bar " + orientation + "'><div class='thumb'></div></div>")
      }

      this.resize = function () {
        this.vScrollbar.resize();
        this.hScrollbar.resize();
      }

      this.scrollTo = function (element) {
        var $element = $(element);
        if (this.isInside(element, this.$overview) && !this.isInside(element, this.$viewPort)) {
          var elementOffset = $element.offset();
          var overviewOffset = this.$overview.offset();
          this.scrollToXY(elementOffset.left - overviewOffset.left, elementOffset.top - overviewOffset.top);
        }
      }

      this.scrollToXY = function (x, y) {
        this.hScrollbar.scrollTo(x);
        this.vScrollbar.scrollTo(y);
      }

      this.scrollToX = function (x) {
        this.hScrollbar.scrollTo(x);
      }

      this.scrollToY = function (y) {
        this.vScrollbar.scrollTo(y);
      }

      this.isInside = function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = this.$overview.offset();
        return (elementOffset.top >= wrappingElementOffset.top) && (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height()) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width());
      }

      this.addNested = function (otherScrollable) {
        if (this.addNestedToOneFromList(this.nestedScrollbars, otherScrollable))
          return true;
        else if (this.isInside(otherScrollable.$viewPort, this.$overview)) {
          this.nestedScrollbars.push(otherScrollable);
          return true;
        }
        else
          return false;
      }

      this.addToScrollbarsHierarchy = function () {
        this.nestedScrollbars = [];
        if (!this.addNestedToOneFromList(this, window.jQueryCustomScrollbars))
          window.jQueryCustomScrollbars.push(this);
      }

      this.addNestedToOneFromList = function (scrollable, list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].addNested(scrollable))
            return true;
          else if (scrollable.addNested(list[i])) {
            list[i] = scrollable;
            return true;
          }
        }
        return false;
      }

      this.isMouseOver = function () {
        for (var i = 0; i < this.nestedScrollbars.length; i++)
          if (this.nestedScrollbars[i].isMouseOver())
            return false;
        var offset = this.$element.offset();
        var w = this.$element.width();
        var h = this.$element.height();
        return this.lastMouseEvent &&
          (this.lastMouseEvent.pageX >= offset.left) && (this.lastMouseEvent.pageX <= offset.left + w) &&
          (this.lastMouseEvent.pageY >= offset.top) && (this.lastMouseEvent.pageY <= offset.top + h);
      }

      this.initKeyboardScrolling = function () {
        var _this = this;
        $(document).keydown(function (event) {
          if (_this.isMouseOver()) {
            _this.vScrollbar.keyScroll(event);
            _this.hScrollbar.keyScroll(event);
          }
        });
        $(document).mousemove(function (event) {
          _this.lastMouseEvent = event;
        });
      }

      this.init(element);

    }

    Scrollbar = function (scrollable, sizing) {

      this.init = function (scrollable, sizing) {
        this.scrollable = scrollable;
        this.sizing = sizing
        this.$scrollBar = this.sizing.scrollBar(this.scrollable.$element);
        this.$thumb = this.$scrollBar.find(".thumb");
        this.resize();
        this.initMouseMoveScrolling();
        this.initMouseWheelScrolling();
        this.initTouchScrolling();
        this.initMouseClickScrolling();
        this.initWindowResize();
      }

      this.resize = function () {
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
        if (this.scrollPercent === undefined)
          this.scrollPercent = 0.0;
        this.rescroll();
        this.enabled = (this.overviewSize > this.viewPortSize);
        this.$scrollBar.toggle(this.enabled);
      }

      this.initMouseMoveScrolling = function () {
        var _this = this;
        this.$thumb.mousedown(function (event) {
          if (_this.enabled)
            _this.startMouseMoveScrolling(event);
        });
        $(document).mouseup(function (event) {
          _this.stopMouseMoveScrolling(event);
        });
        $(document).mousemove(function (event) {
          _this.mouseMoveScroll(event);
        });
        this.$thumb.click(function (event) {
          event.stopPropagation();
        });
      }

      this.initMouseWheelScrolling = function () {
        var _this = this;
        this.scrollable.$element.mousewheel(function (event, delta, deltaX, deltaY) {
          if (_this.enabled) {
            _this.mouseWheelScroll(deltaX, deltaY);
            event.preventDefault();
            event.stopPropagation();
          }
        });
      }

      this.initTouchScrolling = function () {
        if (document.addEventListener) {
          var _this = this;
          this.scrollable.$element[0].addEventListener("touchstart", function (event) {
            if (_this.enabled)
              _this.startTouchScrolling(event);
          });
          document.addEventListener("touchmove", function (event) {
            _this.touchScroll(event);
          });
          this.scrollable.$element[0].addEventListener("touchend", function (event) {
            _this.stopTouchScrolling(event);
          });
        }
      }

      this.initMouseClickScrolling = function () {
        var _this = this;
        this.$scrollBar.click(function (event) {
          _this.mouseClickScroll(event);
        })
      }

      this.initWindowResize = function () {
        var _this = this;
        $(window).resize(function () {
          _this.resize();
        });
      }

      this.isKeyScrolling = function (key) {
        return this.keyScrollDelta(key) != null;
      }

      this.keyScrollDelta = function (key) {
        for (var scrollingKey in this.sizing.scrollingKeys)
          if (scrollingKey == key)
            return this.sizing.scrollingKeys[key](this.viewPortSize);
        return null;
      }

      this.startMouseMoveScrolling = function (event) {
        this.mouseMoveScrolling = true;
        $("html").addClass("not-selectable");
        this.setUnselectable($("html"), "on");
        this.setScrollEvent(event);
      }

      this.stopMouseMoveScrolling = function (event) {
        this.mouseMoveScrolling = false;
        $("html").removeClass("not-selectable");
        this.setUnselectable($("html"), null);
      }

      this.setUnselectable = function (element, value) {
        if (element.attr("unselectable") != value) {
          element.attr("unselectable", value);
          element.find(':not(input)').attr('unselectable', value);
        }
      }

      this.mouseMoveScroll = function (event) {
        if (this.mouseMoveScrolling)
          this.moveScroll(event, 1);
      }

      this.moveScroll = function (event, turn) {
        var delta = this.sizing.mouseDelta(this.scrollEvent, event) * turn;
        this.scrollBy(Math.round(delta * this.overviewSize / this.viewPortSize));
        this.setScrollEvent(event);
      }

      this.startTouchScrolling = function (event) {
        if (event.touches && event.touches.length > 0) {
          this.setScrollEvent(event.touches[0]);
          this.touchScrolling = true;
          event.preventDefault();
          event.stopPropagation();
        }
      }

      this.touchScroll = function (event) {
        if (this.touchScrolling && event.touches && event.touches.length > 0) {
          this.moveScroll(event.touches[0], -1);
          event.preventDefault();
          event.stopPropagation();
        }
      }

      this.stopTouchScrolling = function (event) {
        this.touchScrolling = false;
        event.preventDefault();
        event.stopPropagation();
      }

      this.mouseWheelScroll = function (deltaX, deltaY) {
        var delta = this.sizing.wheelDelta(deltaX, deltaY) * -10;
        if (delta != 0)
          this.scrollBy(delta);
      }

      this.mouseClickScroll = function (event) {
        var delta = this.viewPortSize - 20;
        if (event["page" + this.sizing.scrollAxis()] < this.$thumb.offset()[this.sizing.offsetComponent()])
        // mouse click over thumb
          delta = -delta;
        this.scrollBy(delta);
      }

      this.keyScroll = function (event) {
        var keyDown = event.which;
        if (this.enabled && this.isKeyScrolling(keyDown))
          this.scrollBy(this.keyScrollDelta(keyDown));
      }

      this.scrollBy = function (delta) {
        var overviewPosition = -this.scrollable.$overview.position()[this.sizing.offsetComponent()];
        overviewPosition += delta;
        this.scrollTo(overviewPosition);
      }

      this.scrollTo = function (overviewPosition) {
        if (overviewPosition < 0)
          overviewPosition = 0;
        if (overviewPosition > this.maxOverviewPosition)
          overviewPosition = this.maxOverviewPosition;
        this.scrollPercent = overviewPosition / this.maxOverviewPosition;
        var thumbPosition = this.scrollPercent * this.maxThumbPosition;
        this.setScrollPosition(overviewPosition, thumbPosition);
      }

      this.rescroll = function () {
        if (this.scrollPercent != 0.0) {
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          var overviewPosition = this.scrollPercent * this.maxOverviewPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
        }
      }

      this.setScrollPosition = function (overviewPosition, thumbPosition) {
        this.$thumb.css(this.sizing.offsetComponent(), thumbPosition + "px");
        this.scrollable.$overview.css(this.sizing.offsetComponent(), -overviewPosition + "px");
      }

      this.calculateMaxThumbPosition = function () {
        return this.sizing.size(this.$scrollBar) - this.thumbSize;
      }

      this.calculateMaxOverviewPosition = function () {
        return this.sizing.size(this.scrollable.$overview) - this.sizing.size(this.scrollable.$viewPort);
      }

      this.setScrollEvent = function (event) {
        var attr = "page" + this.sizing.scrollAxis();
        if (!this.scrollEvent || this.scrollEvent[attr] != event[attr])
          this.scrollEvent = {pageX:event.pageX, pageY:event.pageY};
      }

      this.init(scrollable, sizing)

    }

    HSizing = function () {

      this.size = function ($el, arg) {
        if (arg)
          return $el.width(arg);
        else
          return $el.width();
      }

      this.scrollBar = function ($el) {
        return $el.find(".scroll-bar.horizontal");
      }

      this.mouseDelta = function (event1, event2) {
        return event2.pageX - event1.pageX;
      }

      this.offsetComponent = function () {
        return "left";
      }

      this.wheelDelta = function (deltaX, deltaY) {
        return deltaX;
      }

      this.scrollAxis = function () {
        return "X";
      }

      this.scrollingKeys = {
        37:function (viewPortSize) {
          return -10; //arrow left
        },
        39:function (viewPortSize) {
          return 10; //arrow right
        }
      }

    }

    VSizing = function () {

      this.size = function ($el, arg) {
        if (arg)
          return $el.height(arg);
        else
          return $el.height();
      }

      this.scrollBar = function ($el) {
        return $el.find(".scroll-bar.vertical");
      }

      this.mouseDelta = function (event1, event2) {
        return event2.pageY - event1.pageY;
      }

      this.offsetComponent = function () {
        return "top";
      }

      this.wheelDelta = function (deltaX, deltaY) {
        return deltaY;
      }

      this.scrollAxis = function () {
        return "Y";
      }

      this.scrollingKeys = {
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
      }

    }

    return this.each(function () {
      if (options && typeof(options) == "string") {
        var scrollable = $(this).data("scrollable");
        scrollable[options](args);
      }
      else
        new Scrollable($(this), options);
    });

  };

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
      deltaX = -1 * delta;
    }

    // Webkit
    if (orgEvent.wheelDeltaY !== undefined) {
      deltaY = orgEvent.wheelDeltaY / 120;
    }
    if (orgEvent.wheelDeltaX !== undefined) {
      deltaX = -1 * orgEvent.wheelDeltaX / 120;
    }

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    return ($.event.dispatch || $.event.handle).apply(this, args);
  }

})(jQuery);