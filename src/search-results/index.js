/**
 * WordPress dependencies
 */
const { Component } = wp.element;

function Result( props ) {
	const { active, link } = props;
	const { title, url }   = link;

	return (
		<li className={ active ? 'qni-active' : '' }>
			<a href={ url }>
				{ title }
			</a>
		</li>
	);
}

class SearchResults extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			activeLink : '',
			// maybe need to bring back murmer.js to create a unique ID hash, b/c url alone isn't unique. need url+title
			// if yes then use npm instead of bundling. maybe newer one that's more popular too
			// but first look if there's an easy way w/ native js. i mean, hell, why not just use
		};

		this.setActiveLink = this.setActiveLink.bind( this );
	}

	componentDidMount() {
		window.addEventListener( 'keyup', this.setActiveLink );
		// probably can't use KeyboardShortcuts for this, since want to monitor window, but maybe worth another look
	}

	componentWillUnmount() {
		window.removeEventListener( 'keyup', this.setActiveLink );
	}

	//
	setActiveLink( event ) {
		const { shortcuts } = this.props;
		const { which }     = event;

		if ( which !== shortcuts['previous-link'].code && which !== shortcuts['next-link'].code ) {
			// ^ would be more consice if put those two in an array and used idnexof() or soething?
			return; // maybe don't need this if refactor/modularize, b/c if/else below already checks this
		}

		// Don't move the input field's caret to home/end.
		event.preventDefault(); // todo isn't working

		const resultContainer   = document.getElementById( 'qni-search-results' );
		const allLinkElements   = resultContainer.getElementsByTagName( 'li' );
		let activeLinkIndex     = null;
		let newLinkIndex        = null;
		let counter             = 0;

		for ( const element of allLinkElements ) {
			if ( element.className === 'qni-active' ) {
				activeLinkIndex = counter;
				break;
			}

			counter++;
		}

		// modularize some of this

		// The user hasn't picked one yet, so start at the beginning or end.
		if ( null === activeLinkIndex ) {
			if ( which === shortcuts['previous-link'].code ) {
				newLinkIndex = allLinkElements.length - 1;
			} else if ( which === shortcuts['next-link'].code ) {
				newLinkIndex = 0;
			}
		}

		// The user already picked one, so move to the next/previous relative to it.
		else {
			if ( which === shortcuts[ 'previous-link' ].code ) {
				if ( activeLinkIndex === 0 ) {
					newLinkIndex = allLinkElements.length - 1;  // .length not supported for htmlcollection in all browsers?
				} else {
					newLinkIndex = activeLinkIndex - 1;
				}
			} else if ( which === shortcuts[ 'next-link' ].code ) {
				if ( activeLinkIndex === allLinkElements.length - 1 ) {
					newLinkIndex = 0;  // .length not supported for htmlcollection in all browsers?
				} else {
					newLinkIndex = activeLinkIndex + 1;
				}
			}
		}

		if ( null !== newLinkIndex ) {
			const newLink = allLinkElements[ newLinkIndex ].getElementsByTagName( 'a' )[0].href;

			this.setState( { activeLink: newLink } );
		}
	}

	render() {
		const { links, query, limit } = this.props;
		const { activeLink }          = this.state;
		let results                   = [];

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

		// modal window shifts positions as this list grows/shrinks, which sucks
		// use CSS to set a fixed height maybe, or maybe just a fixed position

		return (
			<ul id="qni-search-results">
				{ results.map( link => {
					return (
						<Result
							link={ link }
							active={ link.url === activeLink }
						/>
					);
				} ) }
			</ul>
		);
	}
}

export default SearchResults;
