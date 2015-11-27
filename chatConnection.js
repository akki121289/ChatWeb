var SocketIO = require('socket.io'),
	Message = require('./models/message'),
	PersonalMessage =require('./models/personalMessage'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    onlineUsers = {}, // onlineUsers object contains all the connected socket with the key userId(e.i. niteshpsit) it should be unique
    userWithNames = {}, // userWithNames object contains all the user name connected with the socket with userId (e.i. niteshpsit)
    io;
// function for update the status of message send or not
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

// single function handle all the chat connection
function chatHandler(socket){
	socket.emit('on join',userWithNames);
    socket.broadcast.emit('on join',userWithNames);
    socket.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.on("user join",function(name){

            socket['uniqueId'] = name._id;
            onlineUsers[name._id] = socket;
            userWithNames[name._id] = name.username;
            socket.emit("online user", name);
            socket.broadcast.emit('online user',name);
            socket.emit('online user numbers',(Object.keys(userWithNames)).length);
            socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    
    });
    Message.find({}).sort('-createdAt').limit(10).exec(function(err, data){
        socket.emit('load messages',data);
    });
    
    socket.on('message',function(data){
        var obj = {msg:data.msg,username:userWithNames[socket.uniqueId]};
        var message = new Message(obj);
        message.save(function(err){
            if (err) {
                console.log('message not save in db');
            } else {
                socket.emit('new message',obj);
                socket.broadcast.emit('new message',obj);
            }
        });
    });
    socket.on('personal message',function(data, callback){

        (new PersonalMessage({
            from: socket.uniqueId,
            to: data.friendId,
            message: data.msg,
            status: 'send'
        })).save(function(err){
            if(err) {
                callback(true ,null);
            }   
            else if (onlineUsers[data.friendId]) {
                    onlineUsers[data.friendId].emit('message from friend', {msg:data.msg, username:userWithNames[socket.uniqueId],  _id:socket.uniqueId}, function(){
                        updateMessageStatus(socket.uniqueId, data.friendId, 'deliver', function(err){
                            if(err) {
                                callback(false, 'send');
                            } else {
                                callback(false, 'deliver');
                            }
                        });
                    });
            } else {
                callback(false, 'send');
            }
        });
    });
    socket.on('tab open',function(data){
        updateMessageStatus(socket.uniqueId, data.friendId, 'deliver', function(err){
            if(err) {
                console.log(err);
                throw err;
            } else {
                PersonalMessage.find({$or: [{to:socket.uniqueId, from:data.friendId},{to:data.friendId, from:socket.uniqueId }]}).sort('-createdAt').limit(5).exec(function(err, messages){
                    socket.emit('old message',messages);
                });
            }   
        });
    });
    socket.on('read message',function(data){

        updateMessageStatus(socket.uniqueId, data.friendId, 'seen', function(err){
            if(err) {
                console.log(err);
            }else if (onlineUsers[data.friendId]) {
                onlineUsers[data.friendId].emit('seen all messages',{friendId:socket.uniqueId});
            }
        });
    
    });
    socket.on('disconnect',function(){
        delete onlineUsers[socket.uniqueId];
        delete userWithNames[socket.uniqueId];
        socket.emit("remove user",socket.uniqueId);
        socket.broadcast.emit('remove user',socket.uniqueId);
        socket.emit('online user numbers',(Object.keys(userWithNames)).length);
        socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    });
}

function init(listener){
	io = SocketIO(listener);
	io.sockets.on('connection', chatHandler)
}

module.exports = {
	init:init
}