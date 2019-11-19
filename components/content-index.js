/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/* global caches:false */


/**
 * Fetch the links from the content index
 *
 * @param {string} pluginVersion
 * @param {string} userDbVersion Timestamp when the user's content index was generated.
 * @param {string} apiRootUrl
 *
 * @return {Array}
 */
export async function fetchContentIndex( pluginVersion, userDbVersion, apiRootUrl ) {
	/*
	 * Include cachebusters in the cache name.
	 *
	 * The cache should be refreshed when the plugin version changes, because that might change the REST
	 * API response, which would cause a fatal error if the new code were trying to use the old data.
	 *
	 * It should also be refreshed when the content in the database changes, so that the user can search
	 * the new content.
	 */
	const cacheName   = `qni-${ pluginVersion }-${ userDbVersion }`;
	const url         = `${ apiRootUrl }quick-navigation-interface/v1/content-index/`;
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
 * Delete any old QNI caches to respect user's disk space.
 *
 * @param {string} currentCache
 */
export async function deleteOldCaches( currentCache ) {
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
