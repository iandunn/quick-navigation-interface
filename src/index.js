/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './quick-navigation-interface/';

// todo create container inside #wpwrap, prob don't' need to fetch getelementbyid then since will have reference to it?

( function( $ ) {
	/**
	 * Get all links on the current page
	 *
	 * @returns {Array}
	 */
	function getCurrentPageLinks() {
		var links = [];

		// can use queryselctor instead of jquery here, then get rid of all mentions of jquery?

		$( 'a' ).each( function() {
			var parentTitle = '',
			    type        = 'link',
				title       = $( this ).text(),
				url         = $( this ).attr( 'href' );

			if ( $( this ).parent().parent().hasClass( 'wp-submenu' ) ) {
				parentTitle = $( this ).parent().parent().parent().find( '.wp-menu-name' ).text();
				type = 'menu item';
			} else if ( 'wp-admin-bar-new-content-default' === $( this ).parent().parent().attr( 'id' ) ) {
				title = $( '#wp-admin-bar-new-content' ).find( '.ab-label' ).text() + ' ' + title;
				type = 'menu item';
			}

			links.push( {
				type        : type,
				title       : title,
				parentTitle : parentTitle,
				url         : url
			} );
		} );

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
} )( jQuery );
