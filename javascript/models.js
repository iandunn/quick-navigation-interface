( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	// todo should be doing try/catch here, or covered by app? test
	// todo assigning to window is the best practice? double check

	app.Models.Link = Backbone.Model.extend( {
		defaults : {
			'title' : '',
			'url'   : ''
		}
	} );
} )();
