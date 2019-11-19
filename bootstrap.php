<?php

/*
Plugin Name: Quick Navigation Interface
Plugin URI:  https://wordpress.org/plugins/quick-navigation-interface
Description: Quickly access screens and content within wp-admin just by typing the first few letters of the name.
Version:     1.0.1
Author:      Ian Dunn
Author URI:  https://iandunn.name
*/

defined( 'WPINC' ) || die;

define( 'QNI_VERSION',              '1.0.1' );
define( 'QNI_REQUIRED_PHP_VERSION', '5.6' );  // Because of WordPress minimum requirements.
define( 'QNI_REQUIRED_WP_VERSION',  '5.0' );  // Because of Gutenberg components.

/**
 * Checks if the system requirements are met
 *
 * @return bool True if system requirements are met, false if not
 */
function qni_requirements_met() {
	global $wp_version;

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

	require_once( dirname( __FILE__ ) . '/requirements-error.php' );
}


/**
 * Detect if the current screen is the login screen.
 *
 * @see https://wordpress.stackexchange.com/questions/12863/check-if-wp-login-is-current-page#comment506953_225298
 *
 * @todo Remove this if https://core.trac.wordpress.org/ticket/19898 provides a canonical solution.
 *
 * @return bool
 */
function qni_is_login_screen() {
	return false !== stripos( wp_login_url(), $_SERVER['SCRIPT_NAME'] );
}

/*
 * Check requirements and load the main class
 *
 * The main program needs to be in a separate file that only gets loaded if the plugin requirements are met. Otherwise older PHP installations could crash when trying to parse it.
 */
if ( qni_requirements_met() ) {
	/*
	 * This isn't really what `wp_is_json_request()` is meant for, but it's the best option until
	 * https://core.trac.wordpress.org/ticket/42061 is resolved.
	 *
	 * @todo Replace with `wp_doing_rest()` (or whatever) once that's available on minimum required WP version.
	 */
	if ( is_admin() || wp_is_json_request() || qni_is_login_screen() ) {
		require_once( dirname( __FILE__ ) . '/components/main/controller.php' );
	}
} else {
	add_action( 'admin_notices', 'qni_requirements_error' );
}
