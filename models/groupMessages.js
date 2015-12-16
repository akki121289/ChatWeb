var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupMessages = Schema({
	groupName : String,
	groupId : String,
	from : String,
	createAt : {type : String , default : Date.now},
	msg : String
});
module.exports = mongoose.model('groupMessages', groupMessages);