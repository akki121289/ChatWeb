var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var personalMessage = Schema({
	from: String,
	name:String,
	friend:String,
	to: String,
	message: String,
	status:{type:String, default:'send'},
	createdAt : {type:String, default:Date.now}
});
// status : 'send' : when message be send but not deliver
//			'deliver': send and deliver to friend but not seen
//          'seen': send ,deliver and seen by friend
module.exports = mongoose.model('personalMessage',personalMessage);