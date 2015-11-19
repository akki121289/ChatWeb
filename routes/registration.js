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
	    method: 'GET',
	    path: '/registration',
	    handler: function (request, reply) {
	        reply.view('registration.html');
	    }
	});
}