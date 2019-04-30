/**
 * WordPress dependencies
 */
const { Component } = wp.element;

class SearchResults extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			activeLink : '',
			// maybe need to bring back murmer.js to create a unique ID hash, b/c url alone isn't unique. need url+title
			// if yes then use npm instead of bundling. maybe newer one that's more popular too
			// but first look if there's an easy way w/ native js. i mean, hell, why not just use
		};
	}

	render() {
		const { links, query, limit } = this.props;
		let results = [];

		// track state for which link is currently selected?

		/*
		 * This only finds the _first_ X matches before the limit is reached, rather than the _best_ X matches,
		 * but in this context they can just keep typing to further narrow the results, so that's probably good
		 * enough for now.
		 */
		if ( query ) {
			for ( const link of links ) {
				if ( link.title.toLowerCase().indexOf( query.toLowerCase() ) >= 0 ) {
					results.push( link );
				}

				if ( results.length > limit ) {
					break;
				}
			}
		}

		// maybe create functionaly component for individual links, w/ prop to show whether they're active or not

		return (
			<ul id="qni-search-results">
				{ /* maybe use a FormTokenField here instead of something custom? limit of 100 suggestions though so would need to extend that?
			that's similar, but definitely not hte same. maybe reuse some of the same things, though, like the way it stores and searches for data?
			*/ }

				{ results.map( link => {
					return (
						<li>
							<a href={ link.url }>
								{ link.title }
							</a>
						</li>
					);
				} ) }
			</ul>
		);
	}
}

export default SearchResults;
