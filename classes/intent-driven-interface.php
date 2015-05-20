<?php

class Intent_Driven_Interface {
	protected $options;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->options = array(
			'limit' => 4,

			'shortcuts' => array(
				'open-interface' => array(
					'code'  => 192,
					'label' => __( '`',      'intent-driven-interface' )
				),
				'next-link' => array(
					'code'  => 40,
					'label' => __( 'Down',   'intent-driven-interface' )
				),
				'previous-link' => array(
					'code'  => 38,
					'label' => __( 'Up',     'intent-driven-interface' )
				),
				'open-link' => array(
					'code'  => 13,
					'label' => __( 'Enter',  'intent-driven-interface' )
				),
				'close-interface' => array(
					'code'  => 27,
					'label' => __( 'Escape', 'intent-driven-interface' )
				),
			),
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
		require_once( dirname( dirname( __FILE__ ) ) . '/views/interface.php' );
		require_once( dirname( dirname( __FILE__ ) ) . '/views/intent-link.php' );
	}
}
