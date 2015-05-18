( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link,

		/**
		 * Search the collection for links matching the query
		 *
		 * @param {string} query
		 * @returns {Array}
		 */
		search : function( query ) {
			var results = [];

			// todo add limit param

			if ( '' !== query ) {
				results = this.filter( function ( link ) {
					return link.get( 'title' ).toLowerCase().indexOf( query.toLowerCase() ) >= 0;
				} );
			}

			return results;
		}
	} );
} )();
