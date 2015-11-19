var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NewUser = Schema({
	username : String,
	email: String,
	password : String,
	gender : String,
	country : String
});

module.exports = mongoose.model('newUser', NewUser);