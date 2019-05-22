/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './main/controller';

( function() {
	function getContentIndex() {
		caches.open( 'qni-content-index' ).then( function ( cache ) {
			// Cache is created and accessible

			// SecurityError: The operation is insecure.
				// When creating a PWA, a service worker used on an non https server also generates this error.
				// does cache api require https? hsouldn't
				//
				// if can't fix this then maybe do indexdb instead, but keep this code around in case switch back to it
				// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage
				// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
				// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria
			try {
				cache.add(
					new Request( '/wordpress/wp-admin/admin-ajax.php?action=qni_content_index&user=1&nonce=215f76c3b6&ver=1556821548' )
				);
			} catch( exception ) {
				console.log( exception );
			}

			// how to handle nonces etc? need to figure out when switching to rest api. maybe just grab from DOM and append. will that act like a cachebuster when you don't want it to, b/c nonces expire much shorter than you'd want contentindex to expire?

			// how to expire contentindex when posts change? maybe need to store the version in mysql and output to page, then grab it here to use?

			cache.keys().then( function ( cachedRequests ) {
				console.log( cachedRequests ); // [Request, Request]
			} );


		} );

		return [];  // how to return from inside the promise callback?

		// should this function live inside the controller so not calling wp.element.render() each time it changes? or is it correct to do that?

		// probably cache.delete if expired?
			// what critera to determine if expired?

		// also {doh i forget, what was i thinking? something related to above}

		// if not cached
			// cache.add


		// validate that it's an array or something, even if empty

		// return cache.match()

		// note sure if 'disable cache' in ff dev tools affects this kind of cache or not
			// start w/ cache enabled just to be safe
			// turn it back off when done

		// what are the security implications of this?
			// someone w/ access to browser / file system could see the data
				// is that really any different than current state of things where the request is cached locally, though?
			// have to assume that user has computer secured? what about public terminals etc?
			// if user logs out or their session times out, should we clear the local cache?
			// maybe include username in the cache version, or maybe it's better to overwrite when new user logs in?
			// maybe expire if older than 2 weeks b/c that's wp 'remember me' time?




		// You are responsible for implementing how your script (e.g. in a ServiceWorker)  handles Cache updates.
		// Items in a Cache do not get updated unless explicitly requested; they don’t expire unless deleted.
		// Use CacheStorage.open() to open a specific named Cache object and then call any of the Cache methods to maintain the Cache.

		// You are also responsible for periodically purging cache entries.
		// Each browser has a hard limit on the amount of cache storage that a given origin can use.
		// Cache quota usage estimates are available via the StorageEstimate API.
		// The browser does its best to manage disk space, but it may delete the Cache storage for an origin.
		// The browser will generally delete all of the data for an origin or none of the data for an origin.
		// Make sure to version caches by name and use the caches only from the version of the script that they can safely operate on.

		// Note: Initial Cache implementations (in both Blink and Gecko) resolve Cache.add(), Cache.addAll(), and Cache.put() promises when the response body is fully written to storage.  More recent versions of the specification state that the browser can resolve the promise as soon as the entry is recorded in the database even if the response body is still streaming in.
		//
		// Note: The key matching algorithm depends on the VARY header in the value. So matching a new key requires looking at both key and value for entries in the Cache.
		//
		// Note: The caching API doesn't honor HTTP caching headers.

		//The code handles exceptions thrown from the fetch() operation. Note that an HTTP error response (e.g., 404) will not trigger an exception. It will return a normal response object that has the appropriate error code.

		// The code snippet also shows a best practice for versioning caches used by the service worker. Though there's only one cache in this example, the same approach can be used for multiple caches. It maps a shorthand identifier for a cache to a specific, versioned cache name. The code also deletes all caches that aren't named in CURRENT_CACHES.

		// The Fetch API requires Set-Cookie headers to be stripped before returning a Response object from fetch().  So a Response stored in a Cache won't contain headers.


	}

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

	// Append page links to existing content index, to avoid creating a new array, which would double memory usage.
	Array.prototype.push.apply( getContentIndex(), getCurrentPageLinks() );

	const props = {
		links : window.qniContentIndex,
		...qniOptions,
	};

	const container = document.createElement( 'div' );
	container.id    = 'qni-container';

	document.getElementById( 'wpwrap' ).appendChild( container );

	render(
		createElement( QuickNavigationInterface, props ),
		document.getElementById( 'qni-container' )
	);
}() );
