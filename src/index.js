/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './quick-navigation-interface/';

( function() {
	/**
	 * Get all links on the current page
	 *
	 * @returns {Array}
	 */
	function getCurrentPageLinks() {
		let links = [];
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

			links.push( {
				type        : type,
				title       : title,
				parentTitle : parentTitle,
				url         : url
			} );
		}

		return links;
	}

	// Append page links to existing content index, to avoid creating a new array, which would double memory usage.
	Array.prototype.push.apply( window.qniContentIndex, getCurrentPageLinks() );

	const props = {
		...qniOptions,
		links : window.qniContentIndex
	};

	/*
	 * This won't actually be used for anything, since the <Modal> creates its own root-level element, but we still
	 * have to give render() something.
	 */
	const container = document.createElement( 'div' );
	container.id    = 'qni-container';

	document.getElementById( 'wpwrap' ).appendChild( container );

	render(
		createElement( QuickNavigationInterface, props ),
		document.getElementById( 'qni-container' )
	);
} )();
