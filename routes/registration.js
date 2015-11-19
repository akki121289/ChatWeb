var NewUser = require('../models/newUser'),
	Login = require('../models/login');

module.exports = function(server){

	server.route({
	    method: 'GET',
	    path: '/',
	    handler: function (request, reply) {
	        reply.view('index');
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/userlist',
	    handler: function (request, reply) {
	        reply.view('userlist');
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/login',
	    handler: function (request, reply) {
	        reply.view('login');

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
	        reply.view('registration');

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
	            			reply.redirect('/login');
	            			// reply({
			             //        statusCode: 201,
			             //        message: 'User Saved Successfully'
			             //    });
	            		}
	            	});
	            }
        	});
	    
		}
	});
}