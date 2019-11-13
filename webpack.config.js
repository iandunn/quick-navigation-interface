const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const defaultConfig        = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,

	/*
	 * Override the default filename.
	 *
	 * @todo Can this be done via CLI param instead? If not open an issue for that and add URL here.
     */
	output : {
		...defaultConfig.output,
		filename : 'quick-navigation-interface.min.js',
	},

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

	plugins : [
		...defaultConfig.plugins,
		new MiniCssExtractPlugin( {
			filename : 'quick-navigation-interface.min.css',
		} ),
	],
};
