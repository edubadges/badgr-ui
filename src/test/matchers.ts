/*
 * From https://github.com/juliemr/ng2-test-seed @e2c833b
 */

beforeEach(() => {
    jasmine.addMatchers({
        toContainText: function() {
            return {
                compare: function(actual, expectedText) {
                    var actualText = actual.textContent;
                    return {
                        pass: actualText.indexOf(expectedText) > -1,
                        get message() { return 'Expected ' + actualText + ' to contain ' + expectedText; }
                    };
                }
            };
        }
    });
});