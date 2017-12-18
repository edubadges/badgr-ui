const helpers = require('./helpers');
const path = require('path');

module.exports = function(config) {
  var commonConfig = require('./karma-common.conf.js');
  var testWebpackConfig = require('./webpack.test.js');

  commonConfig(config, testWebpackConfig);

  config.set({
    /*
     * preprocess matching files before serving them to the browser
     * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: { './config/spec-bundle.js': ['webpack', 'sourcemap'] },

    reporters: [ 'mocha' ],

    /*
     * level of logging
     * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    /*
     * start these browsers
     * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: [
      'Chrome_with_debugging'
    ],

    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        chromeDataDir: "./.chrome_karma"
      }
    },

    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: false
  });

};
