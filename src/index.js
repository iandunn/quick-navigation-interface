/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './quick-navigation-interface/';

// todo create container inside #wpwrap, prob don't' need to fetch getelementbyid then since will have reference to it?

( function() {
	/**
	 * Get all links on the current page
	 *
	 * @returns {Array}
	 */
	function getCurrentPageLinks() {
		let links = [];
		let parentTitle, type, title, url;

		// can use queryselctor instead of jquery here, then get rid of all mentions of jquery?

		for ( const link of document.getElementsByTagName( 'a' ) ) {
			parentTitle = '';
		    type        = 'link';
			title       = link.textContent;
			url         = link.getAttribute( 'href' );

			// watch out for xss execution sinks when using

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

		// todo remove duplicates like `Feedback`
		// should also remove links to things that already exist in content index

		return links;
	}

	// Append page links to existing content index, to avoid creating a new array, which would double memory usage.
	Array.prototype.push.apply( window.qniContentIndex, getCurrentPageLinks() );

	render(
		createElement(
			QuickNavigationInterface,
			{
				...qniOptions,
				links: window.qniContentIndex
			}
		),
		document.getElementById( 'qni-container' )
		// the Modal doesn't even render inside ^ though, so... do i even need that?
		// maybe need it just so react doesn't clobber some other element?
	);
} )();
