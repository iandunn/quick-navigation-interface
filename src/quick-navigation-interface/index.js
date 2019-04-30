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
			//interfaceOpen : false,
	        interfaceOpen : true, // temp for convenience while develop
			searchQuery   : '',
        };

		this.toggleInterface = this.toggleInterface.bind( this );
	}

	componentDidMount() {
		window.addEventListener( 'keyup', this.toggleInterface );
		// probably can't use KeyboardShortcuts for this, since want to monitor window, but maybe worth another look
	}

	componentWillUnmount() {
		window.removeEventListener( 'keyup', this.toggleInterface );
	}

	/**
	 * Reveal the interface when the user presses the shortcut
	 *
	 * @param {object} event
	 */
	toggleInterface( event ) {
		const { shortcuts }           = this.props;
		const { interfaceOpen }       = this.state;
		const { target, type, which } = event;

		// should use KeyboardShortcuts here instead? feels a bit odd, like overcomplicating things b/c of unnecessary abstraction
			// also only listens to self and children, so can't use for this purpose?
			// maybe use mousetrap directly though, since it's already available? maybe adds to page load unnecessarily though, if not already loaded

		/*
		 * The Modal component handles closing itself via `Escape` and clicking on the `x` icon, so we only need
		 * to handle opening the Modal.
		 */
		if ( interfaceOpen ) {
			return;
		}

		if ( 'keyup' === type && which === shortcuts['open-interface'].code ) {
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


	render() {
		const { interfaceOpen, searchQuery } = this.state;
		const { shortcuts, links        }    = this.props;

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
					onChange={ newQuery => this.setState( { searchQuery: newQuery } ) }

					autofocus // this isn't working. the component isn't passing it through to the final <input> because it's not safelisted?
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
							__( 'Use the <code>%1$s</code> and <code>%2$s</code> keys to navigate, and press <code>%3$s</code> to open a link. Press <code>%4$s</code> to close this interface.', 'quick-navigation-interface' ),
							shortcuts['previous-link'].label,
							shortcuts['next-link'].label,
							shortcuts['open-link'].label,
							shortcuts['close-interface'].label,
						) }
					</RawHTML>
				</p>

				<SearchResults
					links={ links }
					limit={ 4 }
					query={ searchQuery }
				/>
				{/* limit should be taken from qniOptions */}
			</Modal>
		);
	}
}

export default QuickNavigationInterface;
