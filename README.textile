h1. jQuery Custom Scrollbar

jQuery Custom Scrollbar is a jQuery plugin that lets you add fully customizable scrollbars to your sites. With the plugin you can apply any css styles you want to your scrollbars.

h2. Features

* vertical and horizontal scrollbars you can style your own way
* scrolling by mouse dragging, mouse wheel, keyboard - just as you would with native browser scrollbar
* touch scrolling on mobile devices (Android, iPhone and iPad)
* a couple predefined skins showing you how to style scrollbars
* simple api that lets you scroll programmatically and be notified about scroll events

h2. Requirements

The plugin supports all major browsers: Chrome, Firefox, IE 7+.

To use the plugin you obviously need jQuery (it should work in jQuery 1.4 and later versions).

h2. Download

You can download the latest version "here":https://github.com/mzubala/jquery-custom-scrollbar/raw/master/build/jquery-custom-scrollbar-0.5.5.zip

h2. Demos

In <code>demos</code> folder of this repo, there are some example usages of custom scrollbar and its api. The demos are also available online "here":http://jquery-custom-scrollbar.rocketmind.pl/

h2. Usage

First download and add <code>jquery.custom-scrollbar.js</code> and <code>jquery.custom-scrollbar.css</code> to your site.

Suppose you have a container on your site with some lengthy content and you want to make it scrollable:

<pre><code>
<div class="container">
  <!-- Some lengthy content -->
</div>
</code></pre>

Define it's width and height (below some example size is used):

<pre><code>
.container {
  width: 300px; // you can also use max-width
  height: 400px; // you can also use max-height
}
</pre></code>

Add a skin class to your container:

<pre><code>
<div class="container default-skin">
  <!-- Some lengthy content -->
</div>
</pre></code>

In the example we use <code>default-skin</code>. Plugin comes with two other predefined skins: <code>gray-skin</code> and <code>modern-skin</code>. You are not limited to that and you can style scrollbar your own way.

Finally call this js code:

<pre><code>
$(document).ready(function() {
  $(".container").customScrollbar();
});
</pre></code>

If container content does not fit in those sizes scrollbar will appear.

The above method will add vertical scrollbar only. If you also want to add horizontal scrollbar, there is one more css step required:

<pre><code>
.container .overview {
  width: 1000px;
}
</pre></code>

This defines example total width of the scrolled content (not just the width of the visible part as in previous step).

h2. Options

There are some options you can pass when initializing scrollbar:

|_. Option |_. Type|_. Default value |_. Description |
| <code>animationSpeed</code> | <code>Number</code> | <code>300</code> | Speed of the animation of programmatic scrolling. It's possible to edit it with <code>setAnimationSpeed</code> method. Animation speed equal to <code>0</code> means no animation.|
| <code>fixedThumbHeight</code> | <code>Number</code> | <code>undefined</code> | By default thumb height (in case of vertical scrollbar) is calculated automatically depending on viewport and overview height but you can fix thumb height to your chosen pixel value by setting this option. Make sure to not set <code>min-height</code> in css if you set <code>fixedThumbHeight</code> because <code>min-height</code> has priority.|
| <code>fixedThumbWidth</code> | <code>Number</code> | <code>undefined</code> | Option analogical to <code>fixedThumbHeight</code> but applied to thumbs of horizontal scrollbars.|
| <code>hScroll</code> | <code>Boolean</code> | <code>true</code> | Indicates whether or not, horizontal scrollbar should be shown when it's necessary. |
| <code>preventDefaultScroll</code> | <code>Boolean</code> | <code>false</code> | When the scrolling event occurs (e.g. down arrow key, mouse wheel) and it doesn't cause the scrollbar to move (e.g. because the scrollbar is in extreme position), the event is propagated further which will cause the parent container to scroll. If it does cause the scrollbar movement then such event is stopped from propagating further and the parent container won't scroll. This default behaviour can be changed by setting <code>preventDefaultScroll: true</code>. It will cause the custom scrollbar to always stop scrolling event propagation no matter if the scrollbar changed or didn't change its position.|
| <code>skin</code>|<code>String</code>|<code>undefined</code>|A css skin class that will be added to the scrolled container. You can define it in html as well as here in options. Note that skin has to be defined in one of those ways.|
| <code>swipeSpeed</code>|<code>Number</code>|<code>1</code>|Indicates how fast touch scroll should be. When you swipe your finger by <code>x</code> pixels the content will be scrolled by <code>swipeSpeed * x</code> pixels.|
| <code>updateOnWindowResize</code> | <code>Boolean</code> | <code>false</code> | Indicates whether scrollbar should recalculate thumb size when window is resized. See <code>demos/resize.html</code> for an example.|
| <code>vScroll</code> | <code>Boolean</code> | <code>true</code> | Same as above but applies to vertical scrollbar. |
| <code>wheelSpeed</code>|<code>Number</code>|<code>40</code>|Indicates how fast mouse wheel scroll should be. When you make the smallest possible mouse wheel move, the content will be scrolled by <code>wheelSpeed</code> pixels.|

