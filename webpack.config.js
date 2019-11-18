/**
 * External dependencies
 */
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );


module.exports = {
	...defaultConfig,

	plugins : [
		...defaultConfig.plugins,
		new MiniCssExtractPlugin( {
			filename : 'quick-navigation-interface.min.css',
		} ),
	],

	/*
	 * Compile SCSS to vanilla CSS.
	 *
	 * @todo Remove this when https://github.com/WordPress/gutenberg/issues/14801 is resolved.
	 */
	module : {
		...defaultConfig.module,

		rules : [
			...defaultConfig.module.rules,
			{
				test    : /\.(sc|sa|c)ss$/,
				exclude : [ /node_modules/ ],
				use     : [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ],
			},
		],
	},

	/*
	 * Override the default filename.
	 *
	 * @todo Can this be done via CLI param instead? If not open an issue for that and add URL here.
	 * or maybe rename index.js to quick-navigation-interface.js for better semantics? and then could remove this section?
	 */
	output : {
		...defaultConfig.output,
		filename : 'quick-navigation-interface.min.js',
	},
};
