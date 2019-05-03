/**
 * WordPress dependencies
 */
const { Modal, TextControl }  = wp.components;
const { Component, Fragment } = wp.element;
const { __ }                  = wp.i18n;

/**
 * Internal dependencies
 */
import ActiveUrlPreview from '../active-url-preview';
import Instructions     from '../instructions';
import SearchResults    from '../search-results/';

class QuickNavigationInterface extends Component {
	constructor( props ) {
		super( props );

		/*
		 * It may be incorrect for `results` and possibly `activeResultIndex` to be state, since `results` can be
		 * derived from `props.links` and `state.searchQuery`, but I tried that and it turned into a huge mess, so
		 * I'm choosing to follow the "do whatever is less awkward" guideline.
		 *
		 * https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state
		 * https://github.com/reduxjs/redux/issues/1287#issuecomment-175351978 (stated in another context, but still applicable here)
		 *
		 * Somewhat related, this may be a situation where a state management API would be beneficial, but it still
		 * feels like overkill for a small app like this. Redux is awful, though, so if I did set that up then I'd
		 * probably want to use Context or maybe even MobX.
		 */
		this.state = {
			activeResultIndex : null,
			//interfaceOpen     : false,
			results           : [],
			//searchQuery       : '',

			// temp for convenience while develop
			interfaceOpen : true,
			//results       : this.getFilteredLinks( 'plug' ),  // breaks up/down nav for some reason
			searchQuery   : 'plug',
		};

		this.handleKeyboardEvents = this.handleKeyboardEvents.bind( this );
	}

	componentDidMount() {
		/*
		 * This (and its counterpart in `componentWillUnmount`) need to listen on `window` instead of just within
		 * this component in order to catch the backtick and open the interface. If it weren't for that, we could
		 * use the KeyboardShortcuts component to do all this. Since we're already doing it for the backtick,
		 * though, it's simpler to just use this to catch the other keys too.
		 *
		 * There might be some benefit to using Mousetrap (a dependency of KeyboardShortcuts) directly, but this
		 * is simple enough that it doesn't seem worth looking into.
		 */
		window.addEventListener( 'keyup', this.handleKeyboardEvents );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keyup', this.handleKeyboardEvents );
	}

