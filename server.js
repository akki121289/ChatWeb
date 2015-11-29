var Hapi = require('hapi'),
    mongoose   = require('mongoose'),
    routes = require('./routes'),
    config = require('./config/development');
// mongodb connection
mongoose.connect(config.mongodbAddress);
// creating server
var server = new Hapi.Server();
// defining host and port
server.connection({ host: config.address, port: config.port });
// plugins register
// consoling activity
server.register(config.plugins.good, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }
});
// yar module for session handling
server.register(config.plugins.yar, function (err) {
    if (err)
        throw err;
});
// view handler
server.views(config.plugins.jade);
// serving static files
server.route({
    path: "/public/{path*}",
    method: "GET",
    handler: {
        directory: {
            path: "./public",
            listing: false,
            index: false
        }
    }
});
// defining routes
routes(server);
// socket connect
require('./chatConnection').init(server.listener);
server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});