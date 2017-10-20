const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const exchangeSchema = new mongoose.Schema({

  user:{type:Schema.Types.ObjectId, ref: 'User'},
  date:{type:Date, default:Date.now },
  amount:Number,
});

const Exchange = mongoose.model('Exchange', exchangeSchema);

module.exports = Exchange;
