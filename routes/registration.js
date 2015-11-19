var NewUser = require('../models/newUser'),
	Login = require('../models/login');

module.exports = function(server){
	//@ this route is used for register the institute
	server.route({
		path:'/second',
		method:'GET',
		handler: function(request, reply){
			reply("OKKKKKKKKK1");
		}
	});
	// @   this route for get the university detail
	server.route({
		path:'/first',
		method:'GET',
		handler: function(request, reply){
			reply("okkkk");
		}
	});

	server.route({
	    method: 'GET',
	    path: '/hello',
	    handler: function (request, reply) {
	        reply.view('index.html');
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/login',
	    handler: function (request, reply) {
	        reply.view('login.html');

	    }
	});

	server.route({
	    method: 'POST',
	    path: '/login',
	    handler: function (request, reply) {
	    	console.log(request.payload);
	    	Login.find({username:request.payload.username,password:request.payload.password},function(err, data){
	    		if(err){
	    			reply("some thing went wrong");
	    		}else if(data.length){
	    			reply(data);
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
	        reply.view('registration.html');

	    }
	});

	server.route({
	    method: 'POST',
	    path: '/registration',
	    handler: function (request, reply) {
	    	console.log(request.payload);
	    	if(request.payload.password === request.payload.passwordconfirm){
	    		delete request.payload.passwordconfirm;
	    	}
	    	console.log(request.payload);
	    	var newUser = new NewUser(request.payload);
	    	newUser.save(function (error) {
	            if (error) {
	                reply({
	                    statusCode: 503,
	                    message: error
	                });
	            } else {
	            	var addLogin = Login({username:request.payload.email,password:request.payload.password});
	            	addLogin.save(function (error){
	            		if(error){
	            			reply({
			                    statusCode: 503,
			                    message: error
			                });
	            		}else{
	            			reply({
			                    statusCode: 201,
			                    message: 'User Saved Successfully'
			                });
	            		}
	            	});
	            }
        	});
	    
		}
	});
}