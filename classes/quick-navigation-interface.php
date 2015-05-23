<?php

class Quick_Navigation_Interface {
	protected $options;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->options = $this->get_options();

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts'  ) );
		add_action( 'admin_footer',          array( $this, 'output_templates' ) );
	}

	/**
	 * Define the plugin's options
	 *
	 * @return array
	 */
	protected function get_options() {
		$options = array(
			'search-results-limit' => 4,

			'shortcuts' => array(
				'open-interface' => array(
					'code'  => 192,
					'label' => __( '`',      'quick-navigation-interface' )
				),
				'next-link' => array(
					'code'  => 40,
					'label' => __( 'Down',   'quick-navigation-interface' )
				),
				'previous-link' => array(
					'code'  => 38,
					'label' => __( 'Up',     'quick-navigation-interface' )
				),
				'open-link' => array(
					'code'  => 13,
					'label' => __( 'Enter',  'quick-navigation-interface' )
				),
				'close-interface' => array(
					'code'  => 27,
					'label' => __( 'Escape', 'quick-navigation-interface' )
				),
			),
		);

		return apply_filters( 'idi_options', $options );
	}

	/**
	 * Enqueue scripts and stylesheets
	 */
	public function enqueue_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_style(
			'quick-navigation-interface',
			plugins_url( "css/quick-navigation-interface$suffix.css", dirname( __FILE__ ) ),
			array( 'media-views' ),
			IDI_VERSION,
			'all'
		);

		wp_enqueue_script(
			'quick-navigation-interface',
			plugins_url( "javascript/quick-navigation-interface$suffix.js", dirname( __FILE__ ) ),
			array( 'jquery', 'backbone', 'underscore', 'wp-util' ),
			IDI_VERSION,
			true
		);

		wp_localize_script(
			'quick-navigation-interface',
			'idiOptions',
			$this->options
		);
	}

	/**
	 * Render a template
	 *
	 * Allows parent/child themes to override the markup by placing the a file named basename( $default_template_path )
	 * in their root folder, and also allows plugins or themes to override the markup by a filter. Themes might
	 * prefer that method if they place their templates in sub-directories to avoid cluttering the root folder.
	 * In both cases, the theme/plugin will have access to the variables so they can fully customize the output.
	 *
	 * @param string $default_template_path The path to the template, relative to the plugin's `views` folder
	 * @param array $variables              An array of variables to pass into the template's scope, indexed with
	 *                                      the variable name so that it can be extract()-ed
	 * @param string $require               'once' to use require_once() | 'always' to use require()
	 *
	 * @return string
	 */
	protected static function render_template( $default_template_path = false, $variables = array(), $require = 'once' ) {
		do_action( 'idi_render_template_pre', $default_template_path, $variables );

		$template_path = locate_template( 'idi-' . basename( $default_template_path ) );
		if ( ! $template_path ) {
			$template_path = dirname( dirname( __FILE__ ) ) . '/views/' . $default_template_path;
		}
		$template_path = apply_filters( 'idi_template_path', $template_path );

		if ( is_file( $template_path ) ) {
			extract( $variables );
			ob_start();

			if ( 'always' == $require ) {
				require( $template_path );
			} else {
				require_once( $template_path );
			}

			$template_content = apply_filters( 'idi_template_content', ob_get_clean(), $default_template_path, $template_path, $variables );
		} else {
			$template_content = '';
		}

		do_action( 'idi_render_template_post', $default_template_path, $variables, $template_path, $template_content );
		return $template_content;
	}

	/**
	 * Output the raw Backbone templates so they're available later on
	 */
	public function output_templates() {
		echo $this->render_template( 'interface.php', array ( 'shortcuts' => $this->options['shortcuts'] ) );
		echo $this->render_template( 'link.php' );
	}
}
