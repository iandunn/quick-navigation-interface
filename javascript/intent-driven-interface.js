// todo rename to app.js when break apart concat and uglify tasks

( function( $ ) {
	'use strict';

	var app = window.IntentDrivenInterface = {
		/**
		 * Initialization that runs as soon as this file has loaded
		 */
		start : function() {
			this.options       = idiOptions;
			this.mainContainer = $( '#idi-container' );
			this.searchField   = $( '#idi-search' );
			idiOptions         = null;

			// todo change from this.options to app.options ?
			// todo can move try/catch to bootstrap?

			try {
				$( window ).keyup( app.toggleInterface );
				app.mainContainer.click( app.toggleInterface );
				app.searchField.keyup( app.showRelevantLinks );
				// todo maybe make this a controller that calls toggleinteface, showrelevantlinks, etc. better than having two listeners for same event?
			} catch ( exception ) {
				app.log( exception );
			}
		},

		/**
		 * Reveal the interface when the user presses the shortcut
		 *
		 * @todo move to relevant view
		 *
		 * @param {object} event
		 */
		toggleInterface : function( event ) {
			if ( 'keyup' === event.type ) {
				if ( event.key === app.options.shortcuts.open ) {
					app.mainContainer.addClass( 'idi-active' );
					app.searchField.focus();
				} else if ( event.key === app.options.shortcuts.close ) {
					app.mainContainer.removeClass( 'idi-active' );
				}
			} else if ( 'click' === event.type ) {
				if ( 'notification-dialog-background' === event.target.className || 'media-modal-icon' === event.target.className ) {
					app.mainContainer.removeClass( 'idi-active' );
				}
			}
		},

		/**
		 * Show relevant links based on the user's query
		 *
		 * @todo move to relevant view
		 */
		showRelevantLinks : function() {
			$( '#idi-instructions' ).addClass( 'idi-active' );
			$( '#idi-menu' ).addClass( 'idi-active' );
		},

		/**
		 * Log a message to the console
		 *
		 * @param {*} error
		 */
		log : function( error ) {
			if ( ! window.console ) {
				return;
			}

			if ( 'string' === typeof error ) {
				console.log( 'Intent-Driven Interface: ' + error );
			} else {
				console.log( 'Intent-Driven Interface: ', error );
			}
		}
	};
} )( jQuery );

( function() {
	'use strict';
	var app = window.IntentDrivenInterface;

	app.Collections.Links = Backbone.Collection.extend( {
		model : app.Models.Link
	} );
} )();

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

( function( $ ) {
	'use strict';
	var app = window.IntentDrivenInterface;

	/*
	 * Base view
	 */
	app.View = wp.Backbone.View.extend( {
		// todo maybe prepare?

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
			if ( 'undefined' === typeof this.model ) {
				app.log( 'model view init' );

				return;
				// todo temp workaround, not sure why this is being called when a model is instantiated, or even how
			}

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

		// todo listen for changes and re-render

		initialize : function() {
			if ( 'undefined' === typeof this.collection ) {
				app.log( 'collect view init' );

				return;
				// todo temp workaround, not sure why this is being called when a model is instantiated, or even how
			}

			this.render();
			this.listenTo( this.collection, 'reset', this.render );
		},

		render : function() {
			this.$el.html( '' );

			app.log( this.collection );
			this.$el.append( '<li>bwoken</li>' );
			return;

			this.collection.each( function( link ) {
				app.log( link );

				var linkView = new app.Views.Link( { model: link } );
				this.$el.append( linkView.el );
			}, this );
		}
	} );
} )( jQuery );

// Initialize the main class after Grunt has concatenated all the files together
IntentDrivenInterface.start();

// todo think of a better way to do this?
