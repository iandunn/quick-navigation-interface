( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = Backbone.View.extend( {
		tagName   : 'li',
		className : 'idi-active',   // todo set when up/down keys pressed
		template  : wp.template( 'intent-link' ),

		/**
		 * Initialize the view
		 */
		initialize : function() {
			this.render();
		},

		/**
		 * Render the view
		 */
		render : function() {
			this.$el.html( this.template( this.model.toJSON() ) );
		}
	} );

	/*
	 * View for a collection of Links
	 */
	app.Views.Links = Backbone.View.extend( {
		tagName : 'ul',

		/**
		 * Initialize the view
		 */
		initialize : function() {
			this.render();
			this.listenTo( this.collection, 'reset', this.render );
		},

		/**
		 * Render the view
		 */
		render : function() {
			this.$el.html( '' );

			this.collection.each( function( link ) {
				var linkView = new app.Views.Link( { model: link } );
				this.$el.append( linkView.el );
			}, this );
		}
	} );

} )();
