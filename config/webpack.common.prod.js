/**
 * @author: @AngularClass
 */

const webpack = require('webpack');
const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs

const webpackCommonConfiguration = require('./webpack.common.js');
var basePath = helpers.root("./");
const commonConfig = webpackCommonConfiguration(basePath);

/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const aotPlugin = require('@ngtools/webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge(
    commonConfig.metadata, {
        host: HOST,
        port: PORT,
        ENV: ENV,
        HMR: false
    }
);

function webpackProdConfiguration(basePath)
{
    var basePath = basePath || "./";
    if (basePath.substr(-1) != "/") {
        basePath += "/";
    }

    return {

            /**
             * Developer tool to enhance debugging
             *
             * See: http://webpack.github.io/docs/configuration.html#devtool
             * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
             */
            devtool: 'source-map',

            /**
             * Options affecting the output of the compilation.
             *
             * See: http://webpack.github.io/docs/configuration.html#output
             */
            output: {

                /**
                 * The output directory as absolute path (required).
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-path
                 */
                path: helpers.root('dist'),

                /**
                 * Specifies the name of each output file on disk.
                 * IMPORTANT: You must not specify an absolute path here!
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-filename
                 */
                filename: '[name].[chunkhash].bundle.js',

                /**
                 * The filename of the SourceMaps for the JavaScript files.
                 * They are inside the output.path directory.
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
                 */
                sourceMapFilename: '[file].[chunkhash].bundle.map',

                /**
                 * The filename of non-entry chunks as relative path
                 * inside the output.path directory.
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
                 */
                chunkFilename: '[id].[chunkhash].chunk.js'

            },

            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: [
                            '@ngtools/webpack'
                        ],
                        exclude: [/\.(spec|e2e)\.ts$/]
                    },
                ]
            },

            /**
             * Add additional plugins to the compiler.
             *
             * See: http://webpack.github.io/docs/configuration.html#plugins
             */
            plugins: [
                new aotPlugin.AotPlugin({
                    tsConfigPath: basePath+'tsconfig.json',
                    mainPath: basePath+"src/main.browser.ts"
                }),

                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    reportFilename: 'bundle-report.html',
                    statsFilename: 'bundle-stats.json',
                }),

                /**
                 * Plugin: WebpackMd5Hash
                 * Description: Plugin to replace a standard webpack chunkhash with md5.
                 *
                 * See: https://www.npmjs.com/package/webpack-md5-hash
                 */
                new WebpackMd5Hash(),

                /**
                 * Plugin: DefinePlugin
                 * Description: Define free variables.
                 * Useful for having development builds with debug logging or adding global constants.
                 *
                 * Environment helpers
                 *
                 * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
                 */
                // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
                new DefinePlugin(
                    {
                        'ENV': JSON.stringify(METADATA.ENV),
                        'HMR': METADATA.HMR,
                        'process.env': {
                            'ENV': JSON.stringify(METADATA.ENV),
                            'NODE_ENV': JSON.stringify(METADATA.ENV),
                            'HMR': METADATA.HMR
                        }
                    }
                ),

                /**
                 * Plugin: UglifyJsPlugin
                 * Description: Minimize all JavaScript output of chunks.
                 * Loaders are switched into minimizing mode.
                 *
                 * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
                 */
                // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
                new UglifyJsPlugin(
                    {
                        beautify: false,
                        comments: false,
                        mangle: {
                            screw_ie8: true,
                            keep_fnames: false,
                            dead_code: true,
                            booleans: true,
                            loops: true,
                            unused: true
                        },
                        compress: {
                            screw_ie8: true,
                            warnings: false
                        },
                    }
                ),

                /**
                 * Plugin: NormalModuleReplacementPlugin
                 * Description: Replace resources that matches resourceRegExp with newResource
                 *
                 * See: http://webpack.github.io/docs/list-of-plugins.html#normalmodulereplacementplugin
                 */

                new NormalModuleReplacementPlugin(
                    /angular2-hmr/,
                    basePath+'config/modules/angular2-hmr-prod.js'
                )

            ]
        }
}


module.exports = webpackProdConfiguration;