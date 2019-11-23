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
 * Render the view for the warning notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Warning( { children } ) {
	return (
		<div className="notice notice-warning inline">
			{ children }
		</div>
	);
}

/**
 * Render a warning that the browser isn't capable of fetching the content index.
 *
 * @return {Element}
 */
export function CantFetchWarning() {
	return (
		<Warning>
			<p>
				{ __(
					'Posts cannot be searched because your browser is too old; only links from the current page will be available.',
					'quick-navigation-interface'
				) }
			</p>

			<div>
				<RawHTML>
					{ sprintf(
						/*
						 * SECURITY WARNING: This string is intentionally not internationalized.
						 * See Instructions component for details.
						 */
						'If you can, please <a href="%s">upgrade to a newer version</a>.',
						'https://browsehappy.com/'
					) }
				</RawHTML>
			</div>
		</Warning>
	);
}

/**
 * Render a warning notice that there was an error fetching the content index.
 *
 * @return {Element}
 */
export function FetchErrorWarning( { error } ) {
	return (
		<Warning>
			<p>
				{ __(
					'Posts cannot be searched because an error occured; only links from the current page will be available.',
					'quick-navigation-interface'
				) }
			</p>

			<div>
				<RawHTML>
					{ sprintf(
						/*
						 * SECURITY WARNING: This string is intentionally not internationalized.
						 * See Instructions component for details.
						 */
						'Details: <code>%s</code>',
						error
					) }
				</RawHTML>
			</div>
		</Warning>
	);
}
