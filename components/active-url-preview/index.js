/**
 * Internal dependencies
 */
import './style.scss';


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
export function ActiveUrlPreview( { url } ) {
	return (
		<span className="qni-active-url-preview__url">
			{ url }
		</span>
	);
}
