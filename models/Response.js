const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const responseSchema = new mongoose.Schema({

  user:{type:Schema.Types.ObjectId, ref: 'User'},
  question:{type:Schema.Types.ObjectId, ref: 'Question'},
  date:{type:Date, default:Date.now },
  response:String,
  file:String,
  donate: {type:Boolean, default:false},
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
