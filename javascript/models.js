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
			parentTitle : '',
			url   : '',
			state : 'inactive'

			// todo re-align
		}
	} );

} )();
