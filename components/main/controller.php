<?php

namespace Quick_Navigation_Interface;
use WP_Post;

defined( 'WPINC' ) || die();

add_action( 'rest_api_init',          __NAMESPACE__ . '\register_endpoints' );
add_action( 'admin_enqueue_scripts',  __NAMESPACE__ . '\enqueue_scripts' );
add_action( 'login_enqueue_scripts',  __NAMESPACE__ . '\enqueue_scripts' ); // So init() can clear cache on logout.
add_action( 'post_updated',           __NAMESPACE__ . '\update_content_index_expiration_timestamp', 10, 3 );
add_action( 'transition_post_status', __NAMESPACE__ . '\update_content_index_expiration_timestamp', 10, 3 );


/**
 * Register the REST API endpoints.
 *
 * We use a custom endpoint rather than the Core ones, because we want to get all post types, want post types
 * that aren't registered in the API, and want more than 100 items per request.
 *
 * We don't use the Search endpoint, because that would be much, much slower than having a local index of all
 * content that can be immediately searched on the client side, without the delays of slow HTTP requests.
 */
function register_endpoints() {
	register_rest_route(
		'quick-navigation-interface/v1',
		'/content-index/',
		array(
			'methods'  => 'GET',
			'callback' => __NAMESPACE__ . '\get_content_index',

			/*
			 * Allow any user who can read posts to access the endpoint. `serve_content_index()` will ensure
			 * that they are only provided with posts that they have authorization to read.
			 */
			'permission_callback' => function() {
				return current_user_can( 'read' );
			},
		)
	);
}

/**
 * Enqueue scripts and stylesheets
 */
function enqueue_scripts() {
	wp_enqueue_style(
		'quick-navigation-interface',
		plugins_url( 'build/quick-navigation-interface.min.css', dirname( __DIR__ ) ),
		array( 'wp-components' ),
		QNI_VERSION,
		'all'
	);

	wp_enqueue_script(
		'quick-navigation-interface',
		plugins_url( 'build/quick-navigation-interface.min.js', dirname( __DIR__ ) ),
		json_decode( file_get_contents( dirname( dirname( __DIR__ ) ) . '/build/quick-navigation-interface.min.deps.json' ) ),
		QNI_VERSION,
		true
	);

	$script_data = array_merge(
		get_options(),
		array(
			'plugin_version'  => QNI_VERSION,
			'user_db_version' => get_content_index_timestamp(),
			'root_url'        => get_rest_url(),
		)
	);

	$inline_script = sprintf(
		'var qniOptions = JSON.parse( decodeURIComponent( \'%s\' ) );',
		rawurlencode( wp_json_encode( $script_data ) )
	);

	wp_add_inline_script( 'quick-navigation-interface', $inline_script, 'before' );
}

/**
 * Define the plugin's options
 *
 * @return array
 */
function get_options() {
	$options = array(
		'search-results-limit' => 4,

		'shortcuts' => array(
			'open-interface' => array(
				'code'  => 192,
				'label' => __( '`', 'quick-navigation-interface' ),
			),

			'open-interface-alternate' => array(
				/*
				 * This would ideally be the primary key, since it's much more intuitive and universal, but
				 * it needs to be the alternate for backwards-compatibility.
				 *
				 * @see https://github.com/iandunn/quick-navigation-interface/issues/1
				 */
				'code'  => 71,
				'label' => __( 'g', 'quick-navigation-interface' ),
			),

			'next-link' => array(
				'code'  => 40,
				'label' => __( 'Down', 'quick-navigation-interface' ),
			),

			'previous-link' => array(
				'code'  => 38,
				'label' => __( 'Up', 'quick-navigation-interface' ),
			),

			'open-link' => array(
				'code'  => 13,
				'label' => __( 'Enter', 'quick-navigation-interface' ),
			),
		),
	);

	return apply_filters( 'qni_options', $options );
}

/**
 * Get the timestamp of when the current user's index was built
 *
 * If they don't have one yet, then request that one be built, and get the timestamp from that.
 *
 * We need to have a timestamp before the index is enqueued for the first time, because if we don't then
 * `false` would be passed as the `version` parameter, which would be converted to the current Core version,
 * and would then be set to 1 on the next load, because an index would have been built after wp_enqueue_script()
 * was called. So, there would have been an unnecessary cache bust, forcing the user to re-download the
 * unchanged index.
 *
 * @return int
 */
function get_content_index_timestamp() {
	$index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', true );

	if ( ! $index_timestamp ) {
		get_content_index();  // Rebuild the index.
		$index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', true );
	}

	return $index_timestamp;
}

