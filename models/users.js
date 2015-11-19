var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Users = Schema({
	username : String,
	email: String,
	status: Boolean
});

module.exports = mongoose.model('users', Users);