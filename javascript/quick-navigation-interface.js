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
				app.searchResultsCollection = new app.Collections.Links( [] );
				app.searchResultsView = new app.Views.Links( { el : app.searchResults, collection : app.searchResultsCollection } );
				// todo re-align

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
			app.searchResultsCollection.reset();
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
					app.searchResultsCollection.moveActiveLink( 'forwards' );
				} else if ( event.which === app.options.shortcuts['previous-link'].code ) {
					app.searchResultsCollection.moveActiveLink( 'backwards' );
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
					app.searchResultsCollection.reset( app.allLinks.search( query, app.options.limit ) );
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

( function() {
	'use strict';
	var app = window.QuickNavigationInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link,

		/**
		 * Search the collection for links matching the query
		 *
		 * This only finds the _first_ X matches before the limit is reached, rather than the _best_ X matches,
		 * but in this context they can just keep typing to further narrow the results, so that's probably good
		 * enough for now.
		 *
		 * @param {string} query
		 * @param {int}    limit
		 *
		 * @returns {Array}
		 */
		search : function( query, limit ) {
			var results = [];

			if ( '' !== query ) {
				this.every( function( link ) {
					if ( link.get( 'title' ).toLowerCase().indexOf( query.toLowerCase() ) >= 0 ) {
						results.push( link );
					}

					return results.length < limit;
				} );
			}

			if ( results.hasOwnProperty( 0 ) ) {
				results[ 0 ].set( { state : 'active' } );
			}

			return results;
		},

		/**
		 * Set a new link to be the active one
		 *
		 * @param {string} direction
		 */
		moveActiveLink : function( direction ) {
			var newIndex,
				currentActiveLink = this.where( { state : 'active' } ),
				currentIndex      = this.indexOf( currentActiveLink[0] );

			if ( 'forwards' === direction ) {
				newIndex = currentIndex + 1;

				if ( this.length === newIndex ) {
					newIndex = 0;
				}
			} else {
				newIndex = currentIndex - 1;

				if ( -1 === newIndex ) {
					newIndex = this.length - 1;
				}
			}

			this.at( currentIndex ).set( { state : 'inactive' } );
			this.at( newIndex     ).set( { state : 'active'   } );
		}
	} );

} )();

( function() {
	'use strict';
	var app = window.QuickNavigationInterface;

	// todo assigning to window is the best practice? double check

	app.Models.Link = Backbone.Model.extend( {
		defaults : {
			'title' : '',
			'url'   : '',
			'state' : 'inactive'
		}
	} );

} )();

( function() {
	'use strict';
	var app = window.QuickNavigationInterface;

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = Backbone.View.extend( {
		tagName   : 'li',
		template  : wp.template( 'qni-link' ),

		/**
		 * Initialize the view
		 */
		initialize : function() {
			this.render();
			this.listenTo( this.model, 'change', this.render );
		},

		/**
		 * Render the view
		 */
		render : function() {
			if ( 'active' === this.model.get( 'state' ) ) {
				this.$el.addClass( 'idi-active' );
			} else {
				this.$el.removeClass( 'idi-active' );
			}

			this.$el.html( this.template( this.model.toJSON() ) );
		}
	} );

	/*
	 * View for a collection of Links
	 */
	app.Views.Links = Backbone.View.extend( {
		tagName : 'ul',

		/**
		 * Initialize the view
		 */
		initialize : function() {
			this.render();
			this.listenTo( this.collection, 'reset', this.render );
		},

		/**
		 * Render the view
		 */
		render : function() {
			this.$el.html( '' );

			this.collection.each( function( link ) {
				var linkView = new app.Views.Link( { model: link } );
				this.$el.append( linkView.el );
			}, this );
		}
	} );

} )();

// Initialize the main class after Grunt has concatenated all the files together
QuickNavigationInterface.start();

//# sourceMappingURL=quick-navigation-interface.js.map