/**
 * Update the timestamp of the last cache invalidation event
 *
 * When a new post is added, or an existing post changes its title, then the cached index for all users is now
 * stale and needs to be rebuilt. We store a central option with the timestamp of when the caches were invalidated,
 * and content_index_expired() checks the timestamp of each user's index against that value to determine if it's stale.
 *
 * This approach is more complex than the alternatives, but necessary. Rebuilding all the indexes immediately
 * would not be performant at scale, and making a manual DELETE query on all index timestamps in the usermeta
 * table would bypass all the logic in delete_metadata(), which could cause caches to get out of sync and
 * other bugs.
 *
 * This can also be called manually, like in the case of content_index_expired(). Because it can be called from varied
 * sources, the parameters are accessed dynamically based on context, rather than being explicitly declared in
 * the function definition.
 *
 * @param WP_Post|string $1 The `post_updated` hook passes the the post object _after_ the updated. The
 *                       `transition_post_status` hook passes the previous status of the post, before it changed.
 * @param WP_Post|null $1 The `post_updated` hook passes the the post object _before_ the updated. Parameter is
 *                     not used for any other hooks.
 */
function update_content_index_expiration_timestamp() {
	$current_filter = current_filter();

	// We only need to update the timestamp when called manually, a title changes, or a new post is added.
	if ( 'post_updated' === $current_filter ) {
		$post_after  = func_get_arg( 1 );
		$post_before = func_get_arg( 2 );

		if ( $post_before->post_title === $post_after->post_title ) {
			return;
		}
	} elseif ( 'transition_post_status' === $current_filter ) {
		$old_status = func_get_arg( 1 );

		if ( 'auto-draft' !== $old_status ) {
			return;
		}
	}

	update_option( 'qni_content_index_expiration_timestamp', time() );

	get_content_index(); // Rebuild the index.
}

/**
 * Get an index of content accessible to the current user
 *
 * Each user has to have their own index, because they'll have permission to view different items. Sharing a
 * global index of everything would result in leaking the existence and titles of posts that users who aren't
 * supposed to know about.
 *
 * Ideally we'd want to only fetch posts that the current user can access, but Core's capability system works
 * on the fly rather than based on static roles alone. Because we have to fetch posts the user may not have
 * access to, but also have to limit the number we fetch for performance reasons, this can result in some
 * content the user has access to not showing up, if there are X newer posts that they can't access, where
 * X is the query limit. That's probably an edge case, though. It's worth noting, but probably not worth
 * adding complexity to solve.
 *
 * @return array
 */
function get_content_index() {
	/*
	 * When this is called from the REST API server, the a nonce has already been verified.
	 *
	 * When this is called programmatically, a nonce is not needed.
	 */

	$current_user_id = get_current_user_id();

	// Return the cached index if it's not stale.
	if ( ! content_index_expired() ) {
		return get_user_meta( $current_user_id, 'qni_content_index', true );
	}

	// Build fresh index.
	$index = array();

	$content_params = array(
		'post_type'   => 'any',
		'post_status' => 'any',
		'numberposts' => 500,

		// We may reach the limit and exclude some posts, and the user is more likely to want new posts than older ones.
		'orderby'     => 'date',
		'order'       => 'DESC',
	);

	$content_params = apply_filters( 'qni_content_index_params', $content_params );
	$content        = get_posts( $content_params );

	foreach ( $content as $item ) {
		if ( current_user_can( 'edit_post', $item->ID ) ) {
			$index[] = array(
				'title' => esc_html( get_the_title( $item ) ),
				'type'  => $item->post_type,
				'url'   => get_edit_post_link( $item->ID, 'url' ),
			);
		}
	}

	/*
	 * Cache the index and the time it was generated
	 *
	 * A extra second is added to the timestamp, just to be safe, because this will run soon after
	 * update_content_index_expiration_timestamp(), and the time difference will be rounded off to nearest second,
	 * which could make them equal, and that would distort the results of content_index_expired().
	 */
	update_user_meta( $current_user_id, 'qni_content_index',           $index );
	update_user_meta( $current_user_id, 'qni_content_index_timestamp', time() + 1 );

	return $index;
}

/**
 * Determine if the user's cached content index is stale
 *
 * See update_content_index_expiration_timestamp() for some details related to this.
 *
 * @return bool
 */
function content_index_expired() {
	$cached_index = get_user_meta( get_current_user_id(), 'qni_content_index', true );

	// v1.0 added the `type` item, so indexes missing that are expired and need to be rebuilt.
	if ( empty( $cached_index[0]['type'] ) ) {
		return true;
	}

	$expired         = true;
	$index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', time() );

	/*
	 * Prime the expiration timestamp if `update_content_index_expiration_timestamp()` hasn't been triggered
	 * yet.
	 *
	 * `qni_content_index_expiration_timestamp` is shared by all users, since updating/adding a post will
	 * invalidate the cache for most users in most cases, so it's simpler to invalidate all that trying to only
	 * invalidate those actually affected.
	 */
	$expiration_timestamp = get_option( 'qni_content_index_expiration_timestamp' );

	if ( ! $expiration_timestamp ) {
		update_content_index_expiration_timestamp();
		$expiration_timestamp = get_option( 'qni_content_index_expiration_timestamp' );
	}

	if ( $expiration_timestamp < $index_timestamp ) {
		$expired = false;
	}

	return $expired;
}
