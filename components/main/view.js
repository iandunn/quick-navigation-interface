/**
 * WordPress dependencies
 */
import { Modal, TextControl, Spinner }   from '@wordpress/components';
import { Fragment, RawHTML, useContext } from '@wordpress/element';
import { __, sprintf }                   from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MainViewContext }  from './controller';
import { ActiveUrlPreview } from '../active-url-preview';
import { Instructions }     from '../instructions';
import { SearchResults }    from '../search-results/';
import './style.scss';


/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
export function MainView( props ) {
	const {
		activeResultIndex, handleModalClose, interfaceOpen, loading, results,
	} = useContext( MainViewContext );

	let title,
		focusOnMount = true;

	const modalClasses = [ 'qni-main' ];

	if ( ! interfaceOpen ) {
		return null;
	}

	if ( loading ) {
		title   = __( 'Loading...', 'quick-navigation-interface' );

		modalClasses.push( 'is-loading' );

	} else {
		// Without this, the modal would get the focus, preventing the `TextControl.autofocus` from working.
		focusOnMount = false;
		title        = __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' );
	}


	// Why is instructions a separate file but Success/warning/loading isn't? They don't have any logic in them. Maybe look at "thinking in react" for advice
	//
	// What's balance between creating separate file for every little thing, and
	//
	// Decompose something if it has subcomponents, if it will be reused, if it's subjectively long or complex
	// maybe create separate files (but not folders) for some of those things? not sure
	//
	// maybe warnings should be moved to a separate file?

	return (
		<Fragment>
			<Modal
				className={ modalClasses }
				title={ title }
				onRequestClose={ handleModalClose }
				focusOnMount={ focusOnMount }

				// Focusing on close button creates scrollbars - see https://github.com/WordPress/gutenberg/issues/15434.
				// Down key broken after hitting escape        - see https://github.com/WordPress/gutenberg/issues/15429.
				isDismissable={ true }
			>
				{ loading && <Spinner /> }

				{ ! loading && <Loaded /> }
			</Modal>

			{ results.hasOwnProperty( activeResultIndex ) &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
			}
		</Fragment>
	);
}

/**
 * Render the view for the when the interface has been loaded.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Loaded( props ) {
	const {
		activeResultIndex, canFetchContentIndex, fetchError, handleNewQuery, handleQueryKeyDown,
		results, searchQuery, shortcuts,
	} = useContext( MainViewContext );

	return (
		<Fragment>
			{ /*
			   * This label is only needed for screen readers, because the `<Modal>`'s `h1#components-modal-header-{n}`
			   * title describes the search input for sighted users. `aria-labelledby` isn't used because that ID
			   * contains an instance ID, which is difficult (impossible?) to obtain from within this context,
			   * even using `compose() / withInstanceId()`. This is a much simpler solution.
			   */ }
			<label htmlFor="qni-main__search-query" className="screen-reader-text">
				{ __( 'Search:', 'quick-navigation-interface' ) }
			</label>

			<TextControl
				/*
				 * Autofocus is appropriate in this situation.
				 * See https://ux.stackexchange.com/a/60027/13828.
				 */
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ true }

				id="qni-main__search-query"
				placeholder={ __( 'e.g., Posts, Settings, Plugins, Comments, etc', 'quick-navigation-interface' ) }
				value={ searchQuery }
				onChange={ handleNewQuery }
				onKeyDown={ handleQueryKeyDown }
			/>

			{ searchQuery &&
				<Instructions shortcuts={ shortcuts } />
			}

			<SearchResults
				activeResultIndex={ activeResultIndex }
				results={ results }
			/>

			{ canFetchContentIndex || <CantFetchWarning /> }

			{ fetchError &&
				<FetchErrorWarning error={ fetchError } />
			}
		</Fragment>
	);
}

/**
 * Render the view for the warning notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Warning( { children } ) {
	return (
		<div className="notice notice-warning inline">
			{ children }
		</div>
	);
}

/**
 * Render a warning that the browser isn't capable of fetching the content index.
 *
 * @return {Element}
 */
function CantFetchWarning() {
	return (
		<Warning>
			<p>
				{ __(
					'Posts cannot be searched because your browser is too old; only links from the current page will be available.',
					'quick-navigation-interface'
				) }
			</p>

			<div>
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
			</div>
		</Warning>
	);
}

/**
 * Render a warning notice that there was an error fetching the content index.
 *
 * @return {Element}
 */
function FetchErrorWarning( { error } ) {
	return (
		<Warning>
			<p>
				{ __(
					'Posts cannot be searched because an error occured; only links from the current page will be available.',
					'quick-navigation-interface'
				) }
			</p>

			<div>
				<RawHTML>
					{ sprintf(
						/*
						 * SECURITY WARNING: This string is intentionally not internationalized.
						 * See Instructions component for details.
						 */
						'Details: <code>%s</code>',
						error
					) }
				</RawHTML>
			</div>
		</Warning>
	);
}
