/**
 * WordPress dependencies
 */
const { Modal, TextControl } = wp.components;
const { Fragment }           = wp.element;
const { __ }                 = wp.i18n;

/**
 * Internal dependencies
 */
import ActiveUrlPreview from '../active-url-preview';
import Instructions     from '../instructions';
import SearchResults    from '../search-results/';

/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function MainView( props ) {
	const {
		activeResultIndex, handleModalClose, handleNewQuery, handleQueryKeyDown,
		interfaceOpen, results, searchQuery, shortcuts
	} = props;

	if ( ! interfaceOpen ) {
		return null;
	}

	return (
		<Fragment>
			<Modal
				title={ __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' ) }
				onRequestClose={ handleModalClose }
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
					onChange={ handleNewQuery }
					onKeyDown={ handleQueryKeyDown }

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

			{ results.hasOwnProperty( activeResultIndex ) &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
			}
		</Fragment>
	);
}

export default MainView;
