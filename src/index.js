/**
 * WordPress dependencies
 */
const { render, createElement } = wp.element;

/**
 * Internal dependencies
 */
import QuickNavigationInterface from './quick-navigation-interface/';

const shortcuts = {
	previousLink : { label : 'up'    },
	nextLink     : { label : 'down'  },
	openLink     : { label : 'enter' },
};

// create container inside #wpwrap, prob don't' need to fetch getelementbyid then since will have reference to it?

render(
	createElement(
		QuickNavigationInterface,
		{ shortcuts }
	),
	document.getElementById( 'qni-container' )
);
