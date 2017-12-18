/**
 * A unified bundle for the application. Imports the three main app bundles so we can generate a single webpack bundle.
 * This is done because there have been strange bugs in production only where one of our bundles doesn't load correctly.
 */

import "./polyfills.browser";
import "./vendor.browser";
import "./main.browser";