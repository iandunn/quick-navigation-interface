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
				// todo, anything else to add here? localstorage when do that.. not needed now b/c G polyfills? does it polyfill local storage to? or what does it use?
					// ie11 doesn't support fetch, so cherry-pick the incompatbrowser thing from local-storage branch, and render that if fetch isn't supported
					// test on ie11
					// actually, don't need this right now, because gutenberg polyfills fetch?
						// er, does it? i don't see one. are they just using it even though ie11 doesn't support it?
					// but will need it for localstorage? does G have a polyfill for that too?

			error             : false,
			loading           : true,
			links             : getCurrentPageLinks(),
			...qniOptions,
				// todo should have an `options` key instead of cluttering the root level?
		};

		container.id = 'qni-container';
		document.getElementById( 'wpwrap' ).appendChild( container );
		renderApp( container, props );

		apiFetch( { path: '/quick-navigation-interface/v1/content-index/' } )
			.then( data => {
				props.links.push( ...data );
				// todo test when data empty, when server endpoint returns string or WP_Error
			} )
			.catch( error => {
				props.error = `${error.data.status} ${error.code}: ${error.message}`;
				// todo is it possible that error will ever just be a string rather than this object?
			} )
			.finally( function() {
				props.loading = false;
				renderApp( container, props );
			} );

		/// todo this is just the first part. merge this, but then immediately need to work on local storage, b/c can't be making this http request on every page load
	}

	init();
}() );
