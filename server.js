var Hapi = require('hapi'),
    Good = require('good'),
    mongoose   = require('mongoose'),
    routes = require('./routes'),
    Message = require('./models/message'),
    PersonalMessage =require('./models/personalMessage'),
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
function updateMessageStatus(to , from , newStatus, callback){
    PersonalMessage.update({to:to, from:from , $or :[{status:'send'},{status:'deliver'}]},{
            $set: { "status": newStatus }
        },function(err){
            if(err){
                callback(err);
            }
            else {
                callback(null);
            }
    });   
}
io.sockets.on('connection', function (socket) {
    socket.emit('on join',userWithNames);
    socket.broadcast.emit('on join',userWithNames);
    socket.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.on("user join",function(name){
            var userId = (name.userId).substr(0,(name.userId).indexOf('@'));
            socket.userId = userId;
            onlineUsers[userId] = socket;
            userWithNames[userId] = name.username;
            
            socket.emit("online user", name);
            socket.broadcast.emit('online user',name);
            socket.emit('online user numbers',(Object.keys(userWithNames)).length);
            socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    });
    Message.find({}).sort('-createdAt').limit(10).exec(function(err, data){
        socket.emit('load messages',data);
    });
    socket.on('message',function(data){
        var obj = {msg:data.msg,username:(userWithNames[socket.userId])};
        var message = new Message(obj);
        message.save(function(err){
            if (err) {
                console.log('message not save in db');
            };
        });
        socket.emit('new message',obj);
        socket.broadcast.emit('new message',obj);
    });
    socket.on('personal message',function(data, callback){
        
        (new PersonalMessage({
            from:socket.userId,
            to:data.friendId,
            message:data.msg,
            name:userWithNames[socket.userId],
            friend:userWithNames[data.friendId],
            status: 'send'
        })).save(function(err){
            if(err) {
                
                callback(true ,null);
            }
            else {
                console.log('============================1');
                if(onlineUsers[data.friendId]) {
                    console.log('============================2');
                    var obj = {msg:data.msg,username:userWithNames[socket.userId],userId:socket.userId};
                    onlineUsers[data.friendId].emit('message from friend', obj, function(){
                        console.log('============================3',obj);
                        updateMessageStatus(socket.userId, data.friendId, 'deliver', function(err){
                            console.log('============================4');
                            if(err) {
                                console.log('============================5');
                                
                                callback(false, 'send');
                            } else {

                                callback(false, 'deliver');

                            }
                            
                        });
                    });
                } else {
                    console.log('============================6');
                    callback(false, 'send');
                }
            }
        });
    });
    socket.on('tab open',function(data){
        updateMessageStatus(socket.userId, data.friendId, 'deliver', function(err){
            if(err) {
                console.log(err);
                throw err;
            } else{
                PersonalMessage.find({$or: [{to:socket.userId, from:data.friendId},{to:data.friendId,from:socket.userId}]}).sort('-createdAt').limit(5).exec(function(err, messages){
                    socket.emit('old message',messages);
                });
            }   
        });
    });
    socket.on('read message',function(data){

        updateMessageStatus(socket.userId, data.friendId, 'seen', function(err){});
    
    });
    socket.on('disconnect',function(){
        delete onlineUsers[socket.userId];
        delete userWithNames[socket.userId];
        socket.emit("remove user", socket.userId);
        socket.broadcast.emit('remove user',socket.userId);
        socket.emit('online user numbers',(Object.keys(userWithNames)).length);
        socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    });
});

server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});