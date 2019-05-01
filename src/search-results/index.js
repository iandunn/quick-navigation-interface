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
			activeLink : '',    // maybe need to init this to the first result?

			// maybe need to bring back murmer.js to create a unique ID hash, b/c url alone isn't unique. need url+title
			// if yes then use npm instead of bundling. maybe newer one that's more popular too
			// but first look if there's an easy way w/ native js. i mean, hell, why not just use
		};

		this.handleKeyboardEvents = this.handleKeyboardEvents.bind( this );
	}

	componentDidMount() {
		window.addEventListener( 'keyup', this.handleKeyboardEvents );
		// probably can't use KeyboardShortcuts for this, since want to monitor window, but maybe worth another look
	}

	componentWillUnmount() {
		window.removeEventListener( 'keyup', this.handleKeyboardEvents );
	}

	// when props.query changes, set active link
		// at least when it's going from '' to something, and when it's going from something to ''
		// might not want to in other cases

	//
	handleKeyboardEvents( event ) {
		const { shortcuts } = this.props;
		const { which }     = event;

		switch( which ) {
			case shortcuts['previous-link'].code:
			case shortcuts['next-link'].code:
				this.setActiveLink( event );
				break;

			case shortcuts['open-link'].code:
				SearchResults.openActiveLink();
				break;
		}
	}

	//
	setActiveLink( event ) {
		const { shortcuts } = this.props;
		const { which }     = event;

		// Don't move the input field's caret to home/end.
		//event.preventDefault(); // todo isn't working

		const resultContainer = document.getElementById( 'qni-search-results' );
		const allLinkElements = resultContainer.getElementsByTagName( 'li' );
		let activeLinkIndex   = null;
		let newLinkIndex      = null;
		let counter           = 0;

		if ( allLinkElements.length < 1 ) {
			return;
		}

		for ( const element of allLinkElements ) {
			if ( element.className === 'qni-active' ) {
				activeLinkIndex = counter;
				break;
			}

			counter++;
		}
		// something is messed up when type query, select link, clear query, select new link. maybe need to reset the active link or something

		console.log(activeLinkIndex);
		// modularize some of this

		const direction = which === which === shortcuts['next-link'].code ? 'forwards' : 'backwards';

		if ( 'forwards' === direction ) {
			newLinkIndex = activeLinkIndex + 1;

			if ( this.length === newLinkIndex ) {
				newLinkIndex = 0;
			}
		} else {
			newLinkIndex = activeLinkIndex - 1;

			if ( -1 === newLinkIndex ) {
				newLinkIndex = this.length - 1;
			}
		}
		// todo the reason ^ is simpler than below, is that it assumes that there's always an active link, whereas below we assume that it sarts without one
		// would be simpler to make sure we always have one, so do that. how though? lifecycle method that gets run when `query` changes?
		// or can just do it in constructor?


		//
		//// The user hasn't picked one yet, so start at the beginning or end.
		//if ( null === activeLinkIndex ) {
		//	if ( which === shortcuts['previous-link'].code ) {
		//		newLinkIndex = allLinkElements.length - 1;
		//	} else if ( which === shortcuts['next-link'].code ) {
		//		newLinkIndex = 0;
		//	}
		//}
		//
		//// The user already picked one, so move to the next/previous relative to it.
		//else {
		//	if ( which === shortcuts[ 'previous-link' ].code ) {
		//		if ( activeLinkIndex === 0 ) {
		//			newLinkIndex = allLinkElements.length - 1;  // .length not supported for htmlcollection in all browsers?
		//		} else {
		//			newLinkIndex = activeLinkIndex - 1;
		//		}
		//	} else if ( which === shortcuts[ 'next-link' ].code ) {
		//		if ( activeLinkIndex === allLinkElements.length - 1 ) {
		//			newLinkIndex = 0;  // .length not supported for htmlcollection in all browsers?
		//		} else {
		//			newLinkIndex = activeLinkIndex + 1;
		//		}
		//	}
		//}

console.log(newLinkIndex);
		if ( null !== newLinkIndex ) {
			const newLink = allLinkElements[ newLinkIndex ].getElementsByTagName( 'a' )[0].href;
console.log(newLink);
			this.setState( { activeLink: newLink } );
		}
	}

	/**
	 * Open the active link
	 */
	static openActiveLink() {
		const activeLinkElements = document.getElementById( 'qni-search-results' ).getElementsByClassName( 'qni-active' );

		if ( undefined === activeLinkElements || activeLinkElements.length < 1 ) {
			return;
		}

		const activeLinkElement = activeLinkElements[0].getElementsByTagName( 'a' )[0];

		activeLinkElement.click();
		//app.closeInterface(); why needed to do this? maybe because if clicking on # links? test. what's an exmaple? "skip to main content"`
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

		//console.log( 'first render' );
		//if ( query ) {
		//	if ( ! activeLink && results.length > 0 ) {
		//		// todo ! active link need to be "active link is in the results". OR, we need to clear activelink when query is cleared, which seems better. trying below
		//		this.setState( { activeLink: results[ 0 ].url } ); // this is ugly because triggers unnecessary re-render, but how to avoid it ?
		//	}
		//} else {
		//	this.setState( { activeLink: '' } ); // this is also ugly because also triggers unnecessary re-render?  // todo causes infinite loop
		//}
		//console.log( 'another render' );

		// maybe create functionaly component for individual links, w/ prop to show whether they're active or not

		// modal window shifts positions as this list grows/shrinks, which sucks
		// use CSS to set a fixed height maybe, or maybe just a fixed position

		return (
			<ul id="qni-search-results">
				{ results.map( ( link, index ) => {
					const isDefaultLink = index === 0 && ( ! query || ! activeLink );

					return (
						<Result
							link={ link }
							active={ link.url === activeLink || isDefaultLink }
						/>
					);


					{/* ^ applies the correct css class, but it doesn't setState( activeLink ), so fatal when trying to up/down
					// maybe this is a smell, because changing the query should change the activeLink state, not just the visual stuff
					the internal state should always be accurate

					maybe should be calculating results when `query` changes, before render() gets called, and set the activelink state at that time
					is that a valid use case for getDerivedStateFromProps? not sure, see if any of the alternatives will work first
					if they won't, then maybe it's ok to use that
						try componentdidupdate - but that doesn't setstate, so would still have to do that. is that ok?
						memoization helper - not trying to cache anything, but maybe there are other uses?
						reset state when prop changes -yeah, sounds like thsi might be it. fully controlled or fully unctrolled w/ key - explore those
							fully cont - move state up to parent, and pass in results as a prop
								would have to make parent calculate results in order to do this? if so that feels kinda bad too since this could encapsulate that logic
							uncont w/ key - pass in defaultActiveLink prop and use that to set initial state - that wouldn't help for cases when moving up/down after set and then cleared and then reset the query
								er, maybe that'd work, but parent would have to know what the results are, so it'd be pulling that functionality higher instead of encapsulating it, which feels bad too
					*/}
				} ) }
			</ul>
		);
	}
}

export default SearchResults;
