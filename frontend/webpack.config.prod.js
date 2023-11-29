/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// shared config (dev and prod)
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Critters = require('critters-webpack-plugin');

dotenv.config();

const cssLoader = 'css-loader';
const sassLoader = 'sass-loader';
const styleLoader = 'style-loader';

const plugins = [
	new HtmlWebpackPlugin({
		template: 'src/index.html.ejs',
		INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
		SEGMENT_ID: process.env.SEGMENT_ID,
		CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID,
	}),
	new CompressionPlugin({
		exclude: /.map$/,
	}),
	new CopyPlugin({
		patterns: [{ from: resolve(__dirname, 'public/'), to: '.' }],
	}),
	new webpack.ProvidePlugin({
		process: 'process/browser',
	}),
	new webpack.DefinePlugin({
		'process.env': JSON.stringify({
			FRONTEND_API_ENDPOINT: process.env.FRONTEND_API_ENDPOINT,
			INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
			SEGMENT_ID: process.env.SEGMENT_ID,
			CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID,
		}),
	}),
	//new MiniCssExtractPlugin(),
	new Critters({
		preload: 'swap',
		// Base path location of the CSS files
		path: resolve(__dirname, './build/profiler/css'),
		// Public path of the CSS resources. This prefix is removed from the href
		publicPath: resolve(__dirname, './public/css'),
		fonts: true,
	}),
];

if (process.env.BUNDLE_ANALYSER === 'true') {
	plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server' }));
}

const config = {
	mode: 'production',
	entry: resolve(__dirname, './src/index.tsx'),
	output: {
		path: resolve(__dirname, './build/profiler'),
		publicPath: '/profiler/',
		filename: '[name].[contenthash].js',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		plugins: [new TsconfigPathsPlugin({})],
		fallback: { 'process/browser': require.resolve('process/browser') },
	},
	cache: {
		type: 'filesystem',
		allowCollectingMemory: true,
		cacheDirectory: resolve(__dirname, '.temp_cache'),
		buildDependencies: {
			// This makes all dependencies of this file - build dependencies
			config: [__filename],
			// By default webpack and loaders are build dependencies
		},
	},

	module: {
		rules: [
			{
				test: [/\.jsx?$/, /\.tsx?$/],
				use: ['babel-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.md$/,
				use: 'raw-loader',
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: cssLoader,
						options: {
							modules: true,
						},
					},
				],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					styleLoader,
					// Translates CSS into CommonJS
					cssLoader,
					// Compiles Sass to CSS
					sassLoader,
				],
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [
					'file-loader?hash=sha512&digest=hex&name=img/[chunkhash].[ext]',
					'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
				],
			},
			{
				test: /\.(ttf|eot|woff|woff2)$/,
				use: ['file-loader'],
			},
			{
				test: /\.less$/i,
				use: [
					{
						loader: styleLoader,
					},
					{
						loader: cssLoader,
						options: {
							modules: true,
						},
					},
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								javascriptEnabled: true,
							},
						},
					},
				],
			},
		],
	},
	plugins,
    performance: {
        hints: false,
    },
    optimization: {
        minimize: false,
    },
};

module.exports = config;
