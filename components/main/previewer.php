<?php

namespace Quick_Navigation_Interface;
defined( 'WPINC' ) || die();

add_action( 'customize_preview_init', function() {
	add_action( 'wp_print_scripts', __NAMESPACE__ . '\print_customizer_preview_scripts' );
} );


/**
 * Print scripts for the Customizer's Preview frame.
 */
function print_customizer_preview_scripts() {
	?>

	<script>
		document.addEventListener( 'DOMContentLoaded', function () {
			window.addEventListener( 'keyup', function ( event ) {
				/*
				 * `event` itself can't be sent, because its properties aren't enumerable, so we just create a
				 * new object with the ones that we'll actually use later on. This is a bit fragile, because
				 * it needs to be updated when `MainController.handleKeyboardEvents()` et al start using a new
				 * value, but it seems like the least-bad option.
				 *
				 * @see https://stackoverflow.com/q/48054951/450127
				 */
				var minimalEvent = {
					which    : event.which,
					altKey   : event.altKey,
					ctrlKey  : event.ctrlKey,
					metaKey  : event.metaKey,
					shiftKey : event.shiftKey,

					target : {
						tagName         : event.target.tagName,
						type            : event.target.type,
						contentEditable : event.target.contentEditable
					},
				};

				var messenger = new wp.customize.Messenger( {
					channel      : 'quick-navigation-interface',
					targetWindow : window.parent,
					url          : wp.customize.settings.url.allowed[ 0 ],
				} );

				// See `proxyPreviewerKeyboardEvents()` for the receiver.
				messenger.send( 'qni-previewer-keyup', minimalEvent );
			} );
		} );
	</script>

	<?php
}
