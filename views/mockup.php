<?php // todo This is just a mockup to get the UI down first. When we start building the JS out, it'll be deconstructed into Backbone templates ?>
<?php // todo i18n ?>

<div id="idi-container" class="notification-dialog-wrap">
	<div class="notification-dialog-background"></div>

	<div id="idi-dialog" class="notification-dialog">
		<h3 id="idi-introduction">Start typing to open any links on the current page</h3>

		<input id="idi-search" name="" type="text" placeholder="e.g., Posts, Settings, Plugins, Comments, etc" />

		<p id="idi-instructions">Use the <code>Up</code> and <code>Down</code> arrow keys to navigate, and press <code>Enter</code> to open a link.</p>

		<ul id="idi-menu">
			<li><a href="#">Appearance > <span class="query-match">Theme</span></a></li>
			<li class="idi-active"><a href="#">Customize</a></li>
			<li><a href="#">Widgets</a></li>
			<li><a href="#">Menus</a></li>
		</ul>
	</div> <!-- #idi-dialog-->
</div>
