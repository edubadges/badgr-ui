const helpers = require('./helpers');

module.exports = function(config) {
  var commonConfig = require('./karma-common.conf.js');
  var testWebpackConfig = require('./webpack.test.js');

  /**
   * Instruments JS files with Istanbul for subsequent code coverage reporting.
   * Instrument only testing sources.
   *
   * See: https://github.com/deepsweet/istanbul-instrumenter-loader
   */
  testWebpackConfig.module.rules.push(
    {
      test: /\.(js|ts)$/,
      loader: 'istanbul-instrumenter-loader',
      include: helpers.root('src'),
      enforce: "post",
      exclude: [
        /\.(e2e|spec)\.ts$/,
        /node_modules/
      ],
      query: {
          esModules: true
      }
    }
  );

  commonConfig(config, testWebpackConfig);

  config.set({
    /*
     * preprocess matching files before serving them to the browser
     * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

    reporters: [ 'mocha', 'junit', 'coverage-istanbul' ],

    coverageIstanbulReporter: {
      dir : 'test-report/coverage/',
      fixWebpackSourcePaths: true,
      reports: ['text-summary', 'json', 'html']
    },

    junitReporter: {
      outputDir: 'test-report/',
      outputFile: 'test-results.xml',
      useBrowserName: false
    },

    /*
     * level of logging
     * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    /*
     * start these browsers
     * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: [
      'PhantomJS'
    ],

    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  });

};
