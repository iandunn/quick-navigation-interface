var IntentDrivenInterface = ( function( $ ) {
	'use strict';
	var options, mainContainer, searchField;

	/**
	 * Initialization that runs as soon as this file has loaded
	 *
	 * @param {object} initOptions
	 */
	function construct( initOptions ) {
		options         = initOptions;
		initOptions     = null;
		mainContainer   = $( '#idi-container' );
		searchField     = $( '#idi-search' );

		try {
			$( window ).keyup( toggleInterface );
			mainContainer.click( toggleInterface );
			searchField.keyup( showRelevantLinks );
			// todo maybe make this a controller that calls toggleinteface, showrelevantlinks, etc. better than having two listeners for same event?
		} catch ( exception ) {
			log( exception );
		}
	}

	/**
	 * Reveal the interface when the user presses the shortcut
	 *
	 * @param {object} event
	 */
	function toggleInterface( event ) {
		if ( 'keyup' === event.type ) {
			if ( event.key === options.shortcuts.open ) {
				mainContainer.addClass( 'idi-active' );
				searchField.focus();
			} else if ( event.key === options.shortcuts.close ) {
				mainContainer.removeClass( 'idi-active' );
			}
		} else if ( 'click' === event.type ) {
			if ( 'notification-dialog-background' === event.target.className || 'media-modal-icon' === event.target.className ) {
				mainContainer.removeClass( 'idi-active' );
			}
		}
	}

	/**
	 * Show relevant links based on the user's query
	 *
	 * @param {object} event
	 */
	function showRelevantLinks() {
		$( '#idi-instructions' ).addClass( 'idi-active' );
		$( '#idi-menu' ).addClass( 'idi-active' );
	}

	/**
	 * Log a message to the console
	 *
	 * @param {*} error
	 */
	function log( error ) {
		if ( ! window.console ) {
			return;
		}

		if ( 'string' === typeof error ) {
			console.log( 'Intent-Driven Interface: ' + error );
		} else {
			console.log( 'Intent-Driven Interface: ', error );
		}
	}

	/*
	 * Reveal public methods
	 */
	return {
		construct : construct,
		log       : log
	};
} )( jQuery );

IntentDrivenInterface.construct( idiOptions );
