/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;
//const { apiFetch } = wp.apiFetch;
import apiFetch from '@wordpress/api-fetch';

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

	//
	function renderApp( container, props ) {
		render(
			createElement( QuickNavigationInterface, props ),
			document.getElementById( 'qni-container' )
		);
	}

	//
	function fetchResolved( response ) {
		if ( response.status !== 200 ) {
			// todo the api returns some 200 for errors? need to check something else too?
			throw `${response.status} ${response.statusText}`;
		}

		response.json().then( function ( data ) {
			props.loading = false;

			// Append content links to existing links, to avoid creating a new array, which would double memory usage.
				// is ^ still true? was it ever since arrays are references? probably was true, not sure if still is
			Array.prototype.push.apply( props.links, data );

			renderApp( container, props );
		} );
	}

	//
	function fetchRejected( error ) {
		props.loading = false;
		props.error   = error;

		renderApp( container, props );
	}

	//
	function init() {
		const apiUrl    = qniApi.rootUrl + 'quick-navigation-interface/v1/content-index/?_wpnonce=' + qniApi.nonce;
		// need 2nd nonce somewhere? https://wordpress.stackexchange.com/questions/323637/verify-nonce-in-rest-api

		props = {
			browserCompatible : true, //false, // 'fetch' in window, // todo, anything else to add here? localstorage when do that
			error             : 'myerror', // false
			loading           : true, // add loading view along with browser incompat? or not really necessary?
			links             : getCurrentPageLinks(),
			...qniOptions,
		};

		container.id = 'qni-container';

		document.getElementById( 'wpwrap' ).appendChild( container );
		renderApp( container, props );

		apiFetch( { path: '/wp/v2/posts' } ).then( posts => {
			console.log( posts );
		} );

		if ( 'fetch' in window ) {
			return;//tmp

			fetch(
				apiUrl + '',
				// tmp

				/*
				 * Explicitly declare `same-origin` for older browsers.
				 *
				 * `same-origin` is the default value now, but it used to be `omit`, so older browsers will fail
				 * if it's not explicitly declared.
				 *
				 * See https://github.com/whatwg/fetch/pull/585.
				 */
				{ credentials: 'same-origin' }
			).then( fetchResolved ).catch( fetchRejected );

			// seems like rest api is using nonces for _authentication_ rather than just _intention_, but that can't be right, so what are you missing?

			/// todo this is just part part. merge this, but then immediately need to work on local storage, b/c can't be making this http request on every page load
		}

		// ugh, this is kinda ugly. maybe you should just use the backbone client?
			// no, much smaller bundle to do this. well, but if they already have it cached from another page...
			// what does Gutenberg use?
				// doh, repalce this with apiFetch()
	}

	init();
}() );
