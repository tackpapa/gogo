const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const listSchema = new mongoose.Schema({

  user:String,
  realuser:{type:Schema.Types.ObjectId, ref:'User'},
  username:String,
  date:{type:Date, default:Date.now },
  name:String,
  description:String,
  upvote:{ type: Number, default: 1 },
  downvote:{ type: Number, default: 1 },
  wish:[{type:String}],
  comment:[{type:Schema.Types.ObjectId, ref:'Comment'}],
  live:{type:Boolean, default:false}
});

const List = mongoose.model('List', listSchema);

module.exports = List;
