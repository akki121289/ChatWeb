var Hapi = require('hapi'),
    Good = require('good'),
    mongoose   = require('mongoose'),
    routes = require('./routes'),
    onlineUsers = {},
    userWithNames = {};

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


var options = {
    storeBlank: true,
    cookieOptions: {
        password: 'password',
        isSecure: false
    }
};

server.register({
    register: require('yar'),
    options: options
}, function (err) { });


// view handler
server.views({
    engines: {
        jade: require('jade')
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
    /*//when recieving the data from the server, push the same message to client.
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
    });*/
    socket.on("user join",function(name){
            socket.userId = name.userId;
            onlineUsers[name.userId] = socket;
            userWithNames[name.userId] = name.username;
            
            socket.emit("online user", userWithNames);
            socket.broadcast.emit('online user',userWithNames);
    });
    socket.on('message',function(data){
        socket.emit('new message',data);
        socket.broadcast.emit('new message',data);
    });
    socket.on('disconnect',function(){
        delete onlineUsers[socket.userId];
        delete userWithNames[socket.userId];
        socket.emit("online user", userWithNames);
        socket.broadcast.emit('online user',userWithNames);
    });
});

server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});