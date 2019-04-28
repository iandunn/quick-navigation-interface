/**
 * WordPress dependencies
 */
const { Component, Fragment, RawHTML } = wp.element;
const { __, sprintf }                  = wp.i18n;
// const { isKeyboardEvent }              = wp.keycodes;

/**
 * Internal dependencies
 */
//import Dialog from './dialog/';

class QuickNavigationInterface extends Component {
	constructor( props ) {
		super( props );

        this.state = {
			interfaceOpen : false,
			// searchQuery   : '',
        };

        this.toggleInterface = this.toggleInterface.bind( this );
	}

	componentDidMount() {
		window.addEventListener( "keyup", this.toggleInterface );
	}

	componentWillUnmount() {
		window.removeEventListener( "keyup", this.toggleInterface );
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

		// todo huh it's not working anymore
		debugger;

		if ( interfaceOpen ) {
			if ( 'keyup' === type && which === shortcuts['close-interface'].code ) {
				this.setState( { interfaceOpen : false } );
			}

			// else if ( 'click' === event.type ) {
			// 	if ( 'notification-dialog-background' === event.target.className || 'button-link media-modal-close' === event.target.className ) {
			// 		this.setState( { interfaceOpen : false } );
			// 	}
			// }
			// ^ will be done on the button onClick handler i think
			// if delete all this, then maybe dont' use nested if conditins above, just all one line
		} else {
			if ( 'keyup' === type && which === shortcuts['open-interface'].code ) {
				// todo this conflicts with gutenberg, which uses ctrl+` to navigate
				// is it enough to just return if ctrl (or any other modifier) is active? how do you tell that?
					// need to use keycodes b/c modifier different on diff platforms

				// Prevent the open shortcut from being used in input fields
				const isInput = 'input' === target.tagName.toLowerCase() && target.type === 'text';

				if ( isInput || 'textarea' === target.tagName.toLowerCase() || target.contentEditable === 'true' ) {
					console.log('early');
					return;
				}

				this.setState( { interfaceOpen : true } );
			}
		}
	}

	render() {
		const { shortcuts }     = this.props;
		const { interfaceOpen } = this.state;

		// todo break into smaller components
		// reuse existing G componenents wherever possible - dialog? buttons, input fields, lists, etc
		// change design to match gutenberg

		if ( ! interfaceOpen ) {
			return null;
		}

		return (
			<Fragment>
				<div className="notification-dialog-background"></div>

				<div id="qni-dialog" className="notification-dialog">
					<button
						type="button"
						className="button-link media-modal-close"
						onClick={ this.setState( { interfaceOpen: false } ) }
					>
						<span className="media-modal-icon">
							<span className="screen-reader-text">
								{ __( 'Close Quick Navigation Interface', 'quick-navigation-interface' ) }
							</span>
						</span>
					</button>

					<h3 id="qni-introduction">
						{ __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' ) }
					</h3>

					<input
						id="qni-search-field"
						name=""
						type="text"
						placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
					/>

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
								__( 'Use the <code>%1$s</code> and <code>%2$s</code> keys to navigate, and press <code>%3$s</code> to open a link.', 'quick-navigation-interface' ),
								shortcuts['previous-link'].label,
								shortcuts['next-link'].label,
								shortcuts['open-link'].label
							) }
						</RawHTML>
					</p>

					<ul id="qni-search-results">
						<li>
							<a href="foo">
								Parent &rarr;
								Title
							</a>
						</li>
					</ul>
				</div>
			</Fragment>
		);
	}
}

export default QuickNavigationInterface;