For example:

<pre><code>
$("#my-container").customScrollbar({
  skin: "default-skin", 
  hScroll: false,
  updateOnWindowResize: true
  })
</pre></code>

h2. API

There are some methods of the plugin you may want to call.

h3. setAnimationSpeed(speed)

Changes programmatic scroll animation speed to the passed <code>speed</code> - an integer indicating how many milliseconds the animation should last.

It's also possible to set the animation speed upon plugin initialization. By default it equals <code>300</code>.

Note that you may use this method if want to have some scrolls animated and some without animation - to get rid of the animation just call it with <code>0</code>.

<pre><code>
$(".container").customScrollbar("setAnimationSpeed", 200)
</pre></code>


h3. scrollTo(element)

Scrolls viewport to a given element inside scrolled content. An element might be jQuery object or a selector string. To control animation speed use <code>animationSpeed</code> initialization option. Example usage:

<pre><code>
$(".container").customScrollbar("scrollTo", "#some-element-inside-container")
</pre></code>

h3. scrollToX(x)

Sets horizontal scrollbar position to <code>x</code> pixels. <code>x</code> should be in range from 0 to scrolled content width. If it's outside that range, content will be scrolled to the start or to the end. To control animation speed use <code>animationSpeed</code> initialization option.

<pre><code>
$(".container").customScrollbar("scrollToX", 100)
</pre></code>

h3. scrollToY(y)

Sets vertical scrollbar position to <code>y</code> pixels. <code>x</code> should be in range from 0 to scrolled content height. If it's outside that range, content will be scrolled to the start or to the end. To control animation speed use <code>animationSpeed</code> initialization option.

<pre><code>
$(".container").customScrollbar("scrollToY", 200)
</pre></code>

h3. scrollByX(x)

Moves horizontal scrollbar by <code>x</code> pixels. <code>x</code> can be positive or negative.

<pre><code>
$(".container").customScrollbar("scrollByX", 100)
</pre></code>

h3. scrollByY(y)

Moves vertical scrollbar by <code>y</code> pixels. <code>y</code> can be positive or negative.

<pre><code>
$(".container").customScrollbar("scrollByY", 200)
</pre></code>

h3. resize(keepPosition)

Recalculates and sets sizes of all scrollbar components. Call this whenever your scrolled block changes its size and scrollbar becomes invalid. After you call it scrollbar is adjusted to new sizes of your block.

Use <code>keepPosition</code> parameter to decide if the scrollbar should stay in the same position (<code>keepPosition == true</code>) or change position (<code>keepPosition == true</code>) so that the thumb position change is proportional to the size change. The first case is useful if your container changes size and you want to show exactly the same content that was visible before size change. The second case is useful when you're listening to window resize.

<pre><code>
$(".container").customScrollbar("resize", true)
</pre></code>

h3. remove()

Removes all the DOM changes and event bindings added by the plugin.

<pre><code>
$(".container").customScrollbar("remove")
</pre></code>

h2. Events

h3. customScroll

Triggered whenever content is scrolled. Separate events are fired when vertical and horizontal scrollbar is moved.

<pre><code>
$(".container").on("customScroll", function(event, scrollData) {});
</pre></code>

Handler function takes two arguments. <code>event</code> is standard jquery event object. <code>scrollData</code> is an object with 3 fields holding scroll specific information:
* <code>scrollPercent</code> - floating point number in range 0.0 to 100.0 indicating percentage position of the scrollbar
* <code>scrollDirection</code> - string that can take following 4 values: <code>left</code>, <code>right</code>, <code>up</code>, <code>down</code> - indicates what direction the scrollbar was moved in
* <code>scrollAxis</code> - string indicating which scrollbar was moved: <code>X</code> for horizontal scrollbar and <code>Y</code> for vertical scrollbar

You can also bind handler to that event when initializing scrollbar:

<pre><code>
$(".container").customScrollbar({
  onCustomScroll: function(event, scrollData) {}
});
</pre></code>

h2. License

The plugin is released under "MIT license":http://www.opensource.org/licenses/MIT.
