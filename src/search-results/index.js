/**
 * Render an individual search result item.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Result( props ) {
	const { active, link }                  = props;
	const { parentTitle, title, type, url } = link;

	return (
		<li className={ active ? 'qni-active-result' : '' }>
			{ parentTitle && parentTitle + ' > ' }

			<a href={ url }>
				{ title }
			</a> { ' ' }

			<span className="qni-link-type">
				[{ type }]
			</span>
		</li>
	);
}

/**
 * Render a preview of the active result.
 *
 * Otherwise, the user would have to use their mouse and hover over the link in order to see where it would take
 * them.
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
		<div className="qni-result-preview">
			{ url }
		</div>
	);
}

/**
 * Render the list of search results.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function SearchResults( props ) {
	const { activeResultIndex, results } = props;

	return (
		<ul id="qni-search-results">
			{ results.map( ( link, index ) => {
				return (
					<Result
						key={ link.url } // todo not always unique, might need to hash title+url, and remove duplicates
						link={ link }
						active={ index === activeResultIndex }
					/>
				);
			} ) }

			{ null !== activeResultIndex &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
				// todo instead of this, programatically do link.hover() so the browser's default preview shows instead
			}
		</ul>
	);
}

export default SearchResults;
