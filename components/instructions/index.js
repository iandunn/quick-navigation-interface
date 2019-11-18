/**
 * WordPress dependencies
 */
import { RawHTML }     from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';


/**
 * Render usage instructions for the user.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
export function Instructions( { shortcuts } ) {
	return (
		<div id="qni-instructions">
			<RawHTML>
				{ sprintf(
					/*
					 * SECURITY WARNING: This string is intentionally not internationalized, because there
					 * isn't a secure way to do that yet.
					 *
					 * See https://github.com/WordPress/gutenberg/issues/9846.
					 * See https://github.com/WordPress/gutenberg/issues/13156.
					 */
					'Use <code>%1$s</code> and <code>%2$s</code> to navigate links, <code>%3$s</code> to open one, and <code>%4$s</code> to quit.',
					shortcuts[ 'previous-link' ].label,
					shortcuts[ 'next-link' ].label,
					shortcuts[ 'open-link' ].label,
					__( 'Escape', 'quick-navigation-interface' ),
				) }
			</RawHTML>
		</div>
	);
}
