<?php defined( 'WPINC' ) or die; ?>

<div id="qni-container" class="notification-dialog-wrap">
	<div class="notification-dialog-background"></div>

	<div id="qni-dialog" class="notification-dialog">
		<a class="media-modal-close" href="#">
			<span class="media-modal-icon">
				<span class="screen-reader-text"><?php _e( 'Close media panel', 'quick-navigation-interface' ); ?></span>
			</span>
		</a>

		<h3 id="qni-introduction"><?php _e( 'Start typing to open any links on the current page', 'quick-navigation-interface' ); ?></h3>

		<input id="qni-search-field" name="" type="text" placeholder="<?php _e( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ); ?>" />

		<p id="qni-instructions">
			<?php printf(
				__( 'Use the <code>%s</code> and <code>%s</code> keys to navigate, and press <code>%s</code> to open a link.', 'quick-navigation-interface' ),
				esc_html( $shortcuts['previous-link']['label'] ),
				esc_html( $shortcuts['next-link'    ]['label'] ),
				esc_html( $shortcuts['open-link'    ]['label'] )
			); ?>
		</p>

		<ul id="qni-search-results"></ul>
	</div> <!-- #qni-dialog-->
</div>
