/**
 * WordPress dependencies
 */
const { RawHTML } = wp.element;
const { sprintf } = wp.i18n;

/**
 * Render usage instructions for the user.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Instructions( props ) {
	const { shortcuts } = props;

	return (
		<p id="qni-instructions">
			<RawHTML>
				{ sprintf(
					/*
					 * SECURITY WARNING: This string is intentionally not internationalized, because there
				     * isn't a secure way to do that yet.
				     *
					 * https://github.com/WordPress/gutenberg/issues/13156
					 */
					'Use <code>%1$s</code> and <code>%2$s</code> to navigate links, <code>%3$s</code> to open one, and <code>%4$s</code> to quit.',
					shortcuts[ 'previous-link' ].label,
					shortcuts[ 'next-link' ].label,
					shortcuts[ 'open-link' ].label,
					shortcuts[ 'close-interface' ].label,
					// ^ needs to be hard-coded? changing it via filter won't change the key that <Modal> is using to close.
					// can add a deprecation warning if php detects that it changed from the default
				) }
			</RawHTML>
		</p>
	);
}

export default Instructions;