	/**
	 * Catch key presses and pass them to the appropriate handler.
	 *
	 * @param {Object} event
	 */
	handleKeyboardEvents( event ) {
		const { shortcuts } = this.props;
		const { which }     = event;

		switch ( which ) {
			case shortcuts[ 'open-interface' ].code:
				this.openInterface( event );
				break;

			case shortcuts[ 'next-link' ].code:
			case shortcuts[ 'previous-link' ].code:
				const direction = shortcuts[ 'next-link' ].code === which ? 'next' : 'previous';
				this.setActiveResult( event, direction );
				break;

			case shortcuts[ 'open-link' ].code:
				this.openActiveResult();
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
		const { interfaceOpen }                              = this.state;
		const { altKey, ctrlKey, metaKey, shiftKey, target } = event;
		const usingModifier                                  = altKey || ctrlKey || metaKey || shiftKey;

		// Gutenberg uses `control+backtick` to navigate through the editor, so ignore those events (and similar cases).
		if ( interfaceOpen || usingModifier ) {
			return;
		}

		// Prevent the open shortcut from being used in input fields
		const isInput = 'input' === target.tagName.toLowerCase() && target.type === 'text';

		if ( isInput || 'textarea' === target.tagName.toLowerCase() || target.contentEditable === 'true' ) {
			return;
		}

		this.setState( { interfaceOpen : true } );
	}

	/**
	 * Respond to changes in the search query.
	 *
	 * @param {string} newQuery
	 */
	handleNewQuery( newQuery ) {
		const newResults = this.getFilteredLinks( newQuery );

		this.setState( {
			activeResultIndex : newResults.length ? 0 : null,
			searchQuery       : newQuery,
			results           : newResults,
		} );
	}

	/**
	 * Get the links that match the given search query.
	 *
	 * This only finds the _first_ X matches before the limit is reached, rather than the _best_ X matches,
	 * but in this context they can just keep typing to further narrow the results, so that's probably good
	 * enough for now.
	 *
	 * @param {string} query
	 *
	 * @return {Array}
	 */
	getFilteredLinks( query ) {
		const { links } = this.props;
		const results   = [];

		if ( ! query ) {
			return results;
		}

		for ( const link of links ) {
			if ( link.title.toLowerCase().indexOf( query.toLowerCase() ) >= 0 ) {
				results.push( link );
			}

			if ( results.length > this.props[ 'search-results-limit' ] ) {
				break;
			}
		}

		// todo 6 results showing up for "p", instead of 4
		// also contains duplicates

		// todo memoize this function to avoid performance issues?
		// or not needed because never called with the same thing twice in succession?
		// maybe it is during unintended re-renders? see comment in render() about reducing/removing those

		return results;
	}

	/**
	 * Change the active result when the user navigates through the list.
	 *
	 * @param {object} event
	 * @param {string} direction
	 */
	setActiveResult( event, direction ) {
		const { activeResultIndex, results } = this.state;
		let newResultIndex                   = null;

		// Don't move the input field's caret to home/end.
		event.preventDefault();
		// todo isn't working. maybe because it's a OS action rather than a browser action?
		// try https://stackoverflow.com/a/1081114/450127, then search for more "javascript prevent up down keys from moving cursor on input text field"

		if ( 'next' === direction ) {
			newResultIndex = activeResultIndex + 1;

			if ( results.length === newResultIndex ) {
				newResultIndex = 0;
			}
		} else {
			newResultIndex = activeResultIndex - 1;

			if ( -1 === newResultIndex ) {
				newResultIndex = results.length - 1;
			}
		}

		if ( null !== newResultIndex ) {
			this.setState( { activeResultIndex: newResultIndex } );
		}
	}

	/**
	 * Open the active result.
	 *
	 * It feels like a smell to be accessing the DOM directly here, but `window.open( results[ activeResultIndex ].url )`
	 * would be blocked by the browser's popup blocker, even though it's the result of direct user action. Maybe there's
	 * a way around that?
	 */
	openActiveResult() {
		const activeResult = document.querySelector( '#qni-search-results' ).querySelector( 'li.qni-active-result a' );

		if ( 'object' === typeof activeResult ) {
			activeResult.click();

			// Anchor links like "skip to main content" wouldn't close the interface otherwise.
			this.setState( { interfaceOpen : false } );
		}
	}

	render() {
		// add console.log to all the renders and test things out, so you can get a better udnerstanding of when components are re-rendered
		// specifically, want to make sure that they're not getting rerendered unnecessarily
		// i think react tries to minimize that as much as it can, but there may be situations where you can do it it manually via componentShouldUpdate or something
		// or using some memoizaition HoC to declare which prop/state changes should trigger a re-render
		// do web search to learn more

		const { activeResultIndex, interfaceOpen, results, searchQuery } = this.state;
		const { shortcuts }                                              = this.props;

		if ( ! interfaceOpen ) {
			return null;
		}

		return (
			<Fragment>
				<Modal
					title={ __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' ) }
					onRequestClose={ () => this.setState( { interfaceOpen: false } ) }
					contentLabel="what should this be?"
					isDismissable={ true }

					focusOnMount={ false }  // might not be needed
				>
					{ /*
					 add aria attributes?

					 hovering on close button creates scroll bars
					 */ }

					<TextControl
						//label={ __( 'Search:', 'quick-navigation-interface' ) }
						// ^ this is pretty cluttered. maybe use aria-labelled-by={ modal title } instead?
						placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
						value={ searchQuery }
						onChange={ newQuery => this.handleNewQuery( newQuery ) }

						autoFocus="true"
						// ugh not working again ^
						// maybe just because of initial state opening interface and refreshing? try under normal user conditions
						// or maybe it's because dev console is open? test with it closed

						// "The autoFocus prop should not be used, as it can reduce usability and accessibility for users" -- jsx-a11y/no-autofocus
						// https://w3c.github.io/html/sec-forms.html#autofocusing-a-form-control-the-autofocus-attribute
						// sounds like a11y tools should just ignore it then, right? rather than nobody being able to use it

						//need aria labels to go with using ^ ?

						// maybe use withFocusReturn so that, when modal closes, focus returns to previously focused element
					/>

					<Instructions shortcuts={ shortcuts } />

					<SearchResults
						activeResultIndex={ activeResultIndex }
						results={ results }
					/>
				</Modal>

				{ null !== activeResultIndex &&
					<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
				}
				{ /*
				// todo instead of this, programatically do link.hover() so the browser's default preview shows instead
				// probably not possible https://stackoverflow.com/questions/55962496/programmatically-trigger-browsers-link-url-preview
				// if not, style this so that it's absolutely positioned in bottom left corner similar to chrome/ff native
				// probably have to create new element at root so can position abs relative to the window instead of parent
				*/ }
			</Fragment>
		);
	}
}

export default QuickNavigationInterface;
