<?php defined( 'WPINC' ) or die; ?>

<?php // todo This is just a mockup to get the UI down first. When we start building the JS out, it'll be deconstructed into Backbone templates ?>
<?php // todo i18n ?>
<?php // todo rename to interface.php or something ?>

<div id="idi-container" class="notification-dialog-wrap">
	<div class="notification-dialog-background"></div>

	<div id="idi-dialog" class="notification-dialog">
		<a class="media-modal-close" href="#">
			<span class="media-modal-icon">
				<span class="screen-reader-text">Close media panel</span>
			</span>
		</a>

		<h3 id="idi-introduction">Start typing to open any links on the current page</h3>

		<input id="idi-search-field" name="" type="text" placeholder="e.g., Posts, Settings, Plugins, Comments, etc" />

		<p id="idi-instructions">Use the <code>Up</code> and <code>Down</code> arrow keys to navigate, and press <code>Enter</code> to open a link.</p>

		<ul id="idi-search-results"></ul>
	</div> <!-- #idi-dialog-->
</div>
