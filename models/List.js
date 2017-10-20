const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const listSchema = new mongoose.Schema({

  user:String,
  username:String,
  date:{type:Date, default:Date.now },
  name:String,
  description:String,
  upvote:Number,
  downvote:Number,
  wish:[{type:String}],
  live:{type:Boolean, default:false}
});

const List = mongoose.model('List', listSchema);

module.exports = List;
