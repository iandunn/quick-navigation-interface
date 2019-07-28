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
				// todo ideally don't want to create an empty value in the object, takes up room in memory and cache storage. if there isn't a parent title just don't add that property
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
			// todo need createElement here, or just <QuickNavigationInterface ...props> ?
			// probably just do ^
			container
		);
	}

	/**
	 * Initialize the app.
	 */
	function init() {
		props = {
			browserCompatible : 'fetch' in window && 'caches' in window,
			// todo probably don't need ^ to check fetch b/c G polyfills window.fetch. probably doesn't hurt to leave it. it remove it, document that can assume it exists b/c G polyfill
			// todo test in older browser that doesn't support fetch and caches, fetch should be polyfilled but lack of `caches` should trigger failure

			error             : false,
			links             : getCurrentPageLinks(),
			...qniOptions,
				// todo should have an `options` key instead of cluttering the root level?
				// also don't want to pass in things like nonce and root-url
		};

		props.loading = props.browserCompatible;
		container.id  = 'qni-container';

		document.getElementById( 'wpwrap' ).appendChild( container );

		// todo explain rendering immediately w/ the data we already have on the page, then will render again later when we have more data from the api request
		renderApp( container, props );

		if ( props.browserCompatible ) {
			// todo the old ajax query included `'user'   => get_current_user_id(),` in the url, should this do that too?
				// should always be the current user, don't want to see other users content, espec if logged out
				// maybe
			// it also used the content-index-timestamp as a cachebuster, do we still need that?
			// i guess not b/c rest api sends headers to not cache?

			// if false maybe show message that can't retrieve all content, link to browse happy, ask to upgarde


			// todo document that use pluginver to avoid syntax errors when schema changes, etc
			// using dbver so content updates when the index changes
			const cacheName     = `qni-${ qniOptions.plugin_version }-${ qniOptions.user_db_version }`;
			const url           = `${ qniOptions.root_url }quick-navigation-interface/v1/content-index/`;

			caches.open( cacheName ).then( cache => {
				return cache.match( url ).then( cachedResponse => {
					if ( cachedResponse && cachedResponse.ok ) {
						return cachedResponse.json();
					}

					const fetchOptions = {
						url,
						parse: false, // todo explain it's b/c need the response to store it
							// maybe i don't though? do you _have_ to store the full response, or can you just store the body of it?
					};

					// document that using fetch to get nonce and polyfill, but need to pass full url instead of just path so can use w/ cachestorage api
					return apiFetch( fetchOptions ).then( liveResponse => {
						// document that have to clone it before put() consumes the body, otherwise can't use it b/c body already consumed
						const clonedLiveResponse = liveResponse.clone();

						// document that cnat use cache.add because need to use apiFetch to include nonce, polyfill, etc ? were there other reasons?
						cache.put( url, liveResponse );

						// cache.add() does't store non-200 responses, but cache.put does, so have to validate
							// don't wanna store an 500 error
							// also wanna make sure that the json body is valid b/c don't wanna store an application-level error message

						return clonedLiveResponse.json();
							// maybe return the full response here and above, let the then() below handle calling .json()?
							// that'd be a bit more DRY
							// probably wait until after refactor to use `await`
					} );

				} ).then ( data => {
					props.links.push( ...data );

					// todo convert all this nasty crap to use `await` instead of this chain hell
					// modularize it into a function too, waaaaaay to much crap going on here to be inside init()

					// todo

					// todo test that a post title isn't available before this resolves, but then it automatically becomes available as soon as it resolves
						// have to artifically slow it down to test
				} );

			} ).catch( error => {
				props.error = `${error.data.status} ${error.code}: ${error.message}`;
					// todo need to redo ^ based on types of errors receiving now after it was refactored
				// todo is it possible that error will ever just be a string rather than this object?
				// todo test after all the refactoring


				// "Note that an HTTP error response (e.g., 404) will not trigger an exception. It will return a normal response object that has the appropriate error code."

				//	console.log( 'Quick Navigation Interface error:', exception );
				//	// handle error. what to do? just log it to be aware?
				//	// just let it happen instead? does that actually braek all script executeion for everything else? or is it fine these days?

				// todo test when data empty, when server endpoint returns string or WP_Error

			} ).finally( () => {
				props.loading = false;
				renderApp( container, props );
			} );
		}

		// todo test that caching expiration works as expected, shouldn't fetch new index unless current one is expired
		/*

		test updates to cache on server side get pulled in immediately. need to have a version of the db for each user, and add that as url cachebuster?
			or etags?
				// " The caching API doesn't honor HTTP caching headers."
		if use cachebuster, would want to remove the other versno from cache

		// "The code also deletes all caches that aren't named in CURRENT_CACHES."
			 // don't want to delete things that WP or other plugins cache, though, so make sure only deleting stuff w/ our prefix or something
			 // use caches.keys() to search for other `qni-` prefixed cache objects, and remove any that don't match the current pluginversion/userdbversion
		 */

		// can make it bigger than 55k when using cache api?
			// check StorageEstimates API manually just out of curiosity, and to tune and good default
			// need to be conservative b/c average user may have less disk space than you, especially on mobile
			// add todo.md note that in future, could check that API programatically, and add API param to request larger or smaller # of records based on the space available
	}

	init();
}() );
