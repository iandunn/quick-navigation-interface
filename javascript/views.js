( function( $ ) {
	'use strict';
	var app = window.IntentDrivenInterface;

	/*
	 * Base view
	 */
	app.View = Backbone.View.extend( {
		// todo maybe prepare?

		// todo remove if not used
		inject : function( selector ) {
			this.render();
			$( selector ).html( this.el );
			this.views.ready();
		}
	} );

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = app.View.extend( {
		tagName   : 'li',
		className : 'idi-active',   // todo set when up/down keys pressed
		template  : wp.template( 'intent-link' ),

		initialize : function() {
			this.render();
		},

		// todo phpdoc on all functions
		// todo use inject() instead of overriding render()

		render : function() {
			this.$el.html( this.template( this.model.toJSON() ) );
		}
	} );

	/*
	 * View for a collection of Links
	 */
	app.Views.Links = app.View.extend( {
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
