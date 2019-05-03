/**
 * Render a preview of the active result.
 *
 * Otherwise, the user would have to use their mouse and hover over the link in order to see where it would take
 * them. There's no way to programmatically trigger the browser's built-in preview, so instead this is styled to
 * look similar.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function ActiveUrlPreview( props ) {
	const { url } = props;

	// todo if url is relative, add host
	// need to test different scenarios where that might break

	return (
		<div id="qni-result-preview">
			{ url }
		</div>
	);
}

export default ActiveUrlPreview;
