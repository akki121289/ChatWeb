var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var personalChat = Schema({
  
  relatedIds: [
  {
    userId: String,
    name: String,
    email: String
  }],
  messages: [
  {
    title: {type: String, default: 'message'},
    date : { type: Date, default: Date.now },
    msg: {type: String, required: true}
  }]
});

module.exports = mongoose.model('PersonalChat',personalChat);

