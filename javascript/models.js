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
