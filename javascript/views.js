( function( $ ) {
	'use strict';
	var app = window.IntentDrivenInterface;

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = Backbone.View.extend( {
		tagName   : 'li',
		className : 'idi-active',   // todo set when up/down keys pressed
		template  : wp.template( 'intent-link' ),

		initialize : function() {
			this.render();
		},

		// todo jsdoc on all functions

		render : function() {
			this.$el.html( this.template( this.model.toJSON() ) );
		}
	} );

	/*
	 * View for a collection of Links
	 */
	app.Views.Links = Backbone.View.extend( {
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
