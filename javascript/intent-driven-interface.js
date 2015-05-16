var IntentDrivenInterface = ( function( $ ) {
	'use strict';
	var options;

	/**
	 * Initialization that runs as soon as this file has loaded
	 *
	 * @param {object} initOptions
	 */
	function construct( initOptions ) {
		options     = initOptions;
		initOptions = null;

		try {
			$( window ).keyup( toggleInterface );
			$( '#idi-search' ).keyup( showRelevantLinks );
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
		var mainWindow = $( '#idi-container' );

		if ( event.key === options.shortcuts.open ) {
			mainWindow.addClass( 'idi-active' );
			$( '#idi-search' ).focus();
		} else if ( event.key === options.shortcuts.close ) {
			mainWindow.removeClass( 'idi-active' );
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
		construct : construct
	};
} )( jQuery );

IntentDrivenInterface.construct( idiOptions );
