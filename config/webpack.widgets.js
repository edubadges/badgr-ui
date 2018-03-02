/**
 * @author: wiggins@concentricsky.com
 */

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs

const webpackCommonConfiguration = require('./webpack.common.js');
const webpackProdConfiguration = require("./webpack.common.prod.js");
var basePath = helpers.root("./");

const commonConfig = webpackCommonConfiguration(basePath);
const prodConfig = webpackProdConfiguration(basePath);

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');

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

var config = webpackMerge(
    commonConfig, prodConfig, {
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

            filename: '[name].bundle.js'
        },

        /**
         * Add additional plugins to the compiler.
         *
         * See: http://webpack.github.io/docs/configuration.html#plugins
         */
        plugins: [
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
            )
        ]
    }
);


config.entry = {
    'widgets': './src/widgets.browser.ts'
};

module.exports = config;