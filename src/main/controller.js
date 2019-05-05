/**
 * WordPress dependencies
 */
const { Component } = wp.element;

/**
 * Internal dependencies
 */
import MainView from './view';

/**
 * Manage the state for the main interface.
 */
class MainController extends Component {
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
			interfaceOpen     : false,
			results           : [],
			searchQuery       : '',

			// temp for convenience while develop
			//interfaceOpen : true,
			//results       : this.getFilteredLinks( 'plug' ),  // breaks up/down nav for some reason
			//searchQuery   : 'opt',
		};

		this.handleKeyboardEvents         = this.handleKeyboardEvents.bind( this );
		this.closeInterface               = this.closeInterface.bind( this );
		this.handleNewQuery               = this.handleNewQuery.bind( this );
		MainController.handleQueryKeyDown = MainController.handleQueryKeyDown.bind( this );
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
		const { interfaceOpen } = this.state;
		const { shortcuts }     = this.props;
		const { which }         = event;

		// Ignore events when the interface is closed, except to open the interface.
		if ( ! interfaceOpen && which !== shortcuts[ 'open-interface' ].code ) {
			return;
		}

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
	 * Close the interface and reset state to the initial values.
	 *
	 * We could leave the query/results/etc alone and just hide the modal, but it seems like users will also want
	 * to reset the state in most use cases.
	 */
	closeInterface() {
		this.setState( {
			activeResultIndex : null,
			interfaceOpen     : false,
			results           : [],
			searchQuery       : '',
		} );
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
	 * Prevent link navigation from moving input field cursor.
	 *
	 * See https://stackoverflow.com/a/26082502/450127.
	 *
	 * @param {object} event
	 */
	static handleQueryKeyDown( event ) {
		const { keyCode } = event;

		// todo maybe use labels from wp.component.keycodes here, or from state.shortcuts
		// probably latter
		// er, maybe need to be hardcoded to these, b/c what happens if someone changes via filter?

		if ( keyCode === 38 || keyCode === 40 ) {
			event.preventDefault();
		}
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

			if ( results.length >= this.props[ 'search-results-limit' ] ) {
				break;
			}
		}

		// todo there's some situation where something a 5th item gets stuck in there again
		// it was "undo" not sure how to reproduce yet
		// ah, it's because they're exact duplicates, so the json.stringify produces the same hash
		// wanna remove duplicates anyway
		// might be easier/more efficient to do that in this function than w/ the list of 600

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

			// Without this, anchor links like "skip to main content" wouldn't close the interface.
			this.closeInterface();
		}
	}

	render() {
		const { activeResultIndex, interfaceOpen, results, searchQuery } = this.state;
		const { shortcuts }                                              = this.props;

		return (
			<MainView
				activeResultIndex={ activeResultIndex }
				handleNewQuery={ this.handleNewQuery }
				handleQueryKeyDown={ MainController.handleQueryKeyDown }
				handleModalClose={ this.closeInterface }
				interfaceOpen={ interfaceOpen }
				results={ results }
				searchQuery={ searchQuery }
				shortcuts={ shortcuts }
			/>
		);
	}
}

export default MainController;