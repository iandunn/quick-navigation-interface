( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link,

		search : function( query ) {
			var results = [];

			if ( '' !== query ) {
				results = this.filter( function ( link ) {
					return link.get( 'title' ).toLowerCase().indexOf( query.toLowerCase() ) >= 0;
				} );
			}

			return results;
		}
	} );
} )();
