/**
 * WordPress dependencies
 */
const { Modal, Spinner } = wp.components;
const { __ }             = wp.i18n;

/**
 * Render the view to show we're waiting on a network request.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function LoadingView( props ) {
	const { handleModalClose } = props;

	return (
		<Modal
			className="qni-loading"
			title={ __( 'Loading...', 'quick-navigation-interface' ) }
			onRequestClose={ handleModalClose }
			isDismissable={ true }
		>
			<Spinner />
		</Modal>
	);
}

export default LoadingView;
