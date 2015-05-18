( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link
	} );
} )();
