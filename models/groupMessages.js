var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupMessages = Schema({
	groupName : String,
	groupId : String,
	type : {type: String, default: 'message'},
	from : String,
	createAt : {type : String , default : Date.now},
	msg : String,
	image : String,
	audio : String,
	video : String,
});
module.exports = mongoose.model('groupMessages', groupMessages);