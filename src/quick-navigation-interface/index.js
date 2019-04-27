/**
 * WordPress dependencies
 */
const { Component, Fragment, RawHTML } = wp.element;
const { __, sprintf }                  = wp.i18n;

/**
 * Internal dependencies
 */
//import Dialog from './dialog/';

class QuickNavigationInterface extends Component {
	constructor( props ) {
		super( props );

		try {
			//const mainContainer = $( '#qni-container' );
			//
			//$( window ).keyup( toggleInterface );
			//mainContainer.click( app.toggleInterface );

			// shouldn't be using jquery? maybe still need to?

			//app.searchField.keyup( app.showRelevantLinks );
		} catch ( exception ) {
			//app.log( exception );
		}
	}

	/**
	 * Reveal the interface when the user presses the shortcut
	 *
	 * @param {object} event
	 */
	//toggleInterface( event ) {
	//	try {
	//		if ( 'keyup' === event.type ) {
	//			if ( event.which === app.options.shortcuts['open-interface'].code ) {
	//				// todo this conflicts with gutenberg, which uses ctrl+` to navigate
	//					// is it enough to just return if ctrl (or any other modifier) is active? how do you tell that?
	//
	//				// Don't prevent the open shortcut from being used in input fields
	//					// should ^ include "dont"? don't you want it to be prevented? isn't that what's actually happening?
	//				if ( 'input' === event.target.tagName.toLowerCase() || 'textarea' === event.target.tagName.toLowerCase() ) {
	//					// maybe restrict ^ to input[type=text] ?
	//					return;
	//				}
	//
	//				app.openInterface();
	//			} else if ( event.which === app.options.shortcuts['close-interface'].code ) {
	//				app.closeInterface();
	//			}
	//		} else if ( 'click' === event.type ) {
	//			if ( 'notification-dialog-background' === event.target.className || 'button-link media-modal-close' === event.target.className ) {
	//				app.closeInterface();
	//			}
	//		}
	//	} catch( exception ) {
	//		app.log( exception );
	//	}
	//},

	render() {
		const { shortcuts } = this.props;

		// todo break into smaller components
		// reuse existing G componenents wherever possible - dialog? buttons, input fields, lists, etc
		// change design to match gutenberg

		return (
			<Fragment>
				<div className="notification-dialog-background"></div>

				<div id="qni-dialog" className="notification-dialog">
					<button type="button" className="button-link media-modal-close">
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
								shortcuts.previousLink.label,
								shortcuts.nextLink.label,
								shortcuts.openLink.label
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
