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

( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link,

		/**
		 * Search the collection for links matching the query
		 *
		 * This only finds the *first* X matches before the limit is reached, rather than the *best* X matches,
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

			return results;
		}
	} );
} )();

( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	// todo assigning to window is the best practice? double check

	app.Models.Link = Backbone.Model.extend( {
		defaults : {
			'title' : '',
			'url'   : ''
		}
	} );
} )();

( function( $ ) {
	'use strict';
	var app = window.IntentDrivenInterface;

	/*
	 * Base view
	 */
	app.View = Backbone.View.extend( {
		// todo maybe prepare?

		// todo remove if not used
		inject : function( selector ) {
			this.render();
			$( selector ).html( this.el );
			this.views.ready();
		}
	} );

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = app.View.extend( {
		tagName   : 'li',
		className : 'idi-active',   // todo set when up/down keys pressed
		template  : wp.template( 'intent-link' ),

		initialize : function() {
			this.render();
		},

		// todo jsdoc on all functions
		// todo use inject() instead of overriding render()

		render : function() {
			this.$el.html( this.template( this.model.toJSON() ) );
		}
	} );

	/*
	 * View for a collection of Links
	 */
	app.Views.Links = app.View.extend( {
		tagName : 'ul',

		initialize : function() {
			this.render();
			this.listenTo( this.collection, 'reset', this.render );
		},

		render : function() {
			this.$el.html( '' );

			this.collection.each( function( link ) {
				var linkView = new app.Views.Link( { model: link } );
				this.$el.append( linkView.el );
			}, this );
		}
	} );

} )( jQuery );

// Initialize the main class after Grunt has concatenated all the files together
IntentDrivenInterface.start();

// todo think of a better way to do this?

//# sourceMappingURL=intent-driven-interface.js.map