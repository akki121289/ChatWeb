var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groups =  Schema({
	groupName : {type : String , required : true },
	creator : {
		name : String,
		id : {type : String , required : true }
	},
	members : [{
		name : String,
		id	: String
	}],
	createAt : {type : String , default : Date.now } 
});
module.exports = mongoose.model('groups',groups);


