/**
 * WordPress dependencies
 */
const { Modal, Spinner } = wp.components;
const { __ }             = wp.i18n;

/**
 * Render the view for the main interface.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function LoadingView( props ) {
	const { handleModalClose } = props;

	return (
		<Modal
			title={ __( 'Loading...', 'quick-navigation-interface' ) }
			onRequestClose={ handleModalClose }
			isDismissable={ true }
		>
			<Spinner />
		</Modal>
	);
}

export default LoadingView;
