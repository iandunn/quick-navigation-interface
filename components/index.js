/**
 * WordPress dependencies
 */
import apiFetch                                     from '@wordpress/api-fetch';
import { createElement, Fragment, RawHTML, render } from '@wordpress/element';
import { __, sprintf }                              from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MainController as QuickNavigationInterface } from './main/controller';

/* global qniOptions:false */
/* global caches:false */


( function() {
	const container = document.createElement( 'div' );

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
				// todo ideally don't want to create an empty value in the object, takes up room in memory
				// and cache storage. if there isn't a parent title just don't add that property.
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
	async function deleteOldCaches( currentCache ) {
		if ( ! canUseCache() ) {
			return;
		}

		const keys = await caches.keys();

		for ( const key of keys ) {
			const isQniCache = 'qni-' === key.substr( 0, 4 );

			if ( currentCache === key || ! isQniCache ) {
				continue;
			}

			caches.delete( key );
		}
	}

	/**
	 * Initialize the app.
	 *
	 * @param {Array} options
	 */
	async function init( options ) {
		/*
		 * Delete all caches when logging out, to prevent leaking anything sensitive to other users of the device.
		 * Then return because the app wouldn't be useful in the login/logout context.
		 *
		 * This also intentionally runs for all actions on the login page, because we should already return early
		 * in those cases, and it doesn't hurt to delete the caches.
		 *
		 * @todo This feels kind of fragile, it might not detect alternate logout mechanisms, like a themed login
		 * page with alternate URL params, or a misguided security plugin renaming `wp-login.php`, or a custom
		 * logout flow where the user is redirected to the front end after logging out instead of hitting
		 * `wp-login.php`. Instead of this, maybe run a small JS function on every page -- back, front,
		 * login/logout, everywhere -- that detects if the user is logged in or not. If they aren't, then call the
		 * `deleteOldCache()`. Enqueue it before the main controller, so that it can also be called from there?
		 */
		const onLoginPage = -1 !== window.location.pathname.indexOf( 'wp-login.php' );

		if ( onLoginPage ) {
			await deleteOldCaches( '' ); // Empty string so that `currentCache` will also be deleted.
			return;
		}

		const canFetchContentIndex = 'fetch' in window;
			// todo probably don't need ^ to check fetch b/c G polyfills window.fetch. probably doesn't hurt to
			// leave it.
			// if remove it, document that can assume it exists b/c G polyfill
			// todo test in older browser that doesn't support fetch, should be polyfilled

		const props = {
			links   : getCurrentPageLinks(),
			loading : canFetchContentIndex,
			...options,
				// todo should have an `options` key instead of cluttering the root level?
				// also don't want to pass in things like nonce and root-url, so maybe just pass specific things instead?
		};

		if ( ! canFetchContentIndex ) {
			// it feels kind of weird to 1) be creating markup in a controller file; and 2) be setting markup to a property
			// should maybe instead do something like `props.canFetchContentIndex = false` here, and then in the mainview component
			// call a functional component that renders this
			props.warning = (
				<Fragment>
					<p>
						{ __(
							'Posts cannot be searched because your browser is too old; only links from the current page will be available.',
							'quick-navigation-interface'
						) }
					</p>

					<p>
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
					</p>
				</Fragment>
			);
		}

		/*
		 * The Modal that contains most of the markup creates its own div at the root of the DOM, so the result preview is
		 * the only thing that actually gets rendered in the root container.
		 */
		container.id = 'qni-active-url-preview';

		document.getElementById( 'wpwrap' ).appendChild( container );

		/*
		 * Render immediately with the links we parsed out of the DOM, to that the user can user this as soon as
		 * possible. We'll render again once the API data has been fetched.
		 *
		 * @todo in most cases data will be cached, so maybe refactor this so that it only renders twice if the
		 * API data isn't cached and we're actually going to make an XHR.
		 */
		renderApp( container, props );

		// todo modularize this function. can split off the `canfetchcontentindex` block below, maybe some other stuff above too.

		if ( canFetchContentIndex ) {
			try {
				props.links.push(
					...await fetchContentIndex( options.plugin_version, options.user_db_version, options.root_url )
				);

			} catch ( error ) {
				const errorMessage = getErrorMessage( error );

				console.error( 'Quick Navigation Interface error:', error );

				props.warning = (
					<Fragment>
						<p>
							{ __(
								'Posts cannot be searched because an error occured; only links from the current page will be available.',
								'quick-navigation-interface'
							) }
						</p>

						<p>
							<RawHTML>
								{ sprintf(
									/*
									 * SECURITY WARNING: This string is intentionally not internationalized.
									 * See Instructions component for details.
									 */
									'Details: <code>%s</code>',
									errorMessage
								) }
							</RawHTML>
						</p>
					</Fragment>
				);

			} finally {
				props.loading = false;
				renderApp( container, props );
			}
		}
	}

	/**
	 * Fetch the links from the content index
	 *
	 * @param {string} pluginVersion
	 * @param {string} userDbVersion Timestamp when the user's content index was generated.
	 * @param {string} apiRootUrl
	 *
	 * @return {Array}
	 */
	async function fetchContentIndex( pluginVersion, userDbVersion, apiRootUrl ) {
		/*
		 * Include cachebusters in the cache name.
		 *
		 * The cache should be refreshed when the plugin version changes, because that might change the REST
		 * API response, which would cause a fatal error if the new code were trying to use the old data.
		 *
		 * It should also be refreshed when the content in the database changes, so that the user can search
		 * the new content.
		 */
		const cacheName  = `qni-${ pluginVersion }-${ userDbVersion }`;
		const url        = `${ apiRootUrl }quick-navigation-interface/v1/content-index/`;


		const cachedIndex = await getCachedIndex( cacheName, url );

		if ( cachedIndex ) {
			return cachedIndex;
		}

		/*
		 * This uses `apiFetch` instead of `fetch` to take advantage of the nonce and polyfill, but we still need
		 * to pass the full URL instead of just the `path`, and get the full response, in order to use the Cache
		 * API.
		 */
		const fetchOptions = {
			url   : url,
			parse : false,
		};

		const response = await apiFetch( fetchOptions );

		/*
		 * Passing a clone because `cache.put()` consumes the body, and it can't be accessed afterwards. If we
		 * passed the original object, then we couldn't call `response.json()` below.
		 */
		await cacheIndex( cacheName, url, response.clone() );

		// "Note that an HTTP error response (e.g., 404) will not trigger an exception. It will return a normal response object that has the appropriate error code."
			// um, but it does trigger an exception... ?


		return [ ...await response.json() ];

		/*
		test updates to cache on server side get pulled in immediately. need to have a version of the db for each user, and add that as url cachebuster?
			or etags?
				// " The caching API doesn't honor HTTP caching headers."
		if use cachebuster, would want to remove the other versno from cache
		*/
	}

	/**
	 * Check if the browser supports the `CacheStorage` API.
	 *
	 * All modern browsers should, but Blink- and WebKit-based browsers -- Chrome, Safari, etc -- mistakenly hide
	 * the API when accessed over HTTP, because it's related to service workers, even though it can be used
	 * independently in browsers which properly implement it, like Firefox. Trying to access `window.caches` over
	 * HTTP in Chrome will result in an exception being thrown.
	 *
	 * Unfortunately, this means that `fetchContentIndex()` will trigger an HTTP request every time an admin page
	 * loads, if the site doesn't have an SSL certificate and the user is using a buggy browser.
	 *
	 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1026063.
	 *
	 * It's worth having a wrapper function for this, even though it's just a single line, because it's used in
	 * many places. This keeps the logic, and important notes above, DRY.
	 *
	 * @return {boolean}
	 */
	function canUseCache() {
		return 'caches' in window;
	}

	/**
	 * Retrieve the cached index, if one is available.
	 *
	 * @param {string} cacheName
	 * @param {string} url
	 *
	 * @return {mixed} `false` when no cache available; `Array` when cache successfully retrieved.
	 */
	async function getCachedIndex( cacheName, url ) {
		if ( ! canUseCache() ) {
			return false;
		}

		const qniCache       = await caches.open( cacheName );
		const cachedResponse = await qniCache.match( url );
		const indexLinks     = [];

		if ( ! cachedResponse || ! cachedResponse.ok ) {
			return false;
		}

		indexLinks.push( ...await cachedResponse.json() );

		// v1.0 added the `type` item, so don't use an old cached index that doesn't have that populated.
		if ( ! indexLinks[ 0 ].type ) {
			return false;
		}

		return indexLinks;
	}

	/**
	 * Store the content index in the browser cache.
	 *
	 * @param {string}   cacheName
	 * @param {string}   url
	 * @param {Response} response
	 */
	async function cacheIndex( cacheName, url, response ) {
		if ( ! canUseCache() ) {
			return;
		}

		const qniCache = await caches.open( cacheName );

		/*
		 * Using `put()` instead of just `add()` because we're using `apiFetch()` instead of
		 * `fetch()`. See notes in `fetchContentIndex()`.
		 */
		qniCache.put( url, response );

		// cache.add() does't store non-200 responses, but cache.put does, so have to validate
		// don't wanna store a 500 error
		// also wanna make sure that the json body is valid b/c don't wanna store an application-level error message
		// caller has a try/catch and some error handling, should probably move that down here and then avoid caching errors

		await deleteOldCaches( cacheName );
	}

	/**
	 * Safely extract an error message from a variety of inputs.
	 *
	 * @param {mixed} error
	 *
	 * @return {string}
	 */
	function getErrorMessage( error ) {
		let message;

		if ( 'string' === typeof error ) {
			message = error;

		} else if ( 'object' === typeof error && 'statusText' in error ) {
			message = error.statusText;

		} else if ( 'object' === typeof error && 'message' in error ) {
			message = error.message;

		} else {
			message = JSON.stringify( error );
		}

		return message;
	}

	init( qniOptions );
}() );
