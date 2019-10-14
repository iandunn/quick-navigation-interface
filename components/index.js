/**
 * WordPress dependencies
 */
import apiFetch                  from '@wordpress/api-fetch';
import { render, createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MainController as QuickNavigationInterface } from './main/controller';


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
			container

			// todo should be able to do something like this instead, and then remove createElement import?
			//<QuickNavigationInterface { ...props } />
		);
	}

	/**
	 * Delete any old QNI caches to respect user's disk space.
	 *
	 * @param {string} currentCache
	 */
	function deleteOldCaches( currentCache ) {
		return caches.keys().then( function ( keyList ) {
			return Promise.all( keyList.map( function ( key ) {
				const isQniCache = 'qni-' === key.substr( 0, 4 );

				if ( currentCache === key || ! isQniCache ) {
					return;
				}

				return caches.delete( key );
			} ) );
		} );

		// todo convert to use `await` instead, for better readability
	}

	/**
	 * Initialize the app.
	 */
	function init() {
		/*
		 * Delete all caches when logging out, to prevent leaking anything sensitive to other users of the device.
		 * Then return because the app wouldn't be useful in the login/logout context.
		 *
		 * @todo This feels kind of fragile, it might not detect alternate logout mechanisms, like a themed login
		 * page with alternate URL params, or a misguided security plugin renaming `wp-login.php`, or a custom
		 * logout flow where the user is redirected to the front end after logging out instead of hitting
		 * `wp-login.php`. Instead of this, maybe run a small JS function on every page -- back, front,
		 * login/logout, everywhere -- that detects if the user is logged in or not. If they aren't, then call the
		 * `deleteOldCache()`. Enqueue it before the main controller, so that it can also be called from there?
		 */
		const isLoggingOut = -1 !== window.location.pathname.indexOf( 'wp-login.php' ) && -1 !== window.location.search.indexOf( 'loggedout=true' );

		if ( isLoggingOut ) {
			deleteOldCaches( '' ); // Empty string so that `currentCache` will also be deleted.
			return;
		}

		const props = {
			browserCompatible : 'fetch' in window && 'caches' in window,
			// todo probably don't need ^ to check fetch b/c G polyfills window.fetch. probably doesn't hurt to leave it.
			// if remove it, document that can assume it exists b/c G polyfill
			// todo test in older browser that doesn't support fetch and caches, fetch should be polyfilled but lack of `caches` should trigger failure

			error             : false,
			links             : getCurrentPageLinks(),
			...qniOptions,
				// todo should have an `options` key instead of cluttering the root level?
				// also don't want to pass in things like nonce and root-url
		};

		/*
		 * The Modal that contains most of the markup creates its own div at the root of the DOM, so the result preview is
		 * the only thing that actually gets rendered in the root container.
		 */
		container.id  = 'qni-active-url-preview';
		props.loading = props.browserCompatible;

		document.getElementById( 'wpwrap' ).appendChild( container );

		/*
		 * Render immediately with the links we parsed out of the DOM, to that the user can user this as soon as
		 * possible. We'll render again once the API data has been fetched.
		 *
		 * @todo in most cases data will be cached, so maybe refactor this so that it only renders twice if the
		 * API data isn't cached and we're actually going to make an XHR.
		 */
		renderApp( container, props );

		if ( props.browserCompatible ) {
			// todo the old ajax query included `'user'   => get_current_user_id(),` in the url, should this do that too?
				// should always be the current user, don't want to see other users content, espec if logged out
				// maybe
			// it also used the content-index-timestamp as a cachebuster, do we still need that?
			// i guess not b/c rest api sends headers to not cache?

			/*
			 * Include cachebusters in the cache name.
			 *
			 * The cache should be refreshed when the plugin version changes, because that might change the REST
			 * API response, which would cause a fatal error if the new code were trying to use the old data.
			 *
			 * It should also be refreshed when the content in the database changes, so that the user can search
			 * the new content.
			 */
			const cacheName = `qni-${ qniOptions.plugin_version }-${ qniOptions.user_db_version }`;
			const url       = `${ qniOptions.root_url }quick-navigation-interface/v1/content-index/`;

			caches.open( cacheName ).then( cache => {
				return cache.match( url ).then( cachedResponse => {
					if ( cachedResponse && cachedResponse.ok ) {
						return cachedResponse.json();
					}

					const fetchOptions = {
						url,
						parse: false, // Get the full response so it can be stored in the Cache API.
					};

					/*
					 * Using apiFetch for the nonce and polyfill, but we still need to pass the full URL instead
					 * of just the `path`, so that the URL can be stored in the Cache API.
					 */
					return apiFetch( fetchOptions ).then( liveResponse => {
						/*
						 * `put()` consumes the body, and it can't be accessed after. We need to return the body
						 * after using `put()`, though, so we have to clone it.
						 */
						const clonedLiveResponse = liveResponse.clone();

						/*
						 * Using `put()` instead of just `add()` because we're using `apiFetch` instead of
						 * `fetch()`. See notes above.
						 */
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

					deleteOldCaches( cacheName );
					// todo whch cache is this being deleted? why? need to add some docs once await makes this easyer to understand

					// todo convert all this nasty crap to use `await` instead of this chain hell
					// modularize it into a function too, waaaaaay to much crap going on here to be inside init()

					// todo

					// todo test that a post title isn't available before this resolves, but then it automatically becomes available as soon as it resolves
						// have to artifically slow it down to test
				} );

			} ).catch( error => {
				console.log( 'caught error', {error} );
				//props.error = `${error.data.status} ${error.code}: ${error.message}`;
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


	}

	init();
}() );
