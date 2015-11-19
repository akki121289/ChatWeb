var Hapi = require('hapi'),
    Good = require('good'),
    mongoose   = require('mongoose'),
    routes = require('./routes'),
    users = {};

mongoose.connect('mongodb://localhost/chatweb');

var server = new Hapi.Server();
server.connection({ port: 3000});
var io = require('socket.io')(server.listener);
// plugins register
server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }
});
// view handler
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views'
});

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



routes(server);

io.sockets.on('connection', function (socket) {
    //when recieving the data from the server, push the same message to client.
    socket.on("clientMsg", function (data) {
        //send the data to the current client requested/sent.
        var msgData = data.msg.trim();
        var index = msgData.indexOf(' ');
        if(index !== -1){
            var name = msgData.substr(0,index);
            var msg = msgData.substr(index+1);
            users[name].emit('serverMsg',{"name":socket.nickname, "msg":msg});
        }else{
            socket.emit("serverMsg", data);
            //send the data to all the clients who are acessing the same site(localhost)
            socket.broadcast.emit("serverMsg", data);
        }
    });

    socket.on("sender", function (data) {
        socket.emit("sender", data);
        socket.broadcast.emit("sender", data);
    });
    socket.on("user join",function(name){
        socket.nickname = name.name;
        users[name.name] = socket;
        console.log(Object.keys(users));
    });
});

server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});