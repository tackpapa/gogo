const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({

  user:String,
  realuser:{type:Schema.Types.ObjectId, ref:'User'},
  list:{type:Schema.Types.ObjectId, ref:'List'},
  username:String,
  date:{type:Date, default:Date.now },
  description:String,
  upvote:{ type: Number, default: 1 },
  downvote:{ type: Number, default: 1 },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
