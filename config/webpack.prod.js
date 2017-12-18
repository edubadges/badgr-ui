/**
 * @author: @AngularClass
 */

const webpack = require('webpack');
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
            path: helpers.root('dist')
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


// Override the entry to have a single bundle for production, to fix BS-1783
config.entry = {
    'unified': './src/unified.browser.ts',
    'themeSetup': './src/theming/theme-setup.ts'
};

module.exports = config;