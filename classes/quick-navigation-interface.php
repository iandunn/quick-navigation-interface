<?php

class Quick_Navigation_Interface {
	protected $options;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->options = $this->get_options();

		add_action( 'admin_enqueue_scripts',     array( $this, 'enqueue_scripts'  ) );
		add_action( 'post_updated',              array( $this, 'update_content_index_expiration_timestamp' ), 10, 3 );
		add_action( 'transition_post_status',    array( $this, 'update_content_index_expiration_timestamp' ), 10, 3 );
		add_action( 'wp_ajax_qni_content_index', array( $this, 'output_content_index' ) ); // intentionally only registered for authenticated users, because output is user-specific
		add_filter( 'nocache_headers',           array( $this, 'set_cache_headers' ) );
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
			),
		);

		return apply_filters( 'qni_options', $options );
	}

	/**
	 * Update the timestamp of the last cache invalidation event
	 *
	 * When a new post is added, or an existing post changes its title, then the cached index for all users is now
	 * stale and needs to be rebuilt. We store a central option with the timestamp of when the caches were invalidated,
	 * and is_expired() checks the timestamp of each user's index against that value to determine if it's stale.
	 *
	 * This approach is more complex than the alternatives, but necessary. Rebuilding all the indexes immediately
	 * would not be performant at scale, and making a manual DELETE query on all index timestamps in the usermeta
	 * table would bypass all the logic in delete_metadata(), which could cause caches to get out of sync and
	 * other bugs.
	 *
	 * This can also be called manually, like in the case of index_expired(). Because it can be called from varied
	 * sources, the parameters are accessed dynamically based on context, rather than being explicitly declared in
	 * the function definition.
	 */
	public function update_content_index_expiration_timestamp() {
		$current_filter = current_filter();

		// We only need to update the timestamp when called manually, a title changes, or a new post is added
		if ( 'post_updated' == $current_filter ) {
			$post_after  = func_get_arg( 1 );
			$post_before = func_get_arg( 2 );

			if ( $post_before->post_title == $post_after->post_title ) {
				return;
			}
		} elseif( 'transition_post_status' == $current_filter ) {
			$old_status = func_get_arg( 1 );

			if ( 'auto-draft' != $old_status ) {
				return;
			}
		}

		update_option( 'qni_content_index_expiration_timestamp', time() );
		$this->get_content_index();

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
	public function get_content_index() {
		$current_user_id = get_current_user_id();

		// Return the cached index if it's not stale
		if ( ! $this->content_index_expired() ) {
			return get_user_meta( $current_user_id, 'qni_content_index', true );
		}

		// Build fresh index
		$index = array();

		$content_params = apply_filters( 'qni_content_index_params', array(
			'post_type'   => 'any',
			'post_status' => 'any',
			'numberposts' => 500,
			'orderby'     => 'date',    // because we may reach the limit and exclude some posts, and the user is more likely to want recent posts than older ones
			'order'       => 'DESC',
		) );

		$content = get_posts( $content_params );

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
	protected function content_index_expired() {
		$expired         = true;
		$index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', time() );

		// Prime the expiration timestamp if update_content_index_expiration_timestamp() hasn't been triggered yet
		if ( ! $expiration_timestamp = get_option( 'qni_content_index_expiration_timestamp' ) ) {
			$this->update_content_index_expiration_timestamp();
			$expiration_timestamp = get_option( 'qni_content_index_expiration_timestamp' );
		}

		if ( $expiration_timestamp < $index_timestamp ) {
			$expired = false;
		}

		return $expired;
	}

	/**
	 * Enqueue scripts and stylesheets
	 */
	public function enqueue_scripts() {
		$content_index_url = add_query_arg(
			array(
				'action' => 'qni_content_index',
				'user'   => get_current_user_id(),
				'nonce'  => wp_create_nonce( 'qni_content_index' ),
			),
			admin_url( 'admin-ajax.php' )
		);

		wp_enqueue_style(
			'quick-navigation-interface',
			plugins_url( "css/quick-navigation-interface.css", __DIR__ ),
			array( 'wp-components' ),
			QNI_VERSION,
			'all'
		);

		wp_enqueue_script(
			'qni-content-index',
			$content_index_url,   // see output_content_index() for an explanation of why we're enqueueing an AJAX handler as if it were a script
			array(),
			$this->get_content_index_timestamp(),
			true
		);

		wp_enqueue_script(
			'quick-navigation-interface',
			plugins_url( 'build/index.js', __DIR__ ),
			array(
				'qni-content-index',
				'wp-components',
				'wp-element',
				'wp-i18n',
			),
			QNI_VERSION,
			true
		);

		wp_localize_script(
			'quick-navigation-interface',
			'qniOptions',
			$this->options
		);
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
	protected function get_content_index_timestamp() {
		if ( ! $index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', true ) ) {
			$this->get_content_index();
			$index_timestamp = get_user_meta( get_current_user_id(), 'qni_content_index_timestamp', true );
		}

		return $index_timestamp;
	}

	/**
	 * Output the user's content index
	 *
	 * Normally data like this would be printed to each page using wp_localize_script, but the index can be up to
	 * about 50k, so we don't want to add that much weight to every single page load.
	 *
	 * So instead we enqueue this AJAX handler as a script, and have it output the index. That way the browser
	 * treats it like a file and caches it locally after the first time it's downloaded.
	 *
	 * The generated index is cached on the server side as well, so the overhead associated with dynamically printing
	 * it each time is trivial, and no greater than it would be if using wp_localize_script().
	 */
	public function output_content_index() {
		if ( ! wp_verify_nonce( $_GET['nonce'], 'qni_content_index' ) ) {
			wp_die( 'Invalid nonce.' );
		}

		header( 'Content-Type: application/x-javascript; charset=' . get_option( 'blog_charset' ) );

		?>

		window.qniContentIndex = <?php echo wp_json_encode( $this->get_content_index() ); ?>;

		<?php

		die();
	}

	/**
	 * Adjust HTTP headers so that browsers will cache responses to the `qni_content_index` AJAX request
	 *
	 * Normally Core prevents caching of all AJAX requests, but we want to make sure the content index is
	 * cached because it's loaded on every wp-admin screen and is potentially very heavy.
	 *
	 * @param array $cache_headers
	 *
	 * @return array
	 */
	public function set_cache_headers( $cache_headers ) {
		// Override the existing no-cache headers with cache headers
		if ( defined( 'DOING_AJAX' ) && isset( $_GET['action'] ) && 'qni_content_index' == $_GET['action'] ) {
			$last_modified     = date( 'D, d M Y H:i:s', $this->get_content_index_timestamp() ) . ' GMT';
			$expiration_period = WEEK_IN_SECONDS;

			$cache_headers = array(
				'Cache-Control' => 'maxage=' . $expiration_period,
				'ETag'          => '"' . md5( $last_modified ) . '"',
				'Last-Modified' => $last_modified,
				'Expires'       => gmdate( 'D, d M Y H:i:s', time() + $expiration_period ) . ' GMT',
			);
		}

		return $cache_headers;
	}
}
