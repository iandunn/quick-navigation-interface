<?php

/*
Plugin Name: Quick Navigation Interface
Plugin URI:  https://wordpress.org/plugins/quick-navigation-interface
Description: Quickly access screens and content within wp-admin just by typing the first few letters of the name.
Version:     1.0
Author:      Ian Dunn
Author URI:  https://iandunn.name
*/

defined( 'WPINC' ) or die;

define( 'QNI_VERSION',              '1.0' );
define( 'QNI_REQUIRED_PHP_VERSION', '5.6' );  // Because of WordPress minimum requirements.
define( 'QNI_REQUIRED_WP_VERSION',  '5.0' );  // Because of Gutenberg components.

/**
 * Checks if the system requirements are met
 * @return bool True if system requirements are met, false if not
 */
function qni_requirements_met() {
	global $wp_version;
	require_once( ABSPATH . '/wp-admin/includes/plugin.php' );

	if ( version_compare( PHP_VERSION, QNI_REQUIRED_PHP_VERSION, '<' ) ) {
		return false;
	}

	if ( version_compare( $wp_version, QNI_REQUIRED_WP_VERSION, '<' ) ) {
		return false;
	}

	return true;
}

/**
 * Prints an error that the system requirements weren't met.
 */
function qni_requirements_error() {
	global $wp_version;

	require_once( dirname( __FILE__ ) . '/views/requirements-error.php' );
}

/**
 * Determines whether the current request is a REST API request for one of our endpoints.
 *
 * @return bool
 */
function qni_rest_request() {
	$prefix = rest_get_url_prefix();

	// Using `$_SERVER` because this runs too early to check the `REST_REQUEST` constant.
	return 0 === stripos( $_SERVER['REQUEST_URI'], "/$prefix/quick-navigation-interface" );
}

/*
 * Check requirements and load the main class
 *
 * The main program needs to be in a separate file that only gets loaded if the plugin requirements are met. Otherwise older PHP installations could crash when trying to parse it.
 */
if ( qni_requirements_met() ) {
	if ( is_admin() || qni_rest_request() ) {
		require_once( dirname( __FILE__ ) . '/classes/quick-navigation-interface.php' );
		$GLOBALS['Quick_Navigation_Interface'] = new Quick_Navigation_Interface();
	}
} else {
	add_action( 'admin_notices', 'qni_requirements_error' );
}
