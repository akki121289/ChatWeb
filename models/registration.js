var mongoose = require('mongoose');

var schema = mongoose.schema;

var Registration = schema({
	username : String,
	email: String,
	password : String,
	gender : String,
	country : String
});

module.exports = mongoose.model('registration', Registration);