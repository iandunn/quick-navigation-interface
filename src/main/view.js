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
import IncompatibleBrowserNotice from '../incompatible-browser-notice';
// todo align next commit

/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function MainView( props ) {
	const {
		activeResultIndex, browserMeetsRequirements, handleModalClose, handleNewQuery, handleQueryKeyDown,
		interfaceOpen, results, searchQuery, shortcuts,
	} = props;
	// todo reformat next commit

	const title = browserMeetsRequirements
		? __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' )
		: __( 'Incompatible Browser',                          'quick-navigation-interface' )
	;

	if ( ! interfaceOpen ) {
		return null;
	}

	return (
		<Fragment>
			<Modal
				title={ title }
				onRequestClose={ handleModalClose }

				// Focusing on close button creates scrollbars -- https://github.com/WordPress/gutenberg/issues/15434.
				// Down key broken after hitting escape --  https://github.com/WordPress/gutenberg/issues/15429.
				isDismissable={ true }

				// Without this, the modal would get the focus, preventing the TextControl.autofocus from working.
				focusOnMount={ false }
			>
				{ ! browserMeetsRequirements &&
					<IncompatibleBrowserNotice />
				}

				{ browserMeetsRequirements &&
					<Fragment>
						<TextControl
							/*
							 * We should grab the label ID programmatically, but I'm not sure that's possible. This should
							 * always work in practice, though, unless there's another modal on the page. If that happens,
							 * we have bigger problems :)
							 */
							aria-labelledby="components-modal-header-0"

							/*
							 * Autofocus is appropriate in this situation.
							 * See https://ux.stackexchange.com/a/60027/13828.
							 */
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus="true"
							placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
							value={ searchQuery }
							onChange={ handleNewQuery }
							onKeyDown={ handleQueryKeyDown }
						/>

						<Instructions shortcuts={ shortcuts } />

						<SearchResults
							activeResultIndex={ activeResultIndex }
							results={ results }
						/>
					</Fragment>
				}
			</Modal>

			{ results.hasOwnProperty( activeResultIndex ) &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
			}
		</Fragment>
	);
}

export default MainView;
