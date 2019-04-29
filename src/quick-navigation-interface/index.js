/**
 * WordPress dependencies
 */
const { Modal, TextControl }  = wp.components;
const { Component, RawHTML } = wp.element;
const { __, sprintf }        = wp.i18n;
// const { isKeyboardEvent }              = wp.keycodes;


/**
 * Internal dependencies
 */
//import Dialog from './dialog/';

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

	render() {
		const { interfaceOpen, searchQuery } = this.state;
		const { shortcuts }                  = this.props;

		// todo break into smaller components
		// reuse existing G componenents wherever possible - dialog? buttons, input fields, lists, etc
		// change design to match gutenberg


		//return (
		//	<Fragment>
		//		<Button isDefault onClick={ () => this.setState( { interfaceOpen: true } ) }>Open Modal</Button>
		//
		//		{ interfaceOpen && (
		//			<Modal
		//				title="This is my modal"
		//				onRequestClose={ () => this.setState( { interfaceOpen: false } ) }
		//			>
		//				<Button isDefault onClick={ () => this.setState( { interfaceOpen: false } ) }> My custom close button </Button>
		//			</Modal>
		//		) }
		//	</Fragment>
		//);

		if ( ! interfaceOpen ) {
			return null;
		}

		return (
			<Modal
				title={ __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' ) }
				onRequestClose={ () => this.setState( { interfaceOpen: false } ) }
				contentLabel="what should this be?"
				isDismissable={ true }
			>
				{/* use Modal component - can get rid of close dialog code then? but have to update state when modal closes? maybe change how setting it up
				 maybe just need to pass in prop
				 add aria attributes?
				 */}

				<TextControl
					//label={ __( 'Search:', 'quick-navigation-interface' ) }
					// this is pretty cluttered. maybe use aria-labelled-by={ modal title } instead?
					placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
					value={ searchQuery }
					onChange={ newQuery => this.setState( { searchQuery: newQuery } ) }
				/>
					{/* need aria labels to go with using ^ ? */}

				<p id="qni-instructions">
					<RawHTML>
						{/*
						  *
						  * TODO THIS IS NOT SAFE!
						  * need to find a better way. maybe dompurify?
						  * https://github.com/WordPress/gutenberg/issues/13156
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

				<ul id="qni-search-results">
					{/* maybe use a FormTokenField here instead of something custom? limit of 100 suggestions though so would need to extend that?
					that's similar, but definitely not hte same. maybe reuse some of the same things, though, like the way it stores and searches for data?
					*/}

					<li>
						<a href="foo">
							Parent &rarr;
							Title
						</a>
					</li>
				</ul>
			</Modal>
		);
	}
}



export default QuickNavigationInterface;
