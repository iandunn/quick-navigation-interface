/**
 * WordPress dependencies
 */
const { Modal } = wp.components;
const { __ }    = wp.i18n;

/**
 * Render the view for an error message.
 *
 * @param {Array} props
 *
 * @return {Element}
 */
function ErrorView( props ) {
	const {
		handleModalClose, error,
		title = __( 'Error', 'quick-navigation-interface' ),
	} = props;

	return (
		<Modal
			className="qni-error"
			title={ title }
			onRequestClose={ handleModalClose }
			isDismissable={ true }
		>
			{ error }
		</Modal>
	);
}

export default ErrorView;
