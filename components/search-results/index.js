/**
 * Render an individual search result item.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Result( { active, link } ) {
	const { parentTitle, title, type, url } = link;

	return (
		<li className={ active ? 'qni-active-result' : '' }>
			<span className="qni-result-title">
				{ parentTitle && parentTitle + ' > ' }
				<a href={ url }>
					{ title }
					{/* todo apostrpohes in post titles (but not link titles) should up as &#8217; instead of the character
					similar happens in schedule block
					 */}
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
export function SearchResults( { activeResultIndex, results } ) {
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
