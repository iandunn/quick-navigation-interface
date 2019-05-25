/**
 * WordPress dependencies
 */
const { Modal, TextControl, Spinner } = wp.components;
const { Fragment, RawHTML }           = wp.element;
const { __, sprintf }                 = wp.i18n;

/**
 * Internal dependencies
 */
import ActiveUrlPreview from '../active-url-preview';
import Instructions     from '../instructions';
import SearchResults    from '../search-results/';

/**
 * Render the view for the browser incompatibility notice.
 *
 * @return {Element}
 */
function BrowserIncompatible() {
	return (
		<Fragment>
			<p>
				{ __(
					"I'm sorry, but your browser doesn't support one of the technologies that this feature requires.",
					'quick-navigation-interface'
				) }
			</p>

			<p>
				<RawHTML>
					{ sprintf(
						/*
						 * SECURITY WARNING: This string is intentionally not internationalized.
						 * See Instructions component for details.
						 */
						'If you can, please <a href="%s">upgrade to a newer version</a>.',
						'https://browsehappy.com/'
					) }
				</RawHTML>
			</p>
		</Fragment>
	);
}

/**
 * Render the view for the error notice notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Error( props ) {
	const { error } = props;

	return (
		<Fragment>
			<p>
				{ __(
					"I'm sorry, but there was an unrecoverable error while trying to retrieve your site's content.",
					'quick-navigation-interface'
				) }
			</p>

			<p>
				<RawHTML>
					{ sprintf(
						/*
						 * SECURITY WARNING: This string is intentionally not internationalized.
						 * See Instructions component for details.
						 */
						'The exact error was: <code>%s</code>.',
						error
					) }
				</RawHTML>
			</p>
		</Fragment>
	);
}

/**
 * Render the view for the error notice notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Success( props ) {
	const { activeResultIndex, handleNewQuery, handleQueryKeyDown, results, searchQuery, shortcuts } = props;

	return (
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
	);
}

/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function MainView( props ) {
	const {
		activeResultIndex, browserCompatible, handleModalClose, handleNewQuery, handleQueryKeyDown, error,
		interfaceOpen, loading, results, searchQuery, shortcuts,
	} = props;

	let title,
	    focusOnMount = true,
	    modalClasses = [],
		success      = false;

	if ( ! interfaceOpen ) {
		return null;
	}

	if ( ! browserCompatible ) {
		title = __( 'Incompatible Browser', 'quick-navigation-interface' );
	} else if ( loading ) {
		modalClasses = [ 'qni-loading' ];
		title        = __( 'Loading...', 'quick-navigation-interface' );
	} else if ( error ) {
		title = __( 'Error', 'quick-navigation-interface' );
	} else {
		// Without this, the modal would get the focus, preventing the `TextControl.autofocus` from working.
		focusOnMount = false;
		success      = true;
		title        = __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' );
	}

	return (
		<Fragment>
			<Modal
				className={ modalClasses }
				title={ title }
				onRequestClose={ handleModalClose }
				focusOnMount={ focusOnMount }

				// Focusing on close button creates scrollbars -- https://github.com/WordPress/gutenberg/issues/15434.
				// Down key broken after hitting escape --  https://github.com/WordPress/gutenberg/issues/15429.
				isDismissable={ true }
			>
				{ ! browserCompatible && <BrowserIncompatible /> }

				{ loading && <Spinner /> }

				{ error && <Error error={ error } /> }

				{ success &&
					<Success
						activeResultIndex={ activeResultIndex }
						handleNewQuery={ handleNewQuery }
						handleQueryKeyDown={ handleQueryKeyDown }
						results={ results }
						searchQuery={ searchQuery }
						shortcuts={ shortcuts }
					/>
				}
			</Modal>

			{ results.hasOwnProperty( activeResultIndex ) &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
			}
		</Fragment>
	);
}

export default MainView;
