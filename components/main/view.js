/**
 * WordPress dependencies
 */
import { Modal, TextControl, Spinner } from '@wordpress/components';
import { Fragment }                    from '@wordpress/element';
import { __ }                          from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ActiveUrlPreview } from '../active-url-preview';
import { Instructions }     from '../instructions';
import { SearchResults }    from '../search-results/';
import './style.scss';


/**
 * Render the view for the warning notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Warning( props ) {
	const { warning } = props;

	return (
		<div className="notice notice-warning inline">
			{ warning }
		</div>
	);
}

/**
 * Render the view for the Success notice.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function Loaded( props ) {
	const {
		activeResultIndex, handleNewQuery, handleQueryKeyDown, results, searchQuery, shortcuts, warning,
	} = props;

	return (
		<Fragment>
			<TextControl
				/*
				 * We should grab the label ID programmatically, but I'm not sure that's possible. This should
				 * always work in practice, though, unless there's another modal on the page. If that happens,
				 * we have bigger problems :)
				 *
				 * todo actually, can maybe use ${ instanceId } like `modal/index.js` in G does?
				 * yeah, see `compose( withInstanceId )( Card );` in Compassionate Comments
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

			{ searchQuery &&
				<Instructions shortcuts={ shortcuts } />
			}

			{ warning && <Warning warning={ warning } /> }

			<SearchResults
				activeResultIndex={ activeResultIndex }
				results={ results }
			/>
		</Fragment>
	);
}

// todo import { withInstanceId, compose } from '@wordpress/compose';
//const ComposedCard = compose( withInstanceId )( Card );
//export { ComposedCard as Card };


/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
export function MainView( props ) {
	const {
		activeResultIndex, handleModalClose, handleNewQuery, handleQueryKeyDown,
		interfaceOpen, loading, results, searchQuery, shortcuts, warning,
	} = props;

	let title,
		content,
		focusOnMount = true;

	const modalClasses = [ 'qni-main' ];

	if ( ! interfaceOpen ) {
		return null;
	}

	if ( loading ) {
		title   = __( 'Loading...', 'quick-navigation-interface' );
		content = <Spinner />;

		modalClasses.push( 'is-loading' );

	} else {
		// Without this, the modal would get the focus, preventing the `TextControl.autofocus` from working.
		focusOnMount = false;
		title        = __( 'Start typing to open any post, menu item, etc', 'quick-navigation-interface' );

		content = <Loaded
			activeResultIndex={ activeResultIndex }
			handleNewQuery={ handleNewQuery }
			handleQueryKeyDown={ handleQueryKeyDown }
			results={ results }
			searchQuery={ searchQuery }
			shortcuts={ shortcuts }
			warning={ warning }
		/>;
	}


	// Why is instructions a separate file but Success/warning/loading isn't? They don't have any logic in them. Maybe look at "thinking in react" for advice
	//
	// What's balance between creating separate file for every little thing, and
	//
	// Decompose something if it has subcomponents, if it will be reused, if it's subjectively long or complex
	// maybe create separate files (but not folders) for some of those things? not sure

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
				{ content }
			</Modal>

			{ results.hasOwnProperty( activeResultIndex ) &&
				<ActiveUrlPreview url={ results[ activeResultIndex ].url } />
			}
		</Fragment>
	);
}
