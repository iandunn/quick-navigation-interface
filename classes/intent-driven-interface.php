<?php

class Intent_Driven_Interface {
	protected $options;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->options = array(
			'shortcuts' => array(
				'open-interface'  => '`',
				'next-link'       => 'ArrowDown',
				'previous-link'   => 'ArrowUp',
				'open-link'       => 'Enter',
				'close-interface' => 'Escape',
			),
			'limit' => 5,
		);

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts'  ) );
		add_action( 'admin_footer',          array( $this, 'output_templates' ) );
	}

	/**
	 * Enqueue scripts and stylesheets
	 */
	public function enqueue_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_style(
			'intent-driven-interface',
			plugins_url( "css/intent-driven-interface$suffix.css", dirname( __FILE__ ) ),
			array( 'media-views' ),
			IDI_VERSION,
			'all'
		);

		wp_enqueue_script(
			'intent-driven-interface',
			plugins_url( "javascript/intent-driven-interface$suffix.js", dirname( __FILE__ ) ),
			array( 'jquery', 'backbone', 'underscore', 'wp-util' ),
			IDI_VERSION,
			true
		);

		wp_localize_script(
			'intent-driven-interface',
			'idiOptions',
			apply_filters( 'idi_options', $this->options )
		);
	}

	/**
	 * Output the raw Backbone templates so they're available later on
	 */
	public function output_templates() {
		$shortcuts = $this->options['shortcuts'];

		// Change "ArrowDown" to just "Down"
		foreach( $shortcuts as & $shortcut ) {
			$shortcut = ltrim( $shortcut, 'Arrow' );
		}

		require_once( dirname( dirname( __FILE__ ) ) . '/views/interface.php' );
		require_once( dirname( dirname( __FILE__ ) ) . '/views/intent-link.php' );
	}
}
