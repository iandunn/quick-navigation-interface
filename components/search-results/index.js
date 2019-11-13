/**
 * Internal dependencies
 */
import './style.scss';


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
		<li className={ active ? 'qni-search-results__item is-active' : 'qni-search-results__item' }>
			<span className="qni-search-results__item-title">
				{ parentTitle && parentTitle + ' > ' }
				<a href={ url } className="qni-search-results__item-link">
					{ title }

					{ /* todo apostrpohes in post titles (but not link titles) show up as &#8217; instead of the character
					same as https://github.com/WordPress/wordcamp.org/issues/227

					maybe do `import { stripTagsAndEncodeText } from '@wordpress/sanitize';` and use that?
					*/ }
				</a>
			</span>

			<span className="qni-search-results__item-link-type">
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
