/**
 * WordPress dependencies
 */
import { Component, createContext } from '@wordpress/element';
import { UP, DOWN }                 from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { MainView } from './view';

/*
 * How this app uses composition and Context:
 *
 * Composition and Context are common ways to avoid prop drilling. Often times people argue for one or the other
 * as an exclusive solution, but a more nuanced view is that both should be understood and used. They serve
 * different use cases, rather than being mutually exclusive. Composition should be used in some cases, and
 * Context in others.
 *
 * In this app, what seems to work best is using composition for components that are lower in the tree, and
 * Context for ones that are higher. The lower-level components -- e.g., `ActiveUrlPreview` and `SearchResults`
 * -- tend to be more generic and reusable, and it makes sense to pass their data in as props, so that they can
 * remain unaware of the global state. Composition also makes sense to have specialized versions of generic
 * components, like with `Warning` and `FetchErrorWarning`.
 *
 * Composition _doesn't_ make sense for something like `Loaded`, though. It _could_ be pulled up into `MainView`
 * in order to avoid an extra level in the hierarchy, but that would result in `MainView` being very cluttered
 * and doing too many things. `Loaded` should be encapsulated to increase readability and maintainability.
 *
 * Since `MainView` and `Loaded` are both "controller views" -- stitching together generic components like `Modal`
 * and `SearchResults` -- and high in the tree, it makes sense for them to use Context, since they're not likely
 * to be reused, and are inherently more aware of the app's "business logic" than the lower-level components.
 *
 * This avoids prop drilling while keeping the higher-level components simple, and the lower-level components
 * reusable.
 *
 * @see https://www.youtube.com/watch?v=3XaXKiXtNjw&lc=Ugzndub90f7kTvwD9dR4AaABAg
 */
export const MainViewContext = createContext();


/**
 * Manage the state for the main interface.
 */
