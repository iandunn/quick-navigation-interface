/**
 * WordPress dependencies
 */
const { render, Component, createElement, Fragment } = wp.element;
const { __ }                                         = wp.i18n;

/**
 * Internal dependencies
 */
//import * as organizers from './organizers/';

class QuickNavigationInterface extends Component {
	
	render() {
		const { shortcuts } = this.props;

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
						{
							__(
								`Use the <code>${ shortcuts.previousLink.label }</code> and <code>${ shortcuts.nextLink.label }</code> keys to navigate,
 								and press <code>${ shortcuts.openLink.label }</code> to open a link.`,
								'quick-navigation-interface'
							)
						}
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

const shortcuts = {
	previousLink : { label: 'up' },
	nextLink     : { label: 'down' },
	openLink     : { label: 'enter' },
};

render(
	createElement( QuickNavigationInterface, { shortcuts } ),
	document.getElementById( 'qni-container' )
);
