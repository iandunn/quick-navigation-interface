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
				app.options       = window.qniOptions;
				app.mainContainer = $( '#qni-container'      );
				app.searchField   = $( '#qni-search-field'   );
				app.searchResults = $( '#qni-search-results' );
				app.instructions  = $( '#qni-instructions'   );
				window.qniOptions = null;

				app.allLinks                = new app.Collections.Links( app.getAllLinks() );
					// todo rename it to reflect new contents
				app.searchResultsCollection = new app.Collections.Links( [] );
				app.searchResultsView       = new app.Views.Links( { el : app.searchResults, collection : app.searchResultsCollection } );

				$( window ).keyup(       app.toggleInterface   );
				app.mainContainer.click( app.toggleInterface   );
				app.searchField.keyup(   app.showRelevantLinks );
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
			// todo rename it to reflect new contents

			var links = [];

			// Add links on the current page
			$( 'a' ).each( function() {
				var title = $( this ).text(),
					url   = $( this ).attr( 'href' );

				links.push( new app.Models.Link( {
					id    : murmurhash3_32_gc( title + url ),
					title : title,
					url   : url
				} ) );
			} );

			// Add content items
			_.each( window.qniContentIndex, function( item ) {
				links.push( new app.Models.Link( {
					id    : murmurhash3_32_gc( item.title + item.url ),
					title : item.title,
					url   : item.url
				} ) );
			} );

			window.qniContentIndex = null;    // there's no need to keep this in memory anymore, now that the data is stored in the links collection

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
						// Don't prevent the open shortcut from being used in input fields
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
			app.mainContainer.addClass( 'qni-active' );
			app.searchField.focus();
		},

		/**
		 * Close the interface
		 */
		closeInterface : function() {
			app.mainContainer.removeClass( 'qni-active' );
			app.instructions.removeClass(  'qni-active' );
			app.searchResultsCollection.reset();
			app.searchField.blur();    // because toggleInterface() will return early if we're focused on an input field
		},

		/**
		 * Show relevant links based on the user's query
		 *
		 * @param {object} event
		 */
		showRelevantLinks : function( event ) {
			try {
				if ( event.which === app.options.shortcuts['open-link'].code ) {
					app.openLink();
				} else if ( event.which === app.options.shortcuts['next-link'].code ) {
					app.searchResultsCollection.moveActiveLink( 'forwards' );
				} else if ( event.which === app.options.shortcuts['previous-link'].code ) {
					app.searchResultsCollection.moveActiveLink( 'backwards' );
				} else {
					app.updateSearchResults();
				}
			} catch( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Open the active link
		 */
		openLink : function() {
			var link = app.searchResults.find( 'li.qni-active' ).find( 'a' );

			if ( undefined !== link.attr( 'href' ) ) {
				link.get( 0 ).click();
				app.closeInterface();
			}
		},

		/**
		 * Update the search results with based on new input
		 */
		updateSearchResults : function() {
			var query = app.searchField.val();

			app.allLinks.invoke( 'set', { state : 'inactive' } );
			app.searchResultsCollection.reset( app.allLinks.search( query, app.options['search-results-limit'] ) );

			if ( app.searchResultsCollection.length > 0 ) {
				app.instructions.addClass( 'qni-active' );
				app.searchResults.addClass( 'qni-active' );
			} else {
				app.instructions.removeClass( 'qni-active' );
				app.searchResults.removeClass( 'qni-active' );
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

	/*
	 * Collection for link models
	 */
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

	/*
	 * Model for a link
	 */
	app.Models.Link = Backbone.Model.extend( {
		defaults : {
			id    : 0,
			title : '',
			url   : '',
			state : 'inactive'
		}
	} );

} )();

if ( 'function' !== typeof murmurhash3_32_gc ) {
	/**
	 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
	 *
	 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
	 * @see http://github.com/garycourt/murmurhash-js
	 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
	 * @see http://sites.google.com/site/murmurhash/
	 *
	 * @param {string} key ASCII only
	 * @param {number} seed Positive integer only
	 * @return {number} 32-bit positive integer hash
	 */

	function murmurhash3_32_gc( key, seed ) {
		var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

		remainder = key.length & 3; // key.length % 4
		bytes = key.length - remainder;
		h1 = seed;
		c1 = 0xcc9e2d51;
		c2 = 0x1b873593;
		i = 0;

		while ( i < bytes ) {
			k1 =
				((key.charCodeAt( i ) & 0xff)) |
				((key.charCodeAt( ++i ) & 0xff) << 8) |
				((key.charCodeAt( ++i ) & 0xff) << 16) |
				((key.charCodeAt( ++i ) & 0xff) << 24);
			++i;

			k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
			k1 = (k1 << 15) | (k1 >>> 17);
			k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

			h1 ^= k1;
			h1 = (h1 << 13) | (h1 >>> 19);
			h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
			h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
		}

		k1 = 0;

		switch ( remainder ) {
			case 3:
				k1 ^= (key.charCodeAt( i + 2 ) & 0xff) << 16;
			case 2:
				k1 ^= (key.charCodeAt( i + 1 ) & 0xff) << 8;
			case 1:
				k1 ^= (key.charCodeAt( i ) & 0xff);

				k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
				k1 = (k1 << 15) | (k1 >>> 17);
				k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
				h1 ^= k1;
		}

		h1 ^= key.length;

		h1 ^= h1 >>> 16;
		h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= h1 >>> 13;
		h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
		h1 ^= h1 >>> 16;

		return h1 >>> 0;
	}
}

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
				this.$el.addClass( 'qni-active' );
			} else {
				this.$el.removeClass( 'qni-active' );
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