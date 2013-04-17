var requirejs = require('requirejs');

var knockoutCombinatorsPath = process.env['KC_PATH'] || 'src/knockout-combinators'

requirejs.config({
    baseUrl: '.',
    nodeRequire: require,
    paths: {
        'knockout-combinators': knockoutCombinatorsPath
    }
});

/* 
   Only the use of `requirejs :: String -> Module` is synchronous, 
   which is necessary for mocha to work properly.

   Do not attempt to use `requirejs :: [String] -> ([Module] -> Module) -> ()`
*/
requirejs('spec/spec');
