/**
 * @author: @AngularClass
 */

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const webpack = require('webpack');

const webpackCommonConfiguration = require('./webpack.common.js');
var basePath = helpers.root("./");
const commonConfig = webpackCommonConfiguration(basePath);

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(
    commonConfig.metadata, {
        host: 'localhost',
        port: 4000,
        ENV: ENV,
        HMR: HMR
    }
);

function webpackDevConfiguration(basePath)
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
        devtool: 'cheap-module-source-map',

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
                filename: '[name].bundle.js',

                /**
                 * The filename of the SourceMaps for the JavaScript files.
                 * They are inside the output.path directory.
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
                 */
                sourceMapFilename: '[file].map',

                /** The filename of non-entry chunks as relative path
                 * inside the output.path directory.
                 *
                 * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
                 */
                chunkFilename: '[id].chunk.js',

                library: 'ac_[name]',
                libraryTarget: 'var'
            },

        module: {
            rules: [
                /*
                 * Typescript and Angular Template Loading
                 */
                {
                    test: /\.ts$/,
                    use: [
                        'awesome-typescript-loader',
                        'angular2-template-loader',
                        'angular-router-loader'
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                }
            ]
        },

        plugins: [
            // Fix: WARNING in ./~/@angular/core/@angular/core.es5.js 3702:272-293 Critical dependency: the request of a dependency is an expression
            // https://github.com/AngularClass/angular2-webpack-starter/issues/993
            // This plugin is only used in dev because it breaks the AoT compilation: https://github.com/angular/angular-cli/issues/4431
            new webpack.ContextReplacementPlugin(
                /angular(\\|\/)core(\\|\/)@angular/,
                helpers.root('src'), // location of your src
                {
                    // your Angular Async Route paths relative to this root directory
                }
            ),

            new webpack.LoaderOptionsPlugin({
                options: {
                    metadata: METADATA
                }
            }),

            /**
             * Plugin: DefinePlugin
             * Description: Define free variables.
             * Useful for having development builds with debug logging or adding global constants.
             *
             * Environment helpers
             *
             * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
             */
            // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
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
            )
        ],

        /**
         * Webpack Development Server configuration
         * Description: The webpack-dev-server is a little node.js Express server.
         * The server emits information about the compilation state to the client,
         * which reacts to those events.
         *
         * See: https://webpack.github.io/docs/webpack-dev-server.html
         */
        devServer: {
            port: METADATA.port,
            host: METADATA.host,
            historyApiFallback: {
                // Work around https://github.com/webpack/webpack-dev-server/issues/454
                rewrites: [
                    {
                        from: /\./,
                        to: function () {
                            return '/';
                        }
                    }
                ]
            },
            disableHostCheck: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        }

    }
}

module.exports = webpackDevConfiguration;
