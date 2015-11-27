var Hapi = require('hapi'),
    Good = require('good'),
    mongoose   = require('mongoose'),
    routes = require('./routes'),
    Message = require('./models/message'),
    PersonalChat = require('./models/personal-chat'),
    Users = require('./models/users'),
    onlineUsers = {},
    userWithNames = {},
    userCredentials = [];

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
    // socket.emit('on join',userWithNames);
    // socket.broadcast.emit('on join',userWithNames);

    socket.emit('on join',userCredentials);
    socket.broadcast.emit('on join',userCredentials);


    socket.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    socket.on("user join",function(name){
            var userId = (name.userId).substr(0,(name.userId).indexOf('@'));
            socket.userId = userId;
            socket.userEmail = name.userId ;
            onlineUsers[userId] = socket;
            userWithNames[userId] = name.username;

            var elementExist = 0;
            userCredentials.forEach(function(ele){
                if(ele.email == name.email)
                    elementExist = 1;
            });
            
            if(!elementExist){
                var objCredentials = {};
                objCredentials.username = name.username ;
                objCredentials.email = name.email ;
                objCredentials.key = userId ;    
                userCredentials.push(objCredentials); 
            }
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
    socket.on('personal message',function(data){
        var user_email = onlineUsers[socket.userId]['userEmail'] ;
        Users.find({ email : user_email }).exec(function(err,finddata){ 
            if( finddata[0].personalChatUsers != undefined && finddata[0].personalChatUsers.length > 0)
            {   
                var personalChatUsers = finddata[0].personalChatUsers;
                
                var personalChatExist = 1;   
                personalChatUsers.forEach(function(ele){
                    if(data.email == ele.email)
                    {   
                        personalChatExist = 0;
                        PersonalChat.update(
                        { _id : ele.personalChatRelId },
                        {$push: {"messages": { msg: data.msg , to : ele.name , from : userWithNames[socket.userId] }}},
                            function(err, model) {
                                console.log(err);
                            }
                        );                        
                    }
                });

                if(personalChatExist)
                {   
                    Users.find({ email : data.email }).exec(function(err,frienddata){
                        relatedIds = [{name : finddata[0].username, userId : finddata[0]._id ,email : finddata[0].email},{name : frienddata[0].username, userId : frienddata[0]._id, email : frienddata[0].email}]
                        var chatObj = {messages:{ msg: data.msg , to : finddata[0].username , from : userWithNames[socket.userId] },relatedIds:relatedIds};
                        personalChat = new PersonalChat(chatObj);   
                        personalChat.save(function(err,savedata){
                            if(err)
                            {
                                console.log('message not save in db');
                            }
                            var userList = savedata.relatedIds; 
                        
                           Users.update({ _id : userList[0].userId },
                           {$push : { "personalChatUsers" : { name : userList[1].name , personalChatRelId : savedata._id,userId : userList[1].userId, email : userList[1].email }} } ,function(err,dt){
                            if(err)
                                console.log("there is something wrong err");
                           });

                           Users.update({ _id : userList[1].userId },
                           {$push : { personalChatUsers : { name : userList[0].name , personalChatRelId : savedata._id , userId : userList[0].userId, email : userList[0].email }} } ,function(err,dt){
                            if(err)
                                console.log("there is something wrong err");
                           });
                            
                        });

                    });
                       
                }

            }
            else
            {   
                Users.find({ email : data.email }).exec(function(err,frienddata){
                relatedIds = [{name : finddata[0].username, userId : finddata[0]._id ,email : finddata[0].email},{name : frienddata[0].username, userId : frienddata[0]._id, email : frienddata[0].email}]
                var chatObj = {messages:{ msg: data.msg , to : finddata[0].username , from : userWithNames[socket.userId] },relatedIds:relatedIds};
                personalChat = new PersonalChat(chatObj);   
                personalChat.save(function(err,savedata){
                    if(err)
                    {
                        console.log('message not save in db');
                    }
                    var userList = savedata.relatedIds; 
                        Users.update({ _id : userList[0].userId },
                       {$push : { "personalChatUsers" : { name : userList[1].name , personalChatRelId : savedata._id,userId : userList[1].userId, email : userList[1].email }} } ,function(err,dt){
                        if(err)
                            console.log("there is something wrong err");
                       });

                       Users.update({ _id : userList[1].userId },
                       {$push : { personalChatUsers : { name : userList[0].name , personalChatRelId : savedata._id , userId : userList[0].userId, email : userList[0].email }} } ,function(err,dt){
                        if(err)
                            console.log("there is something wrong err");
                       });


                        
                    });
                });
            }
        });


        var obj = {msg:data.msg,username:userWithNames[socket.userId],userId:socket.userId,email:socket.userEmail};
        onlineUsers[data.friendId].emit('message from friend',obj);
    });
    socket.on('disconnect',function(){
        delete onlineUsers[socket.userId];
        delete userWithNames[socket.userId];
        userCredentials.forEach(function(ele,index){
            if(ele.email == socket.email)
                delete userCredentials[index];
        });
        socket.emit("remove user", socket.userId);
        socket.broadcast.emit('remove user',socket.userId);
        socket.emit('online user numbers',(Object.keys(userWithNames)).length);
        socket.broadcast.emit('online user numbers',(Object.keys(userWithNames)).length);
    });
});

server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});