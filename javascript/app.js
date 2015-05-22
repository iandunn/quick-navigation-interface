( function( $ ) {
	'use strict';

	var app = window.QuickNavigationInterface = {
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
				app.instructions  = $( '#idi-instructions'   );
				idiOptions         = null;

				app.allLinks          = new app.Collections.Links( app.getAllLinks() );
				app.activeLinks       = new app.Collections.Links( [] );
				    // todo rename, b/c only 1 is active, these are more like search results collection
					// alllinks might be better as pagelinks to something
				app.searchResultsView = new app.Views.Links( { el : app.searchResults, collection : app.activeLinks } );

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
					'title' : $( this ).text(),
					'url'   : $( this ).attr( 'href' )
				} ) );
			} );

			return links;
		},

		/**
		 * Reveal the interface when the user presses the shortcut
		 *
		 * @param {object} event
		 */
		toggleInterface : function( event ) {
			try {
				if ( 'keyup' === event.type ) {
					if ( event.which === app.options.shortcuts['open-interface'].code ) {
						if ( 'input' === event.target.tagName.toLowerCase() || 'textarea' === event.target.tagName.toLowerCase() ) {
							return;
						}

						app.openInterface();
					} else if ( event.which === app.options.shortcuts['close-interface'].code ) {
						app.closeInterface();
					}
				} else if ( 'click' === event.type ) {
					if ( 'notification-dialog-background' === event.target.className || 'media-modal-icon' === event.target.className ) {
						app.closeInterface();
					}
				}
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Open the interface
		 */
		openInterface : function() {
			app.searchField.val( '' );
			app.mainContainer.addClass( 'idi-active' );
			app.searchField.focus();
		},

		/**
		 * Close the interface
		 */
		closeInterface : function() {
			app.mainContainer.removeClass( 'idi-active' );
			app.instructions.removeClass(  'idi-active' );
			app.activeLinks.reset();
			app.searchField.blur();    // because toggleInterface() will return early if we're focused on an input field
		},

		/**
		 * Show relevant links based on the user's query
		 *
		 * @param {object} event
		 */
		showRelevantLinks : function( event ) {
			var link, query;

			// todo maybe refactor, to make it a controller that calls modularized functions

			try {
				if ( event.which === app.options.shortcuts['open-link'].code ) {
					link = app.searchResults.find( 'li.idi-active' ).find( 'a' );

					if ( undefined !== link.attr( 'href' ) ) {
						link.get( 0 ).click();
						app.closeInterface();
					}
				} else if ( event.which === app.options.shortcuts['next-link'].code ) {
					app.activeLinks.moveActiveLink( 'forwards' );
				} else if ( event.which === app.options.shortcuts['previous-link'].code ) {
					app.activeLinks.moveActiveLink( 'backwards' );
				} else {
					query = app.searchField.val();

					if ( '' === query ) {
						app.instructions.removeClass( 'idi-active' );
						app.searchResults.removeClass( 'idi-active' );
					} else {
						app.instructions.addClass( 'idi-active' );
						app.searchResults.addClass( 'idi-active' );
					}

					app.allLinks.invoke( 'set', { state : 'inactive' } );
					app.activeLinks.reset( app.allLinks.search( query, app.options.limit ) );
				}
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
				console.log( 'Quick Navigation Interface: ' + error );
			} else {
				console.log( 'Quick Navigation Interface: ', error );
			}
		}
	};

} )( jQuery );
