var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Login = new Schema({
	username:String,
	password:String
});

module.exports = mongoose.model("login",Login);