var SocketIO = require('socket.io'),
	Message = require('./models/message'),
	PersonalMessage =require('./models/personalMessage'),
    GroupMessage =require('./models/groupMessages'),
    User =require('./models/users'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    onlineUsers = {}, // onlineUsers object contains all the connected socket object with unique id of user _id
    userWithNames = {}, // userWithNames object contains all connected user name with unique id of user _id
    io,
    fs = require('fs');

// function for update the status of message that can be 'send','deliver' or 'seen'
function updateMessageStatus(to , from , newStatus, callback){
    console.log(to);
    console.log(from);
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
    // update the list of onlie user to all connected user
	socket.emit('on join',userWithNames);
    socket.broadcast.emit('on join',userWithNames);
    // update the number of online user to all connected user 
    socket.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);

    
    

    socket.on("user join",function(name){
            // we are saving the use _id in the socket object
            socket['uniqueId'] = name._id;
            // we are saving the socket object in a object with the key _id of perticular user
            onlineUsers[name._id] = socket;
            // we are saving the all user name in the object with the key _id of perticular user
            userWithNames[name._id] = name.username;
            
            // for updating the list of online user when any user became online 
            socket.emit("online user", name);
            socket.broadcast.emit('online user',name);
            // for updating the number of online user to all connected user 
            socket.emit('online user numbers',(Object.keys(userWithNames)).length);
            socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
            
            socket.broadcast.emit('user appeared online',{username : name.username},false);
            // here we are showing groups created by user
            getGroups(name._id,socket); 
            //socket.emit('updateGroupChat', name.username,  'you have connected to room1');
            
    });
    // this is just for display all the old broadcasted messages when any user became online
    Message.find({}).sort('-createdAt').limit(10).exec(function(err, data){
        socket.emit('load messages',data);
    });
    // when any user broadcast any message
    socket.on('message',function(data){
        var obj = {msg:data.msg,username:userWithNames[socket.uniqueId]};
        var message = new Message(obj);
        message.save(function(err){
            if (err) {
                throw err;
            } else {
                socket.emit('new message',obj);
                socket.broadcast.emit('new message',obj);
            }
        });
    });

    socket.on('user upload',function(data,callback){
        var elementType = data.fileType.split('/');
        upload(data,socket,elementType[0],callback);
    });

    socket.on('user Group upload',function(data,callback){
        var elementType = data.fileType.split('/');
        uploadInGroup(data,socket,elementType[0],callback);
    });


    socket.on('user image',function(data,callback){
        upload(data,socket,'image',callback);
    });

    socket.on('user audio',function(data,callback){
        upload(data,socket,'audio',callback);
        
    });

    // socket.on('user video',function(data,callback){

    //     upload(data,socket,'video',callback);
        
    // });

    // one to one chat
    // when any friend send a message to other friend 
    socket.on('personal message',function(data, callback){
        // first we are save message
        console.log("data request on personal message socket======",data);
        (new PersonalMessage({
            from: socket.uniqueId,
            to: data.friendId,
            message: data.msg,
            status: 'send'
        })).save(function(err){
            if(err) {
                callback(true ,null);
            }   
            // here we checking the user is online  or offline
            else if (onlineUsers[data.friendId]) {
                    // here we are sending the message to friend
                    onlineUsers[data.friendId].emit('message from friend', {msg:data.msg, username:userWithNames[socket.uniqueId],  _id:socket.uniqueId}, function(){
                        // if the message send successfully then change the status
                        updateMessageStatus(socket.uniqueId, data.friendId, 'deliver', function(err){
                            if(err) {
                                // if the message send but not deliver to the friend yet
                                callback(false, 'send');
                            } else {
                                // if the message deliver but not seen by friend
                                callback(false, 'deliver');
                            }
                        });
                    });
            } else {
                // if the message not save in database the status should be send nut not deliver to the friend
                callback(false, 'send');
            }
        });
    });
    // when any person open the tab of the friend 
    socket.on('tab open',function(data){
        console.log(data);
        console.log("In tab open");
        // call the method to update the status of all messages as 'deliver'
        updateMessageStatus(socket.uniqueId, data.friendId, 'deliver', function(err){
            if(err) {
                console.log(err);
                throw err;
            } else {
                PersonalMessage.find({$or: [{to:socket.uniqueId, from:data.friendId},{to:data.friendId, from:socket.uniqueId }]}).sort('-createdAt').limit(5).exec(function(err, messages){
                    // To display the old messages of the friend
                    console.log("messages"+messages);
                    var obj = { messages : messages , uniqueId : data.friendId};
                    console.log("obj:"+obj);
                    socket.emit('old message',obj);
                });
            }   
        });
    });
    // call when any user read the friend's messages
    socket.on('read message',function(data){
        // call the method to update the status of all messages as 'seen'
        updateMessageStatus(socket.uniqueId, data.friendId, 'seen', function(err){
            if(err) {
                console.log(err);
            }else if (onlineUsers[data.friendId]) {
                // notificafy the friend that messages have been seen by friend
                onlineUsers[data.friendId].emit('seen all messages',{friendId:socket.uniqueId});
            }
        });
    
    });
    // automatically called when any user goes of offline 
    socket.on('disconnect',function(){
        // we are deleting the _id key of user when someone disconnected
        delete onlineUsers[socket.uniqueId];
        delete userWithNames[socket.uniqueId];
        // for updating the list of online user when any user get disconnected 
        socket.emit("remove user",socket.uniqueId);
        socket.broadcast.emit('remove user',socket.uniqueId);
        // for updating the number of online user to all connected user  when any user get disconnected
        socket.emit('online user numbers',(Object.keys(userWithNames)).length);
        socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    });

    //call when to send group messages
    socket.on('send Group Messages',function(data,callback){
        console.log("data request on group message socket======",data);
        (new GroupMessage({
            groupName : data.groupName,
            groupId : data.groupId,
            from : data.name,
            msg : data.msg
        })).save(function(err){
            if(err) {
                callback(true);
            }   
            else {
                socket.broadcast.to(data.groupId).emit('updateGroupChat', data);
                callback(false);
            }
        });
    })

    //call when old group messages are to be fetched
    socket.on('groupTab Open',function(data,callback){
        GroupMessage.find({"groupId" : data.groupId}).sort('-createAt').limit(5).exec(function(err, messages){
            // To display the old messages of the group        
            callback(messages);
        });
    });
}

