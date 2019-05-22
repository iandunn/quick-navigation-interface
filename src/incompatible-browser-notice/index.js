/**
 * Render a notice that the user's browser doesn't meet this app's requirements.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function IncompatibleBrowserNotice( props ) {
	return (
		<div>
			<p>I'm sorry but your browser doesn't support one of the technologies that this feature requires.</p>

			<p>If you can, please <a href="https://browsehappy.com/">upgrade to a newer version</a>.</p>
		</div>
	);
}

export default IncompatibleBrowserNotice;
