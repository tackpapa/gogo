const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const donationSchema = new mongoose.Schema({

  user:{type:Schema.Types.ObjectId, ref: 'User'},
  date:{type:Date, default:Date.now },
  donation:Number,
  question:{type:Schema.Types.ObjectId, ref:'Question'}
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
