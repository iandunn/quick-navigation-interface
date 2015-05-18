<?php defined( 'WPINC' ) or die; ?>

<?php // todo i18n ?>

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

		<p id="idi-instructions">
			Use the <code><?php echo esc_html( $shortcuts['previous-link'] ); ?></code> and <code><?php echo esc_html( $shortcuts['next-link'] ); ?></code>
			keys to navigate, and press <code><?php echo esc_html( $shortcuts['open-link'] ); ?></code> to open a link.
		</p>

		<ul id="idi-search-results"></ul>
	</div> <!-- #idi-dialog-->
</div>
