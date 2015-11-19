var NewUser = require('../models/newUser'),
	Login = require('../models/login'),
	Users = require('../models/users');

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
	    	Login.find({username:request.payload.username,password:request.payload.password},function(err, data){
	    		if(err){
	    			reply("some thing went wrong");
	    		}else if(data.length){	    				    							
					request.session.set('email',request.payload.username);
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
	            			var user = Users({username:request.payload.email,email:request.payload.email,status:true});
	            			user.save(function(error){
	            				if(error){
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
        	});
		}
	});
}