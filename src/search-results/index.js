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

	// todo Results function should not be aware that SearchResults is a ul. It should wrap return in fragment, and SearchResults should add the li tag
	// Prob need to.move the key to the li as well

	return (
		<li className={ active ? 'qni-active-result' : '' }>
			<span className="qni-result-title">
				{ parentTitle && parentTitle + ' > ' }
				<a href={ url }>
					{ title }
				</a>
			</span>

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
