const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const purchaseSchema = new mongoose.Schema({

  user:{type:Schema.Types.ObjectId, ref: 'User'},
  date:{type:Date, default:Date.now },
  package:String,
  quantity: Number,
  total:Number
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
