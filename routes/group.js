var Groups = require('../models/groups'),
	Users = require('../models/users'),
	bcrypt = require('bcryptjs'),
	fs = require('fs');

module.exports = function(server){

server.route({
	    method: 'GET',
	    path: '/group/create',
	    handler: function (req, reply) {
	    	var re = new RegExp(req.query.createGroupText, 'i');
	    	var userName = req.session._store.username;
	    	Users.find( { $and : [ {username: { $regex: re }},{ username: { $ne : userName}}] },function(error, data){
				if(error){
					reply("something went wrong");
				}else{
					reply(data);
				}
			});
	    }
	});


server.route({
	    method: 'POST',
	    path: '/group/create/db',
	    handler: function (req, reply) {
	    	var membersArray = [];
	    	var membersIdArray = req.payload.createHiddenInput.split(',');
	    	membersIdArray.forEach(function(ele,index){
	    		var memberObj = { "id" : ele };
	    		membersArray.push(memberObj);
	    	})

	    	membersArray.push({"id" : req.session._store._id });
	    	membersIdArray.push(req.session._store._id);
	    	var userObj = {
	    		"groupName": req.payload.groupName,
	    		"creator": {
	    			"name" : req.session._store.username,
	    			"id" : req.session._store._id
	    		},
	    		"members": membersArray
	    	};

	    	var groups = new Groups(userObj);
	    	groups.save(function(err,data){
	    		if(!err)
	    		{
	    			Users.update({'_id' : { $in : membersIdArray } },
	    				{$push : { groups : { "groupId" : data._id , "groupName" : data.groupName }}},{multi: true}).exec();
	    		}
	    	});
	    	reply.redirect('/userlist');
	    }
	});
}