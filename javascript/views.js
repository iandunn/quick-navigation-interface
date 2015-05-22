( function() {
	'use strict';
	var app = window.QuickNavigationInterface;

	/*
	 * View for an individual Link model
	 */
	app.Views.Link = Backbone.View.extend( {
		tagName   : 'li',
		template  : wp.template( 'qni-link' ),

		/**
		 * Initialize the view
		 */
		initialize : function() {
			this.render();
			this.listenTo( this.model, 'change', this.render );
		},

		/**
		 * Render the view
		 */
		render : function() {
			if ( 'active' === this.model.get( 'state' ) ) {
				this.$el.addClass( 'idi-active' );
			} else {
				this.$el.removeClass( 'idi-active' );
			}

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