function init(listener){
	io = SocketIO(listener);
	io.sockets.on('connection', chatHandler)
}

module.exports = {
	init:init
}

function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        return response;
    }


function upload(data,socket,type,callback)
{
    var dataReg = 'data:' +data.fileType+ ';base64,'; 
    var decodedBufferData = (data[type+'Data']).replace(dataReg, "");
    var path = __dirname + "/data/" + data.fileName;
    fs.writeFile(path, decodedBufferData,'base64', function (err) {
        if (err) {
            console.log('ERROR:: ' + err);
            throw err;
        } 

        var personMessageObj = {};
            personMessageObj.type = type;
            personMessageObj.from = socket.uniqueId;
            personMessageObj.to = data.friendId;
            personMessageObj[type] = '/data/' + data.fileName;
            personMessageObj.status = 'send';

        var personMessage = new PersonalMessage(personMessageObj);
        //  personMessage.save();
         personMessage.save(function(err){
            
            if(err) {
                callback(true,null);
            }   
            // here we checking the user is online  or offline
            else if (onlineUsers[data.friendId]) {
                    // here we are sending the message to friend
                    onlineUsers[data.friendId].emit( type +' from friend', {img:'/data/' + data.fileName, username:userWithNames[socket.uniqueId],  _id:socket.uniqueId}, function(){
                        // if the message send successfully then change the status
                        updateMessageStatus(socket.uniqueId, data.friendId, 'deliver', function(err){
                            if(err) {
                                // if the message send but not deliver to the friend yet
                                callback(false, {img:'/data/' + data.fileName, status :'send'});
                            } else {
                                // if the message deliver but not seen by friend
                                callback(false, {img:'/data/' + data.fileName, status :'deliver'});
                            }
                        });
                    });
            } else {
                // if the message not save in database the status should be send nut not deliver to the friend
                callback(false, {img:'/data/' + data.fileName, status :'send'});
            }
        });

    });
}

function uploadInGroup(data,socket,type,callback){
    var dataReg = 'data:' +data.fileType+ ';base64,'; 
    var decodedBufferData = (data[type+'Data']).replace(dataReg, "");
    var path = __dirname + "/data/" + data.fileName;
    fs.writeFile(path, decodedBufferData,'base64', function (err) {
        if (err) {
            console.log('ERROR:: ' + err);
            throw err;
        } 

        var groupMessageObj = {};
            groupMessageObj.type = type;
            groupMessageObj.from = data.from;
            groupMessageObj.groupId = data.groupId;
            groupMessageObj[type] = '/data/' + data.fileName;
            groupMessageObj.groupName = data.groupName;

        var groupMessage = new GroupMessage(groupMessageObj);
        groupMessage.save(function(err){
            
            if(err) {
                callback(true,{img:'/data/' + data.fileName});
            } 
            else {
                socket.broadcast.to(data.groupId).emit('group '+type+' from friend', groupMessage);
                callback(false,{img:'/data/' + data.fileName});
            }  
            
        });

    });
}

function getGroups(userId,socket){
    User.find({"_id" : userId},{ "username":1, "groups":1, "_id":0},function(err,data){
        socket.emit("groups available",data,function(groupIds,joiner){
            
            for(var key in groupIds){
                socket.join(key);
                socket.broadcast.to(key).emit('user appeared online', {groupname : groupIds[key],username : joiner },true);
            }
        });
    });
}
