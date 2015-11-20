var Users = require('../models/users');

module.exports = function(server){

	server.route({
	    method: 'GET',
	    path: '/',
	    handler: function (request, reply) {
	        reply.view('index');
	    }
	});
	//@ this route is used for register the institute
	server.route({
		path:'/user',
		method:'GET',
		handler: function(request, reply){
			Users.find({status:true},function(error, data){
				if(error){
					reply("something went wrong");
				}else{
					reply(data);
				}
			});
		}
	});

	server.route({
	    method: 'GET',
	    path: '/userlist',
	    handler: function (request, reply) {
	    	console.log(request.session);
	        reply.view('userlist');
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/login',
	    handler: function (request, reply) {
	    	request.session.set('emilId','aa@gmail.com');
	        reply.view('login');

	    }
	});

	server.route({
	    method: 'POST',
	    path: '/login',
	    handler: function (request, reply) {
	    	// console.log(username:request.payload.username,password:request.payload.password);
	    	Users.find({email:request.payload.username,password:request.payload.password},function(err, data){
	    		console.log(data);
	    		if(err){
	    			reply("some thing went wrong");
	    		}else if(data.length){	   	    			 				    							
					request.session.set('email',request.payload.username);
					Users.update({"email" : request.payload.username }, { $set: { "status": true }}).exec();
	    			reply.redirect('/userlist');
	    		}else{
	    			reply("user not found");
	    		}
	    	});
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/registration',
	    handler: function (request, reply) {
	    	console.log(request.session);
	        reply.view('registration');

	    }
	});

	server.route({
	    method: 'POST',
	    path: '/registration',
	    handler: function (request, reply) {
	    	if(request.payload.password === request.payload.passwordconfirm){
	    		delete request.payload.passwordconfirm;
	    	}
	    	// console.log(request.payload);
	    	var users = new Users(request.payload);
	    	users.save(function (error) {
	            if (error) {
	                reply({
	                    statusCode: 503,
	                    message: error
	                });
   				}else{
    					reply.redirect('/login');
    				 }
	            		
        	});
		}
	});
}