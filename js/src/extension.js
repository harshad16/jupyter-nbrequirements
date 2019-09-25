/**
 * Jupyter NBRequirements.
 *
 * This file contains the javascript that is run when the notebook is loaded.
 * It contains some requirejs configuration and the `load_ipython_extension`
 * which is required for any notebook extension.
 *
 * @link   https://github.com/CermakM/jupyter-nbrequirements#readme
 * @file   This file loads the Jupyter magic extension for managing notebook requirements.
 * @author Marek Cermak <macermak@redhat.com>
 * @since  0.0.1
 */

 // Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
__webpack_public_path__ = document.querySelector('body').getAttribute('data-base-url') + 'nbextensions/jupyter-nbrequirements/';

// Load the extension
if (window.require) {
    window.require.config({
        map: {
            "*" : {
                "nbrequirements": "nbextensions/jupyter-nbrequirements/index"
            }
        }
    });
    window.require(['nbrequirements'], () => console.log("Loaded extension: jupyter-nbrequirements"))
}

// Export the required load_ipython_extension
module.exports = {
    load_ipython_extension: function() {}
};