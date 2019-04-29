function SearchResults( props ) {
	const { query } = props;

	return (
		<ul id="qni-search-results">
			{/* maybe use a FormTokenField here instead of something custom? limit of 100 suggestions though so would need to extend that?
			that's similar, but definitely not hte same. maybe reuse some of the same things, though, like the way it stores and searches for data?
			*/}

			<li>
				<a href="foo">
					Parent &rarr; { query.split( '' ).reverse().join( '' ) }
				</a>
			</li>
		</ul>
	);
}

export default SearchResults;