export class MainController extends Component {
	/**
	 * Initialize the component.
	 *
	 * @param {Array} props
	 */
	constructor( props ) {
		super( props );

		/*
		 * It may be incorrect for `results` and possibly `activeResultIndex` to be state, since `results` can be
		 * derived from `props.links` and `state.searchQuery`, but I tried that and it turned into a huge mess, so
		 * I'm choosing to follow the "do whatever is less awkward" guideline.
		 *
		 * https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state
		 * https://github.com/reduxjs/redux/issues/1287#issuecomment-175351978 (written in another context, but
		 * still applicable here)
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
		};

		// todo use experimental syntax for this to avoid these calls - is there a wp-scripts issue to support that?
		this.handleKeyboardEvents         = this.handleKeyboardEvents.bind( this );
		this.proxyPreviewerKeyboardEvents = this.proxyPreviewerKeyboardEvents.bind( this );
		this.closeInterface               = this.closeInterface.bind( this );
		this.handleNewQuery               = this.handleNewQuery.bind( this );
		MainController.handleQueryKeyDown = MainController.handleQueryKeyDown.bind( this );
	}

	/**
	 * Initialization that can't be done until the component is mounted.
	 */
	componentDidMount() {
		/*
		 * This (and its counterpart in `componentWillUnmount`) need to listen on `window` instead of just within
		 * this component in order to catch the g/backtick and open the interface. If it weren't for that, we could
		 * use the KeyboardShortcuts component to do all this. Since we're already doing it for the g/backtick,
		 * though, it's simpler to just use this to catch the other keys too.
		 *
		 * There might be some benefit to using Mousetrap (a dependency of KeyboardShortcuts) directly, but this
		 * is simple enough that it doesn't seem worth looking into.
		 *
		 * `keydown` is potentially better here, to allow for holding down up/down keys, but also has some
		 * side-effects, like how pressing the g/backtick opens the interface and then adds a g/backtick character to
		 * the text input field.
		 *
		 * See https://stackoverflow.com/questions/3396754/onkeypress-vs-onkeyup-and-onkeydown for more
		 * considerations.
		 */
		window.addEventListener( 'keyup', this.handleKeyboardEvents );

		// Handle events inside the Customizer's preview pane.
		if ( wp.customize ) {
			wp.customize.bind( 'ready', () => {
				wp.customize.previewer.bind( 'ready', this.proxyPreviewerKeyboardEvents );
			} );
		}
	}

	/**
	 * Listen for keyboard events inside the Customizer's Preview pane, and send them to the normal handler.
	 *
	 * The preview is loaded inside an iframe, so normally the parent frame isn't aware of anything happening
	 * inside it, and we aren't able to open the interface in response to the `g` / backtick keys. We can
	 * send `postMessage`s back and forth between the frames though.
	 *
	 * `wp.customize.Messenger()` makes that a bit easier, and takes care of the security considerations.
	 *
	 * See `print_customizer_preview_scripts()` for the corresponding sender.
	 */
	proxyPreviewerKeyboardEvents() {
		const iframe = document.getElementById( 'customize-preview' ).getElementsByTagName( 'iframe' )[0];

		const messenger = new wp.customize.Messenger( {
			channel      : 'quick-navigation-interface',
			targetWindow : iframe.contentWindow,
			url          : wp.customize.settings.url.allowed[ 0 ],
		} );

		messenger.bind( 'qni-previewer-keyup', event => {
			this.handleKeyboardEvents( event );
		} );
	}

	/**
	 * Clean up things before the component is unmounted.
	 */
	componentWillUnmount() {
		// See notes in corresponding `addEventListener() call`.
		window.removeEventListener( 'keyup', this.handleKeyboardEvents );

		if ( wp.customize ) {
			wp.customize.previewer.unbind( 'ready', this.proxyPreviewerKeyboardEvents );
		}
	}

	/**
	 * Catch key presses and pass them to the appropriate handler.
	 *
	 * @param {Object} event
	 */
	handleKeyboardEvents( event ) {
		const { interfaceOpen }    = this.state;
		const { shortcuts }        = this.props;
		const openInterfaceCode    = shortcuts[ 'open-interface' ].code;
		const openInterfaceAltCode = shortcuts[ 'open-interface-alternate' ].code;

		/*
		 * This property is deprecated, but `event.key` is still not a viable alternative, because IE11 and Edge18
		 * don't consistently implement the standard.
		 *
		 * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/which.
		 * See https://stackoverflow.com/a/43418287/450127.
		 * See https://caniuse.com/#feat=keyboardevent-key.
		 *
		 * Changing to `event.key` will require mapping the `keyCode`s provided by the `qni_options` filter to
		 * their corresponding `code` values, or breaking back-compat.
		 *
		 * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode.
		 */
		const { which } = event;

		// Ignore events when the interface is closed, except to open the interface.
		if ( ! interfaceOpen && which !== openInterfaceCode && which !== openInterfaceAltCode ) {
			return;
		}

		switch ( which ) {
			case openInterfaceCode:
			case openInterfaceAltCode:
				this.openInterface( event );
				break;

			case shortcuts[ 'next-link' ].code:
			case shortcuts[ 'previous-link' ].code:
				const direction = shortcuts[ 'next-link' ].code === which ? 'next' : 'previous';
				this.setActiveResult( direction );
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

		const textInputTypes = [
			'text', 'color', 'date', 'datetime', 'datetime-local', 'email', 'month',
			'number', 'password', 'search', 'tel', 'time', 'url', 'week',
		];

		// Gutenberg uses `control+backtick` to navigate through the editor, so ignore those events (and similar cases).
		if ( interfaceOpen || usingModifier ) {
			return;
		}

		// Prevent the open shortcut from being used in input fields.
		const isInput = 'input' === target.tagName.toLowerCase() && -1 !== textInputTypes.indexOf( target.type );

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
		// This property is deprecated, but the alternatives are not yet viable. See `handleKeyboardEvents()`.
		const { keyCode } = event;

		/*
		 * The keycodes are hardcoded here, instead of using `props.shortcuts`, because this specifically needs to
		 * prevent browser's default behavior for `up` and `down`, but `props.shortcuts` could be changed by the
		 * user to other keys.
		 */
		if ( keyCode === UP || keyCode === DOWN ) {
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

		return results;
	}

	/**
	 * Change the active result when the user navigates through the list.
	 *
	 * @param {string} direction
	 */
	setActiveResult( direction ) {
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
		const activeResult = document.getElementById( 'qni-search-results' ).querySelector( '.qni-search-results__item.is-active a' );

		if ( 'object' === typeof activeResult ) {
			activeResult.click();

			// Without this, anchor links like "skip to main content" wouldn't close the interface.
			this.closeInterface();
		}
	}

	/**
	 * Render the component.
	 *
	 * @return {Element}
	 */
	render() {
		const MainViewData = {
			// Props
			canFetchContentIndex : this.props.canFetchContentIndex,
			fetchError           : this.props.fetchError,
			loading              : this.props.loading,
			shortcuts            : this.props.shortcuts,

			// State
			activeResultIndex : this.state.activeResultIndex,
			interfaceOpen     : this.state.interfaceOpen,
			results           : this.state.results,
			searchQuery       : this.state.searchQuery,

			// Handlers
			handleNewQuery     : this.handleNewQuery,
			handleQueryKeyDown : MainController.handleQueryKeyDown,
			handleModalClose   : this.closeInterface,
		};

		return (
			<MainViewContext.Provider value={ MainViewData }>
				<MainView />
			</MainViewContext.Provider>
		);
	}
}
