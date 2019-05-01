/**
 * WordPress dependencies
 */
const { Modal, TextControl } = wp.components;
const { Component, RawHTML } = wp.element;
const { __, sprintf }        = wp.i18n;

/**
 * Internal dependencies
 */
import SearchResults from '../search-results/';

// go through old code line by line to make sure didn't miss anything that should be implemented here

class QuickNavigationInterface extends Component {
	constructor( props ) {
		super( props );

        this.state = {
	        activeResultIndex : '',
	        //interfaceOpen  : false,
	        interfaceOpen     : true, // temp for convenience while develop
	        results           : [],
	        searchQuery       : '',
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

	//
	handleKeyboardEvents( event ) {
		const { shortcuts } = this.props;
		const { which }     = event;

		switch( which ) {
			case shortcuts['open-interface'].code:
				this.openInterface( event );
				break;

			case shortcuts['previous-link'].code:
			case shortcuts['next-link'].code:
				this.setActiveResult( event );
				break;

			case shortcuts['open-link'].code:
				this.openActiveLink();
				break;
		}
	}

	/**
	 * Reveal the interface when the user presses the shortcut.
	 *
	 * The Modal component handles closing itself via `Escape` and clicking on the `x` icon, so we only need
	 * to handle opening the Modal.
	 *
	 * @param {object} event
	 */
	openInterface( event ) {
		const { interfaceOpen } = this.state;
		const { target }        = event;

		// should use KeyboardShortcuts here instead? feels a bit odd, like overcomplicating things b/c of unnecessary abstraction
			// also only listens to self and children, so can't use for this purpose?
			// maybe use mousetrap directly though, since it's already available? maybe adds to page load unnecessarily though, if not already loaded

		if ( interfaceOpen ) {
			return;
		}

		// todo this conflicts with gutenberg, which uses ctrl+` to navigate
		// is it enough to just return if ctrl (or any other modifier) is active? how do you tell that?
			// need to use keycodes b/c modifier different on diff platforms

		// Prevent the open shortcut from being used in input fields
		const isInput = 'input' === target.tagName.toLowerCase() && target.type === 'text';

		if ( isInput || 'textarea' === target.tagName.toLowerCase() || target.contentEditable === 'true' ) {
			return;
		}

		this.setState( { interfaceOpen : true } );
	}
	// maybe fix https://github.com/iandunn/quick-navigation-interface/issues/1 now too, by changing key
	// primary is now `g` or something else instead of `\`` ? still keep that one as backup though?
		// if in input field, then modifier-g
			// cmg-g conflicts with search in firefox
			// https://docs.google.com/spreadsheets/d/1nK1frKawxV7aboWOJbbslbIqBGoLY7gqKvfwqENj2yE/edit#gid=0

	// search web to see what common ones are, also
		// `/` for search might also fit, but could conflict w/ jetpack/core search in future
		// https://www.hanselman.com/blog/TheWebIsTheNewTerminalAreYouUsingTheWebsKeyboardShortcutsAndHotkeys.aspx
		// look for more

	//
	handleNewQuery( newQuery ) {
		const { links } = this.props;
		let newResults  = [];

		/*
		 * This only finds the _first_ X matches before the limit is reached, rather than the _best_ X matches,
		 * but in this context they can just keep typing to further narrow the results, so that's probably good
		 * enough for now.
		 */
		if ( newQuery ) {
			for ( const link of links ) {
				if ( link.title.toLowerCase().indexOf( newQuery.toLowerCase() ) >= 0 ) {
					newResults.push( link );
				}

				if ( newResults.length > this.props['search-results-limit'] ) {
					break;
				}
			}
		}

		this.setState( {
			activeResultIndex : newResults.length ? 0 : null,   // maybe only set to 0 when going from '' to something, and from something to '', but not when refining existing? probably have to make sure that value isn't greater than length though if do that
			searchQuery       : newQuery,
			results           : newResults,
		} );
	}

	//
	setActiveResult( event ) {
		const { shortcuts }                  = this.props;
		const { activeResultIndex, results } = this.state;
		const { which }                      = event;
		let newLinkIndex                     = null;

		// Don't move the input field's caret to home/end.
		//event.preventDefault(); // todo isn't working

		if ( which === shortcuts['next-link'].code ) {
			newLinkIndex = activeResultIndex + 1;

			if ( results.length === newLinkIndex ) {
				newLinkIndex = 0;
			}
		} else {
			newLinkIndex = activeResultIndex - 1;

			if ( -1 === newLinkIndex ) {
				newLinkIndex = results.length - 1;
			}
		}

		if ( null !== newLinkIndex ) {
			this.setState( { activeResultIndex: newLinkIndex } );
		}
	}

	/**
	 * Open the active link
	 */
	openActiveLink() {
		const { activeResultIndex } = this.state;

		if ( null === activeResultIndex ) {
			return;
		}

		const activeResultElements = document.getElementById( 'qni-search-results' ).getElementsByTagName( 'li' );

		//if ( undefined === activeResultElements || activeResultElements.length < 1 ) {
		//	return;
		//}
console.log( activeResultIndex );
console.log(activeResultElements);
		const activeResultElement = activeResultElements[ activeResultIndex ].getElementsByTagName( 'a' )[0];

		activeResultElement.click();


		//const{ activeResultIndex, results } = this.state;
		//
		//window.open( results[ activeResultIndex ].url );
		// ^ glocked by popup

		//app.closeInterface(); why needed to do this? maybe because if clicking on # links? test. what's an exmaple? "skip to main content"`
	}

	render() {
		const { activeResultIndex, interfaceOpen, results, searchQuery } = this.state;
		const { shortcuts }                                       = this.props;

		if ( ! interfaceOpen ) {
			return null;
		}

		return (
			<Modal
				title={ __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' ) }
				onRequestClose={ () => this.setState( { interfaceOpen: false } ) }
				contentLabel="what should this be?"
				isDismissable={ true }

				focusOnMount={ false }  // might not be needed
			>
				{/* use Modal component - can get rid of close dialog code then? but have to update state when modal closes? maybe change how setting it up
				 maybe just need to pass in prop
				 add aria attributes?

				 hovering on close button creates scroll bars
				 */}

				<TextControl
					//label={ __( 'Search:', 'quick-navigation-interface' ) }
					// ^ this is pretty cluttered. maybe use aria-labelled-by={ modal title } instead?
					placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
					value={ searchQuery }
					onChange={ newQuery => this.handleNewQuery( newQuery ) }

					autoFocus="true"
					// ugh not working again ^
				/>
					{/* need aria labels to go with using ^ ?

					maybe use withFocusReturn so that, when modal closes, focus returns to previously focused element
					*/}

				<p id="qni-instructions">
					{/* the old version didn't show these all the time? see when/why and maybe bring that back here. maybe only show when input field empty or something */}
					<RawHTML>
						{/*
						  *
						  * TODO THIS IS NOT SAFE!
						  * need to find a better way. maybe dompurify?
						  * https://github.com/WordPress/gutenberg/issues/13156
						  * related: https://github.com/WordPress/wordcamp.org/issues/101#issuecomment-487409620
						  *
						  */}
						{ sprintf(
							__( 'Use <code>%1$s</code> and <code>%2$s</code> to navigate links, <code>%3$s</code> to open one, and <code>%4$s</code> to quit.', 'quick-navigation-interface' ),
							shortcuts['previous-link'].label,
							shortcuts['next-link'].label,
							shortcuts['open-link'].label,
							shortcuts['close-interface'].label,
						) }
					</RawHTML>
				</p>

				<SearchResults
					activeResultIndex={ activeResultIndex }
					results={ results }
				/>
				{/* shortcuts is kind of global options, so feels a bit weird to pass it down like this instead of it being globally available. maybe think about Context API, but yuck */}
			</Modal>
		);
	}
}

export default QuickNavigationInterface;
