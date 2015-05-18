( function( $ ) {
	'use strict';

	var app = window.IntentDrivenInterface = {
		Models      : {},
		Collections : {},
		Views       : {},

		/**
		 * Initialization that runs as soon as this file has loaded
		 */
		start : function() {
			try {
				app.options       = idiOptions;
				app.mainContainer = $( '#idi-container'      );
				app.searchField   = $( '#idi-search-field'   );
				app.searchResults = $( '#idi-search-results' );
				idiOptions         = null;

				app.allLinks          = new app.Collections.Links( app.getAllLinks() );
				app.activeLinks       = new app.Collections.Links( [] );
				app.searchResultsView = new app.Views.Links( { el: app.searchResults, collection: app.activeLinks } );

				$( window ).keyup(       app.toggleInterface   );
				app.mainContainer.click( app.toggleInterface   );
				app.searchField.keyup(   app.showRelevantLinks );

				// todo maybe make this a controller that calls toggleinteface, showrelevantlinks, etc. better than having two listeners for same event?
			} catch ( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Collect all the links on the page
		 *
		 * @returns {Array}
		 */
		getAllLinks : function() {
			var links = [];

			$( 'a' ).each( function() {
				links.push( new app.Models.Link( {
					'title': $( this ).text(),
					'url'  : $( this ).attr( 'href' )
				} ) );
			} );

			return links;
		},

		/**
		 * Reveal the interface when the user presses the shortcut
		 *
		 * @todo move to relevant view
		 *
		 * @param {object} event
		 */
		toggleInterface : function( event ) {
			try {
				if ( 'keyup' === event.type ) {
					// todo return if it happened inside an input/textarea/etc field

					if ( event.key === app.options.shortcuts.open ) {
						app.searchField.val( '' );
						app.mainContainer.addClass( 'idi-active' );
						app.searchField.focus();
					} else if ( event.key === app.options.shortcuts.close ) {
						app.mainContainer.removeClass( 'idi-active' );
						app.activeLinks.reset();
					}
				} else if ( 'click' === event.type ) {
					if ( 'notification-dialog-background' === event.target.className || 'media-modal-icon' === event.target.className ) {
						app.mainContainer.removeClass( 'idi-active' );
					}
				}
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Show relevant links based on the user's query
		 *
		 * @todo move to relevant view
		 */
		showRelevantLinks : function() {
			// todo wait a few milliseconds before issuing query to avoid wasted searches when they're going to type more characters?

			// todo if enter key and already have active links, open first one
				// probably add controller above this, instead of mixing it here

			try {
				$( '#idi-instructions' ).addClass( 'idi-active' );
				app.searchResults.addClass( 'idi-active' );
				app.activeLinks.reset( app.allLinks.search( app.searchField.val(), app.options.limit ) );
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Log a message to the console
		 *
		 * @param {*} error
		 */
		log : function( error ) {
			if ( ! window.console ) {
				return;
			}

			if ( 'string' === typeof error ) {
				console.log( 'Intent-Driven Interface: ' + error );
			} else {
				console.log( 'Intent-Driven Interface: ', error );
			}
		}
	};
} )( jQuery );
