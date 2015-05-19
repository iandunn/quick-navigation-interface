( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

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

			return results;
		}
	} );
} )();
