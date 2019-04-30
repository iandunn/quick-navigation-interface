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

		$( 'a' ).each( function() {
			var parentTitle = '',
				title       = $( this ).text(),
				url         = $( this ).attr( 'href' );

			if ( $( this ).parent().parent().hasClass( 'wp-submenu' ) ) {
				parentTitle = $( this ).parent().parent().parent().find( '.wp-menu-name' ).text();
			} else if ( 'wp-admin-bar-new-content-default' === $( this ).parent().parent().attr( 'id' ) ) {
				title = $( '#wp-admin-bar-new-content' ).find( '.ab-label' ).text() + ' ' + title;
			}

			links.push( {
				type        : 'link',
				title       : title,
				parentTitle : parentTitle,
				url         : url
			} );
		} );

		return links;
	}
	// call ^ and add to window.qniContentIndex before passing it to below
	// but maybe use Context instead of this

	// Append page links to existing content index, to avoid creating a new array, which would double memory usage.
	Array.prototype.push.apply( window.qniContentIndex, getCurrentPageLinks() );

	render(
		createElement(
			QuickNavigationInterface,
			{
				...qniOptions,
				links: window.qniContentIndex
				// rename ^ to somehting more generic, rename in passed down places too
			}
		),
		document.getElementById( 'qni-container' )
		// the Modal doesn't even render inside ^ though, so... do i even need that?
		// maybe need it just so react doesn't clobber some other element?
	);
} )( jQuery );
