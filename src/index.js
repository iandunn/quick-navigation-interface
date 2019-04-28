/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './quick-navigation-interface/';

// todo create container inside #wpwrap, prob don't' need to fetch getelementbyid then since will have reference to it?

render(
	createElement( QuickNavigationInterface, { ...qniOptions } ),
	document.getElementById( 'qni-container' )
);
