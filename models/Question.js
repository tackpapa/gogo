 const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({

  user:{type:Schema.Types.ObjectId, ref: 'User'},
  context:String,
  date:{type:Date, default:Date.now },
  price: { type: Number, default: 0},
  target:Number,
  private: {type:Boolean, default:false},
  answered: {type:Boolean, default:false},
  rejected: {type:Boolean, default:false},
  response:[{type:Schema.Types.ObjectId, ref: 'Response'}]
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
