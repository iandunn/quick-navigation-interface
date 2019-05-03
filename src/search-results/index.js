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
						key={ JSON.stringify( link ) }
						link={ link }
						active={ index === activeResultIndex }
					/>
				);
			} ) }
		</ul>
	);
}

export default SearchResults;
