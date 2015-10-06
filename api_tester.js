var argv = require('minimist')(process.argv.slice(2));
var event = {};
event[argv.param] = argv.paramValue;

var context = {
    fail: function(err) {

    },
    succeed: function(result) {

    }
}
require('./' + argv.endpoint + '/' + argv.endpoint + '.js').handler(event, context);