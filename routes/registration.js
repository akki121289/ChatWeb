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
	    path: '/registration',
	    handler: function (request, reply) {
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