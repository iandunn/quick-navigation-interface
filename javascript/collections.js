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
