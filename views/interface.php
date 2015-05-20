<?php defined( 'WPINC' ) or die; ?>

<div id="idi-container" class="notification-dialog-wrap">
	<div class="notification-dialog-background"></div>

	<div id="idi-dialog" class="notification-dialog">
		<a class="media-modal-close" href="#">
			<span class="media-modal-icon">
				<span class="screen-reader-text"><?php _e( 'Close media panel', 'intent-driven-interface' ); ?></span>
			</span>
		</a>

		<h3 id="idi-introduction"><?php _e( 'Start typing to open any links on the current page', 'intent-driven-interface' ); ?></h3>

		<input id="idi-search-field" name="" type="text" placeholder="<?php _e( 'e.g., Posts, Settings, Plugins, Comments, etc', 'intent-driven-interface' ); ?>" />

		<p id="idi-instructions">
			<?php printf(
				__( 'Use the <code>%s</code> and <code>%s</code> keys to navigate, and press <code>%s</code> to open a link.', 'intent-driven-interface' ),
				esc_html( $this->options['shortcuts']['previous-link']['label'] ),
				esc_html( $this->options['shortcuts']['next-link'    ]['label'] ),
				esc_html( $this->options['shortcuts']['open-link'    ]['label'] )
			); ?>
		</p>

		<ul id="idi-search-results"></ul>
	</div> <!-- #idi-dialog-->
</div>
