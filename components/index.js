/**
 * WordPress dependencies
 */
import { createElement, render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MainController as QuickNavigationInterface } from './main/controller';
import { fetchContentIndex, deleteOldCaches }         from './content-index';

/* global qniOptions:false */


( function() {
	const container = document.createElement( 'div' );

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
			links                : getCurrentPageLinks(),
			loading              : canFetchContentIndex, // If we can, then we're going to.
			canFetchContentIndex : canFetchContentIndex,
			fetchError           : false,
			...options,
				// todo should have an `options` key instead of cluttering the root level?
				// also don't want to pass in things like nonce and root-url, so maybe just pass specific things instead?
		};

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
				props.fetchError = getErrorMessage( error );

				console.error( 'Quick Navigation Interface error:', error );

			} finally {
				props.loading = false;
				renderApp( container, props );
			}
		}
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
