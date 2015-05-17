<?php
/*
Plugin Name: Intent Driven Interface
Plugin URI:  http://wordpress.org/plugins/intent-driven-interface
Description: Allows you to quickly access any navigation link within wp-admin just by typing the first few letters.
Version:     0.1
Author:      Ian Dunn
Author URI:  http://iandunn.name
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Access denied' );
}

define( 'IDI_VERSION',              '0.1'   );
define( 'IDI_REQUIRED_PHP_VERSION', '5.2.4' );  // because of WordPress minimum requirements  // todo
define( 'IDI_REQUIRED_WP_VERSION',  '0'     );  // because of todo   // todo

/**
 * Checks if the system requirements are met
 * @return bool True if system requirements are met, false if not
 */
function idi_requirements_met() {
	global $wp_version;
	require_once( ABSPATH . '/wp-admin/includes/plugin.php' );

	if ( version_compare( PHP_VERSION, IDI_REQUIRED_PHP_VERSION, '<' ) ) {
		return false;
	}

	if ( version_compare( $wp_version, IDI_REQUIRED_WP_VERSION, '<' ) ) {
		return false;
	}

	return true;
}

/**
 * Prints an error that the system requirements weren't met.
 */
function idi_requirements_error() {
	global $wp_version;

	require_once( dirname( __FILE__ ) . '/views/requirements-error.php' );
}

/*
 * Check requirements and load the main class
 *
 * The main program needs to be in a separate file that only gets loaded if the plugin requirements are met. Otherwise older PHP installations could crash when trying to parse it.
 */
if ( idi_requirements_met() ) {
	require_once( dirname( __FILE__ ) . '/classes/intent-driven-interface.php' );
	$GLOBALS['intent_driven_interface'] = new Intent_Driven_Interface();
} else {
	add_action( 'admin_notices', 'ini_requirements_error' );    // todo test
}
