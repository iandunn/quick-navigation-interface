<?php defined( 'WPINC' ) || die; ?>

<div class="error">
	<p>
		<?php esc_html_e(
			"Quick Navigation Interface error: Your environment doesn't meet all of the system requirements listed below.",
			'quick-navigation-interface'
		); ?>
	</p>

	<ul class="ul-disc">
		<li>
			<strong>
				<?php echo esc_html( sprintf(
					__( 'PHP %s+', 'quick-navigation-interface' ),
					QNI_REQUIRED_PHP_VERSION
				) ); ?>
			</strong>

			<em>
				<?php echo esc_html( sprintf(
					__( "(You're running version %s)", 'quick-navigation-interface' ),
					PHP_VERSION
				) ); ?>
			</em>
		</li>

		<li>
			<strong>
				<?php echo esc_html( sprintf(
					__( 'WordPress %s+', 'quick-navigation-interface' ),
					QNI_REQUIRED_WP_VERSION
				) ); ?>
			</strong>

			<em>
				<?php echo esc_html( sprintf(
					__( "(You're running version %s)", 'quick-navigation-interface' ),
					$wp_version
				) ); ?>
			</em>
		</li>
	</ul>

	<p>
		<?php echo wp_kses_data( sprintf(
			__( 'If you need to upgrade your version of PHP you can ask your hosting company for assistance, and if you need help upgrading WordPress you can refer to <a href="%s">the Codex</a>.', 'quick-navigation-interface' ),
			'http://codex.wordpress.org/Upgrading_WordPress'
		) ); ?>
	</p>
</div>
