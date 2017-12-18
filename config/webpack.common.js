/**
 * @author: @AngularClass
 */

const webpack = require('webpack');
const helpers = require('./helpers');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
var path = require('path');
/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const InlineChunkWebpackPlugin = require('html-webpack-inline-chunk-plugin');



/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */

function webpackCommonConfiguration(basePath, themes)
{
    var basePath = basePath || "./";
    if (basePath.substr(-1) != "/") {
        basePath += "/";
    }

    var themes = themes || [
        {
            scssName: "theme-default.scss",
            scssPath: basePath+"src/beakdown/scss/theme-default.scss",
            extractTextPlugin: new ExtractTextPlugin('theme-default.[hash].css')
        }
    ];

    return {
        /*
         * The entry point for the bundle
         * Our Angular.js app
         *
         * See: http://webpack.github.io/docs/configuration.html#entry
         */
        entry: {
            'themeSetup': basePath+'src/theming/theme-setup.ts',
            'polyfills': basePath+'src/polyfills.browser.ts',
            'vendor': basePath+'src/vendor.browser.ts',
            'main': basePath+'src/main.browser.ts'
        },

        /*
         * Options affecting the resolving of modules.
         *
         * See: http://webpack.github.io/docs/configuration.html#resolve
         */
        resolve: {

            /*
             * An array of extensions that should be used to resolve modules.
             *
             * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
             */
            extensions: ['.ts', '.js', '.json'],

            // remove other default values
            modules: [
                basePath+'src',
                "node_modules"
            ]

        },

        /*
         * Options affecting the normal modules.
         *
         * See: http://webpack.github.io/docs/configuration.html#module
         */
        module: {

            rules: [
                /* CSS Loader */
                {
                    test: /\.css$/,
                    //exclude: /node_modules/,
                    exclude: [
                        path.resolve(__dirname, "node_modules"),

                    ],
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: function () {
                                    return [
                                        require('autoprefixer')
                                    ];
                                }
                            }
                        }
                    ]
                },

                /*
                 * Json loader support for *.json files.
                 *
                 * See: https://github.com/webpack/json-loader
                 */
                {
                    test: /\.json$/,
                    use: ['json-loader']
                },


                /* Loader for html files
                 *
                 * See: https://github.com/ampedandwired/html-webpack-plugin
                 */
                {
                    test: /\.html$/,
                    use: [{
                        loader: "html-loader",
                        options: {
                            attrs: 'img:src source:srcset bg-formfield-image:placeholderImage img:loading-src img:error-src img:loaded-src link:href'
                        }
                    }],
                    exclude: [basePath+'src/index.html']
                },


                /* Image Loader
                 */
                {
                    test: /\.(jpe?g|png|gif|svg|ico)?(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                query: {
                                    name: 'assets/[name].[ext]'
                                }
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                query: {
                                    mozjpeg: {
                                        progressive: true
                                    },
                                    gifsicle: {
                                        interlaced: true
                                    },
                                    optipng: {
                                        optimizationLevel: 7
                                    }
                                }
                            }
                        }
                    ]
                },
                /*
                 * Csv Loading
                 */
                {
                    test: /\.csv$/,
                    use: [{
                        loader: "file-loader",
                        options: {"name": "assets/[name]-[hash].[ext]&text/csv"}
                    }]
                },
                /*
                 * Font Loading
                 */
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: "url-loader?",
                        options: {"limit": "10000&name=assets/[name]-[hash].[ext]&mimetype=application/font-woff"}
                    }]
                },
                {
                    test: /\.ttf?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: "url-loader?",
                        options: {"limit": "10000&name=assets/[name]-[hash].[ext]&mimetype=application/x-font-truetype"}
                    }]
                },
                {
                    test: /\.eot?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: "url-loader?",
                        options: {"limit": "10000&name=assets/[name]-[hash].[ext]&mimetype=application/vnd.ms-fontobject"}
                    }]
                }
            ]
            .concat(
                themes.map(function(theme){
                    return {
                        test: new RegExp(theme.scssName.replace(/([^\w\d])/g, "\\$1")),
                        loader: theme.extractTextPlugin.extract([
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 2
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: function () {
                                        return [
                                            require('autoprefixer')
                                        ];
                                    }
                                }
                            },
                            {
                                loader: "sass-loader",
                                options: {
                                    includePaths: [
                                        basePath+"src/breakdown/static/scss/"
                                    ]
                                }
                            }
                        ])
                    };
                })
            )
        },

        /*
         * Add additional plugins to the compiler.
         *
         * See: http://webpack.github.io/docs/configuration.html#plugins
         */
        plugins: [
            // metadata for build
            new webpack.DefinePlugin({
                'metadata': {
                    'title': JSON.stringify('Badgr'),
                    'baseUrl': JSON.stringify('/'),
                    'isDevServer': JSON.stringify(helpers.isWebpackDevServer())
                }
            }),

            /*
              * Plugin: CopyWebpackPlugin
              * Description: Copy files and directories in webpack.
              *
              * Copies project static assets.
              *
              * See: https://www.npmjs.com/package/copy-webpack-plugin
              */
            new CopyWebpackPlugin(
                [
                    {
                        from: basePath+'src/root-assets',
                        to: ''
                    },
                ]
            ),

            /*
             * Plugin: HtmlHeadConfigPlugin
             * Description: Generate html tags based on javascript maps.
             *
             * If a publicPath is set in the webpack output configuration, it will be automatically added to
             * href attributes, you can disable that by adding a "=href": false property.
             * You can also enable it to other attribute by settings "=attName": true.
             *
             * The configuration supplied is map between a location (key) and an element definition object (value)
             * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
             *
             * Example:
             *  Adding this plugin configuration
             *  new HtmlElementsPlugin({
             *    headTags: { ... }
             *  })
             *
             *  Means we can use it in the template like this:
             *  <%= webpackConfig.htmlElements.headTags %>
             *
             * Dependencies: HtmlWebpackPlugin
             */
            new HtmlElementsPlugin(
                {
                    headTags: require(path.resolve(__dirname, 'head-config.common'))
                }
            ),

            /**
             * Inline the themeSetup check so that we get css and loading images before having to load the main bundle.
             */
            new InlineChunkWebpackPlugin({
                inlineChunks: ['themeSetup']
            }),

            /**
             * Enable asset exclusion in the html-webpack-plugin to prevent it from loading the css, which will be loaded
             * by the theming code.
             */
            new HtmlWebpackExcludeAssetsPlugin(),

            new HtmlWebpackPlugin({
                filename: 'index.html',
                configImport: '<script src="config.js" type="text/javascript" charset="utf-8"></script>',
                template: basePath+'src/index.html',
                chunksSortMode: function(a, b) {
                    var order = ['themeSetup', 'polyfills', 'vendor', 'main', 'unified'];
                    return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
                },
                excludeAssets: /.*\.css/,
                inject: 'body'
            }),
        ]

        .concat(
             themes.map(function(theme) { return theme.extractTextPlugin })
        )

    }
};


module.exports = webpackCommonConfiguration;
