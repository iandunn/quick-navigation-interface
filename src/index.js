/**
 * WordPress dependencies
 */
const { apiFetch }              = wp;
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './main/controller';

( function() {
	const container = document.createElement( 'div' );
	let props;

	/**
	 * Get all links on the current page
	 *
	 * @returns {Array}
	 */
	function getCurrentPageLinks() {
		const links = [];
		let parentTitle, type, title, url;

		for ( const link of document.getElementsByTagName( 'a' ) ) {
			parentTitle = '';
			type        = 'link';
			title       = link.textContent;
			url         = link.getAttribute( 'href' );

			// This can be simplified if JS ever provides an alternative to jQuery.closest().
				// todo wait, there is one? see wp-polyfill-element-closest

			if ( link.parentNode.parentNode.classList.contains( 'wp-submenu' ) ) {
				parentTitle = link.parentNode.parentNode.parentNode.querySelector( '.wp-menu-name' ).textContent;
				type = 'menu item';
			} else if ( 'wp-admin-bar-new-content-default' === link.parentNode.parentNode.getAttribute( 'id' ) ) {
				title = document.querySelector( '#wp-admin-bar-new-content' ).querySelector( '.ab-label' ).textContent + ' ' + title;
				// todo "33 plugin links" when 3 plugins need updating
					// probably throw out the text in `ab-label`
					// or maybe shouldn't be searching for .ab-label above?
					// related https://github.com/iandunn/quick-navigation-interface/issues/2

				type = 'menu item';
			} else if ( -1 !== link.parentNode.id.indexOf( 'wp-admin-bar' ) ) {
				type = 'menu item';
			}

			// Overwrite duplicate items to create a unique list.
			const item  = { type, title, parentTitle, url };
			const id    = JSON.stringify( Object.values( item ) ).replace( /[^\w]/g, '' );
			links[ id ] = item;
		}

		// Return a simple array so it's smaller and easier to work with.
		return Object.values( links );
	}

	/**
	 * Render the app.
	 *
	 * @param {Element} container
	 * @param {Array}   props
	 */
	function renderApp( container, props ) {
		render(
			createElement( QuickNavigationInterface, props ),
			container
		);
	}

	/**
	 * Initialize the app.
	 */
	function init() {
		props = {
			browserCompatible : 'fetch' in window,
			// todo don't need ^ b/c G polyfills fetch
				// but will need it for Cache API, and maybe for indexdb

			error             : false,
			links             : getCurrentPageLinks(),
			...qniOptions,
				// todo should have an `options` key instead of cluttering the root level?
		};

		props.loading = props.browserCompatible;
		container.id  = 'qni-container';

		document.getElementById( 'wpwrap' ).appendChild( container );
		renderApp( container, props );

		if ( props.browserCompatible ) {
			// todo the old ajax query included `'user'   => get_current_user_id(),` in the url, should this do that too?
				// should always be the current user, don't want to see other users content, espec if logged out
				// maybe
			// it also used the content-index-timestamp as a cachebuster, do we still need that? i guess not b/c rest api sends headers to not cache?
			apiFetch( { path: '/quick-navigation-interface/v1/content-index/' } ).then( data => {
				props.links.push( ...data );
				// todo test when data empty, when server endpoint returns string or WP_Error
			} ).catch( error => {
				props.error = `${error.data.status} ${error.code}: ${error.message}`;
				// todo is it possible that error will ever just be a string rather than this object?
			} ).finally( () => {
				props.loading = false;
				renderApp( container, props );
			} );
		}

		/// todo this is just the first part. merge this, but then immediately need to work on local storage, b/c can't be making this http request on every page load

		// todo test that caching expiration works as expected, shouldn't fetch new index unless current one is expired
	}

	init();
}() );